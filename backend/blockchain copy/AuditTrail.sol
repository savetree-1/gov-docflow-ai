// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title AuditTrail
 * @dev Immutable audit trail for government document actions
 */
contract AuditTrail {
    
    struct Action {
        string documentId;
        string actionType;
        string performedBy;
        string role;
        string department;
        uint256 timestamp;
        string documentHash;
        string previousActionHash;
    }
    
    mapping(string => Action[]) public documentActions;
    mapping(string => uint256) public documentActionCount;
    
    event ActionLogged(
        string indexed documentId,
        string actionType,
        string performedBy,
        uint256 timestamp,
        string documentHash
    );
    
    /**
     * @dev Log a document action to blockchain
     */
    function logAction(
        string memory _documentId,
        string memory _actionType,
        string memory _performedBy,
        string memory _role,
        string memory _department,
        string memory _documentHash,
        string memory _previousActionHash
    ) public {
        Action memory newAction = Action({
            documentId: _documentId,
            actionType: _actionType,
            performedBy: _performedBy,
            role: _role,
            department: _department,
            timestamp: block.timestamp,
            documentHash: _documentHash,
            previousActionHash: _previousActionHash
        });
        
        documentActions[_documentId].push(newAction);
        documentActionCount[_documentId]++;
        
        emit ActionLogged(
            _documentId,
            _actionType,
            _performedBy,
            block.timestamp,
            _documentHash
        );
    }
    
    /**
     * @dev Get action count for a document
     */
    function getActionCount(string memory _documentId) public view returns (uint256) {
        return documentActionCount[_documentId];
    }
    
    /**
     * @dev Get specific action for a document
     */
    function getAction(string memory _documentId, uint256 _index) public view returns (
        string memory actionType,
        string memory performedBy,
        string memory role,
        string memory department,
        uint256 timestamp,
        string memory documentHash,
        string memory previousActionHash
    ) {
        require(_index < documentActions[_documentId].length, "Action index out of bounds");
        Action memory action = documentActions[_documentId][_index];
        return (
            action.actionType,
            action.performedBy,
            action.role,
            action.department,
            action.timestamp,
            action.documentHash,
            action.previousActionHash
        );
    }
}
