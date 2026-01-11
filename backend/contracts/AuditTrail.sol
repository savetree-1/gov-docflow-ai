// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/****** 
    Pravah Document Audit Trail
    Immutable record of document actions for government accountability
******/
contract AuditTrail {
    
    struct Action {
        string documentId;
        string actionType;
        string actor;
        string role;
        string department;
        uint256 timestamp;
        string documentHash;
        string previousActionHash;
    }
    
    // Mapping from document ID to array of actions
    mapping(string => Action[]) public documentActions;
    
    // Event emitted when action is logged
    event ActionLogged(
        string indexed documentId,
        string actionType,
        string actor,
        uint256 timestamp,
        string documentHash
    );
    
    /****** 
        Log a document action to blockchain
    ******/
    function logAction(
        string memory _documentId,
        string memory _actionType,
        string memory _actor,
        string memory _role,
        string memory _department,
        string memory _documentHash,
        string memory _previousActionHash
    ) public {
        Action memory newAction = Action({
            documentId: _documentId,
            actionType: _actionType,
            actor: _actor,
            role: _role,
            department: _department,
            timestamp: block.timestamp,
            documentHash: _documentHash,
            previousActionHash: _previousActionHash
        });
        
        documentActions[_documentId].push(newAction);
        
        emit ActionLogged(
            _documentId,
            _actionType,
            _actor,
            block.timestamp,
            _documentHash
        );
    }
    
    /****** 
        Get action count for a document
    ******/
    function getActionCount(string memory _documentId) public view returns (uint) {
        return documentActions[_documentId].length;
    }
    
    /******
        Get specific action for a document
    ******/
    function getAction(string memory _documentId, uint _index) public view returns (
        string memory actionType,
        string memory actor,
        string memory role,
        uint256 timestamp,
        string memory documentHash
    ) {
        require(_index < documentActions[_documentId].length, "Action index out of bounds");
        Action memory action = documentActions[_documentId][_index];
        return (
            action.actionType,
            action.actor,
            action.role,
            action.timestamp,
            action.documentHash
        );
    }
}
