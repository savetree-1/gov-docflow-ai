// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * Pravah Document Audit Trail
 * Immutable record of document actions for government accountability
 */
contract PravahAuditTrail {
    
    struct ActionRecord {
        string documentId;
        string action;
        string actor;
        string role;
        string department;
        string documentHash;
        uint256 timestamp;
        string previousActionHash;
    }
    
    // Mapping: documentId => array of actions
    mapping(string => ActionRecord[]) public documentActions;
    
    // Event emitted when action is logged
    event ActionLogged(
        string indexed documentId,
        string action,
        string actor,
        uint256 timestamp,
        string documentHash
    );
    
    /**
     * Log a document action (immutable)
     */
    function logAction(
        string memory documentId,
        string memory action,
        string memory actor,
        string memory role,
        string memory department,
        string memory documentHash,
        string memory previousActionHash
    ) public {
        ActionRecord memory record = ActionRecord({
            documentId: documentId,
            action: action,
            actor: actor,
            role: role,
            department: department,
            documentHash: documentHash,
            timestamp: block.timestamp,
            previousActionHash: previousActionHash
        });
        
        documentActions[documentId].push(record);
        
        emit ActionLogged(
            documentId,
            action,
            actor,
            block.timestamp,
            documentHash
        );
    }
    
    /**
     * Get total actions for a document
     */
    function getActionCount(string memory documentId) public view returns (uint256) {
        return documentActions[documentId].length;
    }
    
    /**
     * Get specific action by index
     */
    function getAction(string memory documentId, uint256 index) 
        public 
        view 
        returns (
            string memory action,
            string memory actor,
            string memory role,
            string memory department,
            string memory documentHash,
            uint256 timestamp,
            string memory previousActionHash
        ) 
    {
        require(index < documentActions[documentId].length, "Invalid index");
        ActionRecord memory record = documentActions[documentId][index];
        
        return (
            record.action,
            record.actor,
            record.role,
            record.department,
            record.documentHash,
            record.timestamp,
            record.previousActionHash
        );
    }
    
    /**
     * Get all actions for a document
     */
    function getAllActions(string memory documentId) 
        public 
        view 
        returns (ActionRecord[] memory) 
    {
        return documentActions[documentId];
    }
}
