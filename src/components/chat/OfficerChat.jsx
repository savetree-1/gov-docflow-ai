import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { fetchChatHistory } from "../../api/chatAPI";

const socket = io("http://localhost:5001");

const ALL_DEPARTMENTS = [
  "Agriculture",
  "Finance",
  "Health",
  "Education",
  "Infrastructure",
];

const OfficerChat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState("");
  const scrollRef = useRef();

  const { user } = useSelector((state) => state.authReducer);
  const { token } = useSelector((state) => state.tokenReducer);
  const userData = user?.data || user || {};

  // 1. Role Logic
  let rawRole = (userData.role || "").toLowerCase();
  let myRole = rawRole.replace(/_/g, "");
  if (!myRole && userData.firstName === "Super") myRole = "superadmin";
  if (
    myRole !== "superadmin" &&
    (myRole.includes("admin") || (userData.email || "").includes("admin"))
  )
    myRole = "admin";

  // 2. Clean Department Name
  let rawDept = userData.department || userData.dept || "General";
  let deptName = "General";

  if (typeof rawDept === "object" && rawDept !== null) {
    deptName =
      rawDept.departmentName || rawDept.name || rawDept.dept || "General";
  } else {
    deptName = String(rawDept);
  }

  // Remove 'Department' from name
  deptName = deptName.replace(/department/gi, "").trim();
  const myDept =
    deptName.charAt(0).toUpperCase() + deptName.slice(1).toLowerCase();
  const myName = userData.name || userData.firstName || "User";

  // 3. Contacts
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

  // 4. Auto-Select
  useEffect(() => {
    if (myRole === "admin" && selectedPartner === "") {
      setSelectedPartner("Super Admin");
    }
  }, [myRole, selectedPartner]);

  // 5. Room ID
  const getRoomId = (partner) => {
    if (!partner) return null;
    const cleanPartner = partner.replace(/department/gi, "").trim();

    if (myRole !== "superadmin" && cleanPartner === "Super Admin") {
      return `SuperAdmin_${myDept}`;
    }
    if (myRole === "superadmin") {
      return `SuperAdmin_${cleanPartner}`;
    } else {
      const participants = [myDept, cleanPartner].sort();
      return `${participants[0]}_${participants[1]}`;
    }
  };

  const roomId = getRoomId(selectedPartner);

  // 6. MAIN SOCKET LOOP
  useEffect(() => {
    if (!roomId) return;

    // 🧹 FIX: Clear old messages instantly when switching rooms
    setMessages([]);

    console.log(`🔌 SWITCHING TO ROOM: ${roomId}`);
    socket.emit("join_room", roomId);

    const loadHistory = async () => {
      try {
        const history = await fetchChatHistory(roomId, token);
        if (Array.isArray(history)) {
          setMessages((prev) => {
            // Combine history with any new messages that arrived during the fetch
            const combined = [...history, ...prev];
            // Remove duplicates
            const uniqueMsgs = Array.from(
              new Set(combined.map((a) => a.timestamp))
            ).map((timestamp) =>
              combined.find((a) => a.timestamp === timestamp)
            );
            return uniqueMsgs.sort(
              (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
            );
          });
        }
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    };
    loadHistory();

    const handleReceiveMessage = (data) => {
      console.log("📩 RECEIVED MSG:", data);
      setMessages((prev) => {
        if (prev.some((m) => m.timestamp === data.timestamp)) return prev;
        return [...prev, data];
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

    const messageData = {
      adminId: roomId,
      senderName: myName,
      message: message,
      timestamp: new Date().toISOString(),
    };

    socket.emit("send_message", messageData);
    setMessages((prev) => [...prev, messageData]);
    setMessage("");
  };

  if (myRole !== "superadmin" && myRole !== "admin") return null;
  // Add this inside the component, before return()
  const clearChat = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete all messages for this department?"
      )
    )
      return;

    try {
      // You need to create this endpoint in your backend first,
      // OR just emit a socket event if your backend supports it.
      // For now, let's just clear the screen locally:
      setMessages([]);
      alert("Chat cleared locally. (To delete from DB, use MongoDB Compass)");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className="card shadow mb-4 d-flex flex-column"
      style={{
        height: "600px",
        width: "100%",
        backgroundColor: "white",
      }}
    >
      <div
        className="card-header py-3 d-flex flex-row align-items-center justify-content-between flex-shrink-0"
        style={{ backgroundColor: "#2B5D59", color: "white" }}
      >
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="m-0 font-weight-bold" style={{ color: "white" }}>
            <i className="fas fa-comments mr-2"></i>{" "}
            {myRole === "superadmin" ? "Super Admin Chat" : `${myDept} Chat`}
          </h6>
          <span className="badge badge-light" style={{ color: "#F44336" }}>
            Live
          </span>
          {myRole === "superadmin" && (
            <button
              onClick={() => setMessages([])}
              className="btn btn-sm btn-danger ml-2"
              title="Clear Screen (Refresh to bring back history)"
            >
              <i className="fas fa-trash"></i>
            </button>
          )}
        </div>
        <select
          className="form-control form-control-sm"
          value={selectedPartner}
          onChange={(e) => setSelectedPartner(e.target.value)}
          style={{ borderRadius: "15px", color: "#3a3b45" }}
        >
          <option value="">Select who to chat with...</option>
          {contacts.map((contact, index) => (
            <option key={index} value={contact}>
              {contact === "Super Admin"
                ? "⚡ Super Admin"
                : `🏛️ ${contact} Dept`}
            </option>
          ))}
        </select>
      </div>

      <div
        className="card-body"
        style={{
          flex: "1",
          overflowY: "auto",
          minHeight: "0",
          backgroundColor: "#f8f9fc",
        }}
      >
        {!selectedPartner ? (
          <div className="text-center mt-5" style={{ color: "#858796" }}>
            <i className="fas fa-hand-point-up fa-3x mb-3"></i>
            <p>Please select a user above.</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center mt-5" style={{ color: "#858796" }}>
            <i className="fas fa-paper-plane fa-3x mb-3"></i>
            <p>Chat linked with {selectedPartner}!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderName === myName;
            return (
              <div
                key={index}
                className={`d-flex flex-column mb-3 ${
                  isMe ? "align-items-end" : "align-items-start"
                }`}
              >
                <div
                  className={`p-3 shadow-sm`}
                  style={{
                    maxWidth: "75%",
                    borderRadius: "15px",
                    borderBottomRightRadius: isMe ? "0" : "15px",
                    borderBottomLeftRadius: isMe ? "15px" : "0",
                    backgroundColor: isMe ? "#2B5D59" : "#ffffff",
                    color: isMe ? "#ffffff" : "#3a3b45",
                  }}
                >
                  <small
                    className="d-block font-weight-bold mb-1"
                    style={{
                      fontSize: "0.75rem",
                      color: isMe ? "#e2e6ea" : "#4e73df",
                    }}
                  >
                    {msg.senderName}
                  </small>
                  <span style={{ fontSize: "0.95rem" }}>{msg.message}</span>
                </div>
                <small
                  className="mt-1 mr-1"
                  style={{
                    fontSize: "0.65rem",
                    color: "#858796",
                    fontWeight: "bold",
                  }}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </small>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      <div className="card-footer bg-white border-top flex-shrink-0">
        <form onSubmit={sendMessage} className="input-group">
          <input
            type="text"
            className="form-control bg-light border-0 small"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!selectedPartner}
            style={{
              height: "45px",
              borderRadius: "20px 0 0 20px",
              color: "#3a3b45",
            }}
          />
          <div className="input-group-append">
            <button
              className="btn"
              type="submit"
              disabled={!selectedPartner}
              style={{
                backgroundColor: "#2B5D59",
                color: "white",
                borderRadius: "0 20px 20px 0",
                padding: "12px 22px",
                fontSize: "18px",
                minHeight: "52px",
              }}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfficerChat;
