/**
 * DocumentUpload Component Tests
 * Tests file upload, validation, routing preview, and progress tracking
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import DocumentUpload from './DocumentUpload';
import { documentAPI, routingAPI } from '../../api/backendAPI';

jest.mock('../../api/backendAPI');
const mockStore = configureStore([]);

const renderWithProviders = (component) => {
  const store = mockStore({
    authReducer: {
      isLoggedIn: true,
      user: {
        data: {
          id: '1',
          firstName: 'Test',
          lastName: 'User',
          role: 'OFFICER',
        },
      },
    },
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

describe('DocumentUpload Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all form fields', () => {
    renderWithProviders(<DocumentUpload />);

    expect(screen.getByLabelText(/document title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/urgency/i)).toBeInTheDocument();
  });

  test('displays validation error for missing title', async () => {
    renderWithProviders(<DocumentUpload />);

    const submitButton = screen.getByRole('button', { name: /upload document/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
  });

  test('file size validation - rejects files over 10MB', async () => {
    renderWithProviders(<DocumentUpload />);

    const file = new File(['a'.repeat(11 * 1024 * 1024)], 'large.pdf', {
      type: 'application/pdf',
    });

    const fileInput = screen.getByLabelText(/upload document/i);
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText(/file size exceeds 10MB/i)).toBeInTheDocument();
    });
  });

  test('file type validation - rejects unsupported formats', async () => {
    renderWithProviders(<DocumentUpload />);

    const file = new File(['content'], 'document.txt', {
      type: 'text/plain',
    });

    const fileInput = screen.getByLabelText(/upload document/i);
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText(/unsupported file type/i)).toBeInTheDocument();
    });
  });

  test('accepts valid PDF file', async () => {
    renderWithProviders(<DocumentUpload />);

    const file = new File(['content'], 'document.pdf', {
      type: 'application/pdf',
    });

    const fileInput = screen.getByLabelText(/upload document/i);
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText(/document\.pdf/i)).toBeInTheDocument();
    });
  });

  test('displays routing preview when category is selected', async () => {
    const mockRoutingResponse = {
      data: {
        success: true,
        data: {
          matchedRule: {
            department: { name: 'Finance Department' },
            assignee: { firstName: 'John', lastName: 'Doe' },
          },
        },
      },
    };

    routingAPI.test.mockResolvedValue(mockRoutingResponse);

    renderWithProviders(<DocumentUpload />);

    const categorySelect = screen.getByLabelText(/category/i);
    fireEvent.change(categorySelect, { target: { value: 'finance' } });

    await waitFor(() => {
      expect(screen.getByText(/finance department/i)).toBeInTheDocument();
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });
  });

  test('successful document upload', async () => {
    const mockUploadResponse = {
      data: {
        success: true,
        data: {
          id: '123',
          title: 'Test Document',
        },
      },
    };

    documentAPI.upload.mockResolvedValue(mockUploadResponse);

    renderWithProviders(<DocumentUpload />);

    const titleInput = screen.getByLabelText(/document title/i);
    const categorySelect = screen.getByLabelText(/category/i);
    const descriptionInput = screen.getByLabelText(/description/i);

    fireEvent.change(titleInput, { target: { value: 'Test Document' } });
    fireEvent.change(categorySelect, { target: { value: 'finance' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } });

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/upload document/i);
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    fireEvent.change(fileInput);

    const submitButton = screen.getByRole('button', { name: /upload document/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(documentAPI.upload).toHaveBeenCalled();
      expect(screen.getByText(/upload successful/i)).toBeInTheDocument();
    });
  });

  test('displays upload progress', async () => {
    let progressCallback;
    documentAPI.upload.mockImplementation((formData, config) => {
      progressCallback = config.onUploadProgress;
      return new Promise(resolve => {
        setTimeout(() => {
          progressCallback({ loaded: 50, total: 100 });
          setTimeout(() => {
            progressCallback({ loaded: 100, total: 100 });
            resolve({
              data: {
                success: true,
                data: { id: '123' },
              },
            });
          }, 100);
        }, 100);
      });
    });

    renderWithProviders(<DocumentUpload />);

    const titleInput = screen.getByLabelText(/document title/i);
    const categorySelect = screen.getByLabelText(/category/i);

    fireEvent.change(titleInput, { target: { value: 'Test Document' } });
    fireEvent.change(categorySelect, { target: { value: 'finance' } });

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/upload document/i);
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    fireEvent.change(fileInput);

    const submitButton = screen.getByRole('button', { name: /upload document/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/50%/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/100%/i)).toBeInTheDocument();
    });
  });

  test('handles upload error gracefully', async () => {
    const mockError = {
      response: {
        data: {
          message: 'Upload failed',
        },
      },
    };

    documentAPI.upload.mockRejectedValue(mockError);

    renderWithProviders(<DocumentUpload />);

    const titleInput = screen.getByLabelText(/document title/i);
    const categorySelect = screen.getByLabelText(/category/i);

    fireEvent.change(titleInput, { target: { value: 'Test Document' } });
    fireEvent.change(categorySelect, { target: { value: 'finance' } });

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/upload document/i);
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    fireEvent.change(fileInput);

    const submitButton = screen.getByRole('button', { name: /upload document/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
    });
  });

  test('drag and drop file upload', async () => {
    renderWithProviders(<DocumentUpload />);

    const dropZone = screen.getByText(/drag.*drop/i).parentElement;

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const dataTransfer = {
      files: [file],
      types: ['Files'],
    };

    fireEvent.dragEnter(dropZone, { dataTransfer });
    fireEvent.dragOver(dropZone, { dataTransfer });
    fireEvent.drop(dropZone, { dataTransfer });

    await waitFor(() => {
      expect(screen.getByText(/test\.pdf/i)).toBeInTheDocument();
    });
  });

  test('remove file after selection', async () => {
    renderWithProviders(<DocumentUpload />);

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/upload document/i);
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText(/test\.pdf/i)).toBeInTheDocument();
    });

    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);

    expect(screen.queryByText(/test\.pdf/i)).not.toBeInTheDocument();
  });
});
