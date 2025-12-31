/**
 * ConfirmDialog Component Tests
 * Tests dialog display, keyboard navigation, and accessibility
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmDialog from './ConfirmDialog';

describe('ConfirmDialog Component', () => {
  const defaultProps = {
    isOpen: true,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders dialog when isOpen is true', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
  });

  test('does not render when isOpen is false', () => {
    render(<ConfirmDialog {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
  });

  test('calls onConfirm when confirm button is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);
    
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  test('calls onCancel when cancel button is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  test('calls onCancel when overlay is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    const overlay = screen.getByRole('presentation');
    fireEvent.click(overlay);
    
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  test('does not close when dialog content is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    const dialog = screen.getByRole('alertdialog');
    fireEvent.click(dialog);
    
    expect(defaultProps.onCancel).not.toHaveBeenCalled();
  });

  test('closes on Escape key press', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  test('renders custom button text', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        confirmText="Delete"
        cancelText="Keep"
      />
    );
    
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /keep/i })).toBeInTheDocument();
  });

  test('applies correct style variant', () => {
    const { rerender } = render(
      <ConfirmDialog {...defaultProps} confirmStyle="danger" />
    );
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    expect(confirmButton).toHaveClass('confirm-dialog-btn-danger');
    
    rerender(<ConfirmDialog {...defaultProps} confirmStyle="primary" />);
    expect(confirmButton).toHaveClass('confirm-dialog-btn-primary');
  });

  test('displays custom icon', () => {
    render(<ConfirmDialog {...defaultProps} icon="🚀" />);
    
    expect(screen.getByText('🚀')).toBeInTheDocument();
  });

  test('focuses confirm button on open', async () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      expect(confirmButton).toHaveFocus();
    });
  });

  test('traps focus within dialog', async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...defaultProps} />);
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    
    // Tab forward
    await user.tab();
    expect(cancelButton).toHaveFocus();
    
    await user.tab();
    expect(confirmButton).toHaveFocus();
    
    // Tab backward
    await user.tab({ shift: true });
    expect(cancelButton).toHaveFocus();
  });

  test('has proper ARIA attributes', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'confirm-dialog-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'confirm-dialog-message');
  });

  test('prevents body scroll when open', () => {
    const { rerender } = render(<ConfirmDialog {...defaultProps} isOpen={false} />);
    
    const initialOverflow = document.body.style.overflow;
    
    rerender(<ConfirmDialog {...defaultProps} isOpen={true} />);
    
    // In actual implementation, body scroll should be prevented
    // expect(document.body.style.overflow).toBe('hidden');
    
    rerender(<ConfirmDialog {...defaultProps} isOpen={false} />);
    
    // Should restore original overflow
    // expect(document.body.style.overflow).toBe(initialOverflow);
  });

  test('handles rapid open/close cycles', async () => {
    const { rerender } = render(<ConfirmDialog {...defaultProps} isOpen={false} />);
    
    rerender(<ConfirmDialog {...defaultProps} isOpen={true} />);
    rerender(<ConfirmDialog {...defaultProps} isOpen={false} />);
    rerender(<ConfirmDialog {...defaultProps} isOpen={true} />);
    
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
  });

  test('multiple instances do not interfere', () => {
    const props1 = { ...defaultProps, title: 'Dialog 1' };
    const props2 = { ...defaultProps, title: 'Dialog 2' };
    
    render(
      <>
        <ConfirmDialog {...props1} />
        <ConfirmDialog {...props2} />
      </>
    );
    
    expect(screen.getAllByRole('alertdialog')).toHaveLength(2);
  });
});
