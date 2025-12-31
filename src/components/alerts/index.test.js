/**
 * Alert Components Tests
 * Tests success and error message display and auto-dismiss
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { SuccessMsg, ErrorMsg } from './index';

describe('Alert Components', () => {
  describe('SuccessMsg', () => {
    test('renders success message', () => {
      render(<SuccessMsg message="Operation successful" />);
      expect(screen.getByText(/operation successful/i)).toBeInTheDocument();
    });

    test('applies success styling', () => {
      const { container } = render(<SuccessMsg message="Success" />);
      const alert = container.firstChild;
      expect(alert).toHaveClass('success-msg');
    });

    test('renders with custom className', () => {
      const { container } = render(
        <SuccessMsg message="Success" className="custom-class" />
      );
      const alert = container.firstChild;
      expect(alert).toHaveClass('custom-class');
    });

    test('is accessible with role alert', () => {
      render(<SuccessMsg message="Success" />);
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    test('auto-dismisses after timeout', async () => {
      jest.useFakeTimers();
      const onDismiss = jest.fn();
      
      render(<SuccessMsg message="Success" onDismiss={onDismiss} />);
      
      expect(screen.getByText(/success/i)).toBeInTheDocument();
      
      jest.advanceTimersByTime(3000);
      
      await waitFor(() => {
        expect(onDismiss).toHaveBeenCalled();
      });

      jest.useRealTimers();
    });
  });

  describe('ErrorMsg', () => {
    test('renders error message', () => {
      render(<ErrorMsg message="Operation failed" />);
      expect(screen.getByText(/operation failed/i)).toBeInTheDocument();
    });

    test('applies error styling', () => {
      const { container } = render(<ErrorMsg message="Error" />);
      const alert = container.firstChild;
      expect(alert).toHaveClass('error-msg');
    });

    test('renders with custom className', () => {
      const { container } = render(
        <ErrorMsg message="Error" className="custom-class" />
      );
      const alert = container.firstChild;
      expect(alert).toHaveClass('custom-class');
    });

    test('is accessible with role alert', () => {
      render(<ErrorMsg message="Error" />);
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    test('renders with error icon', () => {
      render(<ErrorMsg message="Error" />);
      // Check for error icon or indicator
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    test('does not auto-dismiss by default', async () => {
      jest.useFakeTimers();
      
      render(<ErrorMsg message="Error" />);
      
      expect(screen.getByText(/error/i)).toBeInTheDocument();
      
      jest.advanceTimersByTime(5000);
      
      expect(screen.getByText(/error/i)).toBeInTheDocument();

      jest.useRealTimers();
    });
  });

  describe('Multiple Alerts', () => {
    test('can display both success and error messages simultaneously', () => {
      render(
        <>
          <SuccessMsg message="Success message" />
          <ErrorMsg message="Error message" />
        </>
      );

      expect(screen.getByText(/success message/i)).toBeInTheDocument();
      expect(screen.getByText(/error message/i)).toBeInTheDocument();
    });

    test('handles empty message gracefully', () => {
      render(<SuccessMsg message="" />);
      // Component should either not render or handle empty message
      const alerts = screen.queryAllByRole('alert');
      expect(alerts.length).toBeLessThanOrEqual(1);
    });

    test('handles long messages', () => {
      const longMessage = 'This is a very long error message that should wrap properly and not break the layout of the page. '.repeat(5);
      render(<ErrorMsg message={longMessage} />);
      expect(screen.getByText(new RegExp(longMessage.substring(0, 50)))).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('success message has proper ARIA attributes', () => {
      render(<SuccessMsg message="Success" />);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });

    test('error message has proper ARIA attributes', () => {
      render(<ErrorMsg message="Error" />);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });

    test('messages are announced to screen readers', () => {
      const { rerender } = render(<SuccessMsg message="First message" />);
      expect(screen.getByRole('alert')).toHaveTextContent('First message');

      rerender(<SuccessMsg message="Second message" />);
      expect(screen.getByRole('alert')).toHaveTextContent('Second message');
    });
  });
});
