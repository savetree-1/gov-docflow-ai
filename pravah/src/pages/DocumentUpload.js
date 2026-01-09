
import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CreateAlert } from '../redux/actions';
import axios from 'axios';
import { FaFilePdf, FaCheckCircle, FaExclamationCircle, FaUpload } from 'react-icons/fa';

const API_URL = 'http://localhost:5001/api';


const steps = [
  { label: 'Select File' },
  { label: 'Metadata' },
  { label: 'Review & Submit' },
];

const DocumentUpload = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authState = useSelector((state) => state.authReducer);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [metadata, setMetadata] = useState({
    title: '',
    category: '',
    urgency: 'Medium',
    description: '',
    referenceNumber: ''
  });
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    setError('');
    setSuccess('');
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== 'application/pdf') {
      setError('Only PDF files are allowed.');
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type !== 'application/pdf') {
      setError('Only PDF files are allowed.');
      setFile(null);
      return;
    }
    setFile(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleNext = () => {
    if (step === 0 && !file) {
      setError('Please select a PDF file to upload.');
      return;
    }
    if (step === 1 && (!metadata.title || !metadata.category)) {
      setError('Please fill all required metadata fields.');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }
    setUploading(true);
    setProgress(0);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('title', metadata.title);
      formData.append('category', metadata.category);
      formData.append('urgency', metadata.urgency);
      formData.append('description', metadata.description);
      formData.append('referenceNumber', metadata.referenceNumber);

      const token = authState?.token || localStorage.getItem('token');

      /****** Simulate upload progress ******/
      let prog = 0;
      const interval = setInterval(() => {
        prog += 20;
        setProgress(prog);
        if (prog >= 100) {
          clearInterval(interval);
        }
      }, 400);

      const response = await axios.post(`${API_URL}/documents/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setSuccess('Document uploaded successfully! AI processing started.');
        dispatch(CreateAlert('Document uploaded successfully! AI processing started.', 'success'));
        setTimeout(() => navigate('/dashboard'), 1200);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Upload failed');
      dispatch(CreateAlert(error.response?.data?.message || 'Upload failed', 'error'));
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-government-lightBg py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-soft p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Upload Document</h1>
          {/******* Stepper *******/}
          <div className="flex justify-center mb-8">
            {steps.map((s, idx) => (
              <div key={s.label} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${idx === step ? 'bg-government-blue text-white' : 'bg-gray-200 text-government-blue'} border-2 ${idx < step ? 'border-green-600' : 'border-gray-200'} transition-all`}>
                  {idx < step ? <FaCheckCircle className="text-green-600" /> : idx + 1}
                </div>
                <span className={`ml-2 mr-2 ${idx === step ? 'text-government-blue font-semibold' : 'text-gray-500'}`}>{s.label}</span>
                {idx < steps.length - 1 && <div className={`w-8 h-1 ${idx < step ? 'bg-green-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {/******* Error/Success Messages *******/}
          {error && (
            <div className="flex items-center bg-red-50 text-red-700 rounded px-3 py-2 mb-4"><FaExclamationCircle className="mr-2" /> {error}</div>
          )}
          {success && (
            <div className="flex items-center bg-green-50 text-green-700 rounded px-3 py-2 mb-4"><FaCheckCircle className="mr-2" /> {success}</div>
          )}

          <form onSubmit={handleSubmit}>
            {/******* Step 0: File Selection *******/}
            {step === 0 && (
              <div>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed border-government-blue rounded-lg p-8 text-center bg-gray-50 cursor-pointer mb-6 transition hover:border-blue-900"
                  onClick={() => !uploading && fileInputRef.current && fileInputRef.current.click()}
                >
                  <FaFilePdf size={48} className="mx-auto mb-2 text-government-blue" />
                  <div className="font-medium text-government-blue mb-1">Drag & drop a PDF file here</div>
                  <div className="text-gray-500 text-sm">or click to select</div>
                  <input
                    type="file"
                    accept="application/pdf"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                </div>
                {file && (
                  <div className="mb-4 flex items-center gap-2">
                    <FaFilePdf className="text-government-blue" />
                    <span className="font-medium">{file.name}</span>
                    <span className="text-gray-500 text-xs">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={uploading || !file}
                  className={`w-full py-3 rounded-lg font-semibold transition ${file ? 'bg-government-blue text-white hover:opacity-90' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                >
                  Next
                </button>
              </div>
            )}

            {/******* Step 1: Metadata *******/}
            {step === 1 && (
              <div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={metadata.title}
                    onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-government-blue"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={metadata.category}
                    onChange={(e) => setMetadata({ ...metadata, category: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-government-blue"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Disaster Management">Disaster Management</option>
                    <option value="Finance & Budget">Finance & Budget</option>
                    <option value="HR & Administration">HR & Administration</option>
                    <option value="Legal & Compliance">Legal & Compliance</option>
                    <option value="Public Works">Public Works</option>
                    <option value="Revenue">Revenue</option>
                  </select>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level *</label>
                  <select
                    value={metadata.urgency}
                    onChange={(e) => setMetadata({ ...metadata, urgency: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-government-blue"
                    required
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reference Number</label>
                  <input
                    type="text"
                    value={metadata.referenceNumber}
                    onChange={(e) => setMetadata({ ...metadata, referenceNumber: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-government-blue"
                    placeholder="DOC-2025-001"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={metadata.description}
                    onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-government-blue"
                    rows="4"
                    placeholder="Brief description of the document..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-3 bg-gray-200 text-government-blue rounded-lg font-semibold hover:bg-gray-300"
                  >Back</button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 py-3 bg-government-blue text-white rounded-lg font-semibold hover:opacity-90"
                  >Next</button>
                </div>
              </div>
            )}

            {/******* Step 2: Review & Submit *******/}
            {step === 2 && (
              <div>
                <div className="mb-6 flex items-center gap-3 bg-gray-50 rounded-lg p-4">
                  <FaFilePdf className="text-government-blue text-2xl" />
                  <div>
                    <div className="font-semibold text-government-blue">{file && file.name}</div>
                    <div className="text-gray-500 text-xs">{file && (file.size / 1024).toFixed(1)} KB</div>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="text-sm text-gray-700"><span className="font-semibold">Title:</span> {metadata.title}</div>
                  <div className="text-sm text-gray-700"><span className="font-semibold">Category:</span> {metadata.category}</div>
                  <div className="text-sm text-gray-700"><span className="font-semibold">Urgency:</span> {metadata.urgency}</div>
                  {metadata.referenceNumber && <div className="text-sm text-gray-700"><span className="font-semibold">Reference:</span> {metadata.referenceNumber}</div>}
                  {metadata.description && <div className="text-sm text-gray-700"><span className="font-semibold">Description:</span> {metadata.description}</div>}
                </div>
                {uploading && (
                  <div className="mb-4">
                    <div className="h-2 bg-gray-200 rounded">
                      <div className="h-2 bg-government-blue rounded transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="text-government-blue font-medium mt-1">Uploading... {progress}%</div>
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={uploading}
                    className="flex-1 py-3 bg-gray-200 text-government-blue rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50"
                  >Back</button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 py-3 bg-government-blue text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                  >
                    <FaUpload /> {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
