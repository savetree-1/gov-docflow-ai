import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { fetchChatHistory } from "../../api/chatAPI";

/****** Initialize socket with proper configuration ******/
let socket = null;

const getSocket = () => {
  if (!socket) {
    socket = io("http://localhost:5001", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });
  }
  return socket;
};

const ALL_DEPARTMENTS = [
  "Agriculture",
  "Finance",
  "Health",
  "Education",
  "Infrastructure",
  "Meteorology",
];

const OfficerChat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState("");
  const [messageCache, setMessageCache] = useState({}); // Store messages by roomId
  const scrollRef = useRef();

  const { user } = useSelector((state) => state.authReducer);
  const { token } = useSelector((state) => state.tokenReducer);
  const userData = user?.data || user || {};

  /****** 1. Role Logic ******/
  let rawRole = (userData.role || "").toLowerCase();
  let myRole = rawRole.replace(/_/g, "");
  if (!myRole && userData.firstName === "Super") myRole = "superadmin";
  if (
    myRole !== "superadmin" &&
    (myRole.includes("admin") || (userData.email || "").includes("admin"))
  )
    myRole = "admin";

  /****** 2. Clean Department Name ******/
  let rawDept = userData.department || userData.dept || "General";
  let deptName = "General";

  if (typeof rawDept === "object" && rawDept !== null) {
    deptName =
      rawDept.departmentName || rawDept.name || rawDept.dept || "General";
  } else {
    deptName = String(rawDept);
  }

  /****** Remove 'Department' from name and normalize ******/
  deptName = deptName.replace(/department/gi, "").replace(/&/g, "").replace(/\s+/g, " ").trim();
  
  /****** Match against known departments (Weather & Meteorology -> Meteorology) ******/
  const normalizedDept = ALL_DEPARTMENTS.find(dept => 
    deptName.toLowerCase().includes(dept.toLowerCase())
  ) || deptName;
  
  /****** Capitalize first letter of each word ******/
  const myDept = normalizedDept.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ').trim();
  const myName = userData.name || userData.firstName || "User";

  /****** Create proper display name for chat ******/
  const getDisplayName = () => {
    if (myRole === "superadmin") {
      return "Super Admin";
    } else if (myRole === "admin") {
      return `${myDept} Admin`;
    }
    return myName;
  };
  
  const myDisplayName = getDisplayName();

  /****** Normalize sender names for display (handles old messages with short names) ******/
  const normalizeSenderName = (senderName) => {
    if (!senderName) return "Unknown";
    
    /****** If it's already a proper format, return it ******/
    if (senderName.includes("Admin")) return senderName;
    
    /****** Convert short names to proper display names ******/
    if (senderName === "Super") return "Super Admin";
    
    /****** Check if it matches any department (for old messages like "Weather" → "Meteorology Admin") ******/
    const matchedDept = ALL_DEPARTMENTS.find(dept => 
      senderName.toLowerCase().includes(dept.toLowerCase()) ||
      dept.toLowerCase().includes(senderName.toLowerCase())
    );
    
    if (matchedDept) {
      return `${matchedDept} Admin`;
    }
    
    /****** If it's a department name without "Admin", add it ******/
    if (ALL_DEPARTMENTS.some(dept => dept.toLowerCase() === senderName.toLowerCase())) {
      return `${senderName} Admin`;
    }
    
    return senderName;
  };

  /****** 3. Contacts ******/
  const getContacts = () => {
    if (myRole === "superadmin") {
      return ALL_DEPARTMENTS;
    } else if (myRole === "admin") {
      const others = ALL_DEPARTMENTS.filter(
        (d) => d.toLowerCase() !== myDept.toLowerCase()
      );
      return ["Super Admin", ...others];
    }
    return [];
  };
  const contacts = getContacts();

  /****** 4. Auto-Select ******/
  useEffect(() => {
    if (myRole === "admin" && selectedPartner === "") {
      setSelectedPartner("Super Admin");
    }
  }, [myRole, selectedPartner]);

  /****** 5. Room ID ******/
  const getRoomId = (partner) => {
    if (!partner) return null;
    const cleanPartner = partner.replace(/department/gi, "").replace(/&/g, "").trim();

    if (myRole !== "superadmin" && cleanPartner === "Super Admin") {
      /****** Department admin talking to Super Admin ******/
      return `SuperAdmin_${myDept.replace(/\s+/g, '')}`;
    }
    if (myRole === "superadmin") {
      /****** Super admin talking to department ******/
      return `SuperAdmin_${cleanPartner.replace(/\s+/g, '')}`;
    } else {
      /****** Department to department (if applicable) ******/
      const dept1 = myDept.replace(/\s+/g, '');
      const dept2 = cleanPartner.replace(/\s+/g, '');
      const participants = [dept1, dept2].sort();
      return `${participants[0]}_${participants[1]}`;
    }
  };

  const roomId = getRoomId(selectedPartner);

  /****** Debug logging ******/
  console.log('Chat Debug:', {
    myRole,
    myDept,
    myName,
    selectedPartner,
    roomId
  });

  /****** 6. MAIN SOCKET LOOP ******/
  useEffect(() => {
    if (!roomId) return;

    const socket = getSocket();

    /****** Load cached messages for this room immediately (prevents reset) ******/
    const cached = messageCache[roomId] || [];
    setMessages(cached);

    console.log(`SWITCHING TO ROOM: ${roomId}`);
    socket.emit("join_room", roomId);

    const loadHistory = async () => {
      try {
        const history = await fetchChatHistory(roomId, token);
        if (Array.isArray(history)) {
          /****** Create unique message list by timestamp ******/
          const msgMap = new Map();
          history.forEach(msg => msgMap.set(msg.timestamp, msg));
          const uniqueMsgs = Array.from(msgMap.values()).sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          );
          
          setMessages(uniqueMsgs);
          /****** Update cache ******/
          setMessageCache(prev => ({ ...prev, [roomId]: uniqueMsgs }));
        }
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    };
    loadHistory();

    const handleReceiveMessage = (data) => {
      console.log("RECEIVED MSG:", data);
      /****** Only process messages for the current room ******/
      if (data.adminId !== roomId) return;
      
      setMessages((prev) => {
        if (prev.some((m) => m.timestamp === data.timestamp)) return prev;
        const updated = [...prev, data];
        /****** Update cache ******/
        setMessageCache(cache => ({ ...cache, [roomId]: updated }));
        return updated;
      });
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [roomId, token]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === "" || !roomId) return;

    const socket = getSocket();
    const messageData = {
      adminId: roomId,
      senderName: myDisplayName,
      message: message,
      timestamp: new Date().toISOString(),
    };

    console.log("SENDING MSG:", messageData);
    socket.emit("send_message", messageData);
    
    setMessages((prev) => {
      const updated = [...prev, messageData];
      // Update cache
      setMessageCache(cache => ({ ...cache, [roomId]: updated }));
      return updated;
    });
    setMessage("");
  };

  if (myRole !== "superadmin" && myRole !== "admin") return null;
  
  /****** Export chat summary function ******/
  const exportChatSummary = () => {
    if (messages.length === 0) {
      alert("No messages to export");
      return;
    }

    const chatPartner = selectedPartner || "Unknown";
    const timestamp = new Date().toISOString().split('T')[0];
    
    /****** Create formatted text summary ******/
    let summary = `Chat Summary: ${myDisplayName} ↔ ${chatPartner}\n`;
    summary += `Exported: ${new Date().toLocaleString()}\n`;
    summary += `Total Messages: ${messages.length}\n`;
    summary += `Room ID: ${roomId}\n`;
    summary += `${'='.repeat(60)}\n\n`;
    
    messages.forEach((msg, index) => {
      const time = new Date(msg.timestamp).toLocaleString();
      summary += `[${time}] ${msg.senderName}:\n`;
      summary += `${msg.message}\n\n`;
    });
    
    /****** Create downloadable file ******/
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-summary-${myDept.replace(/\s+/g, '-')}-${timestamp}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const clearChat = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete all messages for this department?"
      )
    )
      return;

    try {
      setMessages([]);
      alert("Chat cleared locally. (To delete from DB, use MongoDB Compass)");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      style={{
        height: "calc(100vh - 180px)",
        maxHeight: "800px",
        width: "100%",
        backgroundColor: "#ffffff",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 8px 40px rgba(0, 0, 0, 0.08)",
        border: "1px solid rgba(0, 0, 0, 0.06)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #2B5D59 0%, #1e4340 100%)",
          padding: "20px 24px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          flexShrink: 0,
        }}
      >
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          marginBottom: "16px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#4ade80",
              animation: "pulse 2s infinite",
              boxShadow: "0 0 12px rgba(74, 222, 128, 0.6)"
            }} />
            <h3 style={{ 
              margin: 0, 
              fontSize: "18px", 
              fontWeight: "600",
              color: "#ffffff",
              letterSpacing: "-0.3px"
            }}>
              {myRole === "superadmin" ? "Super Admin Chat" : `${myDept} Chat`}
            </h3>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {myRole === "admin" && (
              <button
                onClick={exportChatSummary}
                disabled={messages.length === 0}
                style={{
                  background: messages.length === 0 
                    ? "rgba(255, 255, 255, 0.08)" 
                    : "rgba(255, 255, 255, 0.15)",
                  border: "none",
                  borderRadius: "10px",
                  padding: "8px 14px",
                  color: "#ffffff",
                  fontSize: "13px",
                  cursor: messages.length === 0 ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontWeight: "500",
                  opacity: messages.length === 0 ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (messages.length > 0) {
                    e.target.style.background = "rgba(255, 255, 255, 0.25)";
                    e.target.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = messages.length === 0 
                    ? "rgba(255, 255, 255, 0.08)" 
                    : "rgba(255, 255, 255, 0.15)";
                  e.target.style.transform = "translateY(0)";
                }}
                title="Export chat summary"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Export
              </button>
            )}
            {myRole === "superadmin" && (
              <button
                onClick={() => setMessages([])}
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  border: "none",
                  borderRadius: "10px",
                  padding: "8px 12px",
                  color: "#ffffff",
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  backdropFilter: "blur(10px)"
                }}
                onMouseEnter={(e) => e.target.style.background = "rgba(255, 255, 255, 0.25)"}
                onMouseLeave={(e) => e.target.style.background = "rgba(255, 255, 255, 0.15)"}
                title="Clear messages"
              >
                <i className="fas fa-trash" style={{ fontSize: "12px" }}></i>
              </button>
            )}
          </div>
        </div>
        
        <select
          value={selectedPartner}
          onChange={(e) => setSelectedPartner(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            fontSize: "15px",
            fontWeight: "500",
            color: "#1f2937",
            backgroundColor: "#ffffff",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            outline: "none",
            appearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 16px center",
            paddingRight: "40px",
            transition: "all 0.2s ease",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)"
          }}
        >
          <option value="">Select who to chat with...</option>
          {contacts.map((contact, index) => (
            <option key={index} value={contact}>
              {contact === "Super Admin" ? `Super Admin` : `${contact} Department`}
            </option>
          ))}
        </select>
      </div>

      {/* Messages Area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px",
          backgroundColor: "#f9fafb",
          minHeight: 0,
        }}
      >
        {!selectedPartner ? (
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center",
            height: "100%",
            color: "#9ca3af"
          }}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" style={{ marginBottom: "16px", opacity: 0.4 }}>
              <path d="M8 10H8.01M12 10H12.01M16 10H16.01M9 16H5C3.34315 16 2 14.6569 2 13V7C2 5.34315 3.34315 4 5 4H19C20.6569 4 22 5.34315 22 7V13C22 14.6569 20.6569 16 19 16H14L9 21V16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p style={{ margin: 0, fontSize: "15px", fontWeight: "500" }}>Select a contact to start chatting</p>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center",
            height: "100%",
            color: "#9ca3af"
          }}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" style={{ marginBottom: "16px", opacity: 0.4 }}>
              <path d="M3 8L10.89 13.26C11.5395 13.6728 12.4605 13.6728 13.11 13.26L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p style={{ margin: 0, fontSize: "15px", fontWeight: "500" }}>
              Connected with {selectedPartner}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: "13px", fontWeight: "400", color: "#d1d5db" }}>
              Send a message to start the conversation
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const normalizedSenderName = normalizeSenderName(msg.senderName);
            const isMe = msg.senderName === myDisplayName || msg.senderName === myName || normalizedSenderName === myDisplayName;
            const displaySenderName = normalizedSenderName;
            const initials = displaySenderName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
            const showAvatar = index === 0 || messages[index - 1]?.senderName !== msg.senderName;
            
            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  flexDirection: isMe ? "row-reverse" : "row",
                  alignItems: "flex-end",
                  marginBottom: showAvatar ? "16px" : "4px",
                  gap: "10px",
                  animation: "fadeInUp 0.3s ease"
                }}
              >
                {/* Avatar */}
                {showAvatar ? (
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: isMe 
                      ? "linear-gradient(135deg, #2B5D59 0%, #1e4340 100%)"
                      : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: "700",
                    flexShrink: 0,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    border: "2px solid #ffffff"
                  }}>
                    {initials}
                  </div>
                ) : (
                  <div style={{ width: "36px", flexShrink: 0 }} />
                )}

                {/* Message Content */}
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isMe ? "flex-end" : "flex-start",
                  maxWidth: "65%"
                }}>
                  {/* Sender name - only show when avatar is shown */}
                  {showAvatar && !isMe && (
                    <div style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#6b7280",
                      marginBottom: "4px",
                      marginLeft: "12px",
                      letterSpacing: "0.3px"
                    }}>
                      {displaySenderName}
                    </div>
                  )}
                  
                  {/* Message bubble */}
                  <div
                    style={{
                      padding: "12px 18px",
                      borderRadius: isMe 
                        ? "20px 20px 4px 20px"
                        : "20px 20px 20px 4px",
                      backgroundColor: isMe ? "#2B5D59" : "#ffffff",
                      color: isMe ? "#ffffff" : "#1f2937",
                      boxShadow: isMe 
                        ? "0 2px 12px rgba(43, 93, 89, 0.25)" 
                        : "0 2px 12px rgba(0, 0, 0, 0.08)",
                      border: isMe ? "none" : "1px solid rgba(0, 0, 0, 0.05)",
                      position: "relative",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = isMe 
                        ? "0 4px 16px rgba(43, 93, 89, 0.35)" 
                        : "0 4px 16px rgba(0, 0, 0, 0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = isMe 
                        ? "0 2px 12px rgba(43, 93, 89, 0.25)" 
                        : "0 2px 12px rgba(0, 0, 0, 0.08)";
                    }}
                  >
                    <div style={{ 
                      fontSize: "15px", 
                      lineHeight: "1.5",
                      fontWeight: "400",
                      wordBreak: "break-word"
                    }}>
                      {msg.message}
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div style={{
                    fontSize: "11px",
                    color: "#9ca3af",
                    marginTop: "4px",
                    marginLeft: isMe ? "0" : "12px",
                    marginRight: isMe ? "12px" : "0",
                    fontWeight: "500",
                    letterSpacing: "0.2px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {isMe && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.6 }}>
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: "20px 24px",
          backgroundColor: "#ffffff",
          borderTop: "1px solid rgba(0, 0, 0, 0.06)",
          flexShrink: 0,
          boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.03)"
        }}
      >
        <form onSubmit={sendMessage} style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <input
              type="text"
              placeholder={selectedPartner ? "Type your message..." : "Select a contact first"}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!selectedPartner}
              style={{
                width: "100%",
                padding: "16px 20px",
                fontSize: "15px",
                color: "#1f2937",
                backgroundColor: "#f9fafb",
                border: "2px solid transparent",
                borderRadius: "16px",
                outline: "none",
                transition: "all 0.2s ease",
                fontWeight: "400",
                boxShadow: "0 0 0 0 rgba(43, 93, 89, 0)"
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = "#ffffff";
                e.target.style.borderColor = "#2B5D59";
                e.target.style.boxShadow = "0 0 0 4px rgba(43, 93, 89, 0.08)";
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = "#f9fafb";
                e.target.style.borderColor = "transparent";
                e.target.style.boxShadow = "0 0 0 0 rgba(43, 93, 89, 0)";
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!selectedPartner || !message.trim()}
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              border: "none",
              background: (!selectedPartner || !message.trim()) 
                ? "linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)" 
                : "linear-gradient(135deg, #2B5D59 0%, #1e4340 100%)",
              color: "#ffffff",
              cursor: (!selectedPartner || !message.trim()) ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: (!selectedPartner || !message.trim()) 
                ? "0 2px 8px rgba(0, 0, 0, 0.1)" 
                : "0 4px 14px rgba(43, 93, 89, 0.35)",
              flexShrink: 0,
              transform: "scale(1)"
            }}
            onMouseEnter={(e) => {
              if (selectedPartner && message.trim()) {
                e.target.style.transform = "scale(1.08) rotate(8deg)";
                e.target.style.boxShadow = "0 8px 20px rgba(43, 93, 89, 0.45)";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1) rotate(0deg)";
              e.target.style.boxShadow = (!selectedPartner || !message.trim()) 
                ? "0 2px 8px rgba(0, 0, 0, 0.1)" 
                : "0 4px 14px rgba(43, 93, 89, 0.35)";
            }}
            onMouseDown={(e) => {
              if (selectedPartner && message.trim()) {
                e.target.style.transform = "scale(0.95)";
              }
            }}
            onMouseUp={(e) => {
              if (selectedPartner && message.trim()) {
                e.target.style.transform = "scale(1.08) rotate(8deg)";
              }
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ transform: "translateX(1px)" }}>
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>
      </div>

      {/* Add keyframe animation */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default OfficerChat;
