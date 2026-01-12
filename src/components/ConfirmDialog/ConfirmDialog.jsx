import React, { useEffect, useRef } from 'react';
import './ConfirmDialog.css';

const ConfirmDialog = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmStyle = 'primary',
  icon = '⚠️'
}) => {
  const confirmButtonRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      /****** Focus confirm button when dialog opens ******/
      confirmButtonRef.current?.focus();

      /****** Handle Escape key ******/
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onCancel();
        }
      };

      /****** Trap focus within dialog ******/
      const handleTabKey = (e) => {
        if (e.key === 'Tab' && dialogRef.current) {
          const focusableElements = dialogRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleTabKey);

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('keydown', handleTabKey);
      };
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div 
      className="confirm-dialog-overlay" 
      onClick={onCancel}
      role="presentation"
      aria-hidden="true"
    >
      <div 
        ref={dialogRef}
        className="confirm-dialog" 
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        <div className="confirm-dialog-icon" aria-hidden="true">{icon}</div>
        <h3 id="confirm-dialog-title" className="confirm-dialog-title">{title}</h3>
        <p id="confirm-dialog-message" className="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog-actions">
          <button 
            onClick={onCancel}
            className="confirm-dialog-btn confirm-dialog-btn-cancel"
            aria-label={`${cancelText} and close dialog`}
          >
            {cancelText}
          </button>
          <button 
            ref={confirmButtonRef}
            onClick={onConfirm}
            className={`confirm-dialog-btn confirm-dialog-btn-${confirmStyle}`}
            aria-label={`${confirmText} action`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
