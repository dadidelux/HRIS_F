import React, { useState, useRef } from 'react';
import { FileText, Upload, Download, Trash2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { apiService } from '../../services/api';

interface ResumeData {
  id: string;
  filename: string;
  file_size: number;
  parsing_status: 'pending' | 'completed' | 'failed';
  uploaded_at: string;
}

const ResumeTab: React.FC = () => {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    loadResume();
  }, []);

  const loadResume = async () => {
    try {
      setLoading(true);
      const data = await apiService.getResume();
      setResume(data);
    } catch {
      setResume(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await apiService.uploadResume(file);
      setResume(result);
      setSuccess(result.message || 'Resume uploaded successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload resume');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownload = async () => {
    try {
      await apiService.downloadResume();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download resume');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your resume?')) return;
    try {
      await apiService.deleteResume();
      setResume(null);
      setSuccess('Resume deleted successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete resume');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Resume / CV</h2>
        <p className="text-sm text-gray-500 mt-1">
          Upload your resume as a PDF. Skills will be extracted automatically using AI.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 size={16} className="animate-spin" />
          Loading...
        </div>
      ) : resume ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{resume.filename}</p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(resume.file_size)} • Uploaded {new Date(resume.uploaded_at).toLocaleDateString()}
                </p>
                <p className="text-xs mt-1">
                  {resume.parsing_status === 'completed' && (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle size={12} /> Parsed successfully
                    </span>
                  )}
                  {resume.parsing_status === 'pending' && (
                    <span className="text-yellow-600">Parsing...</span>
                  )}
                  {resume.parsing_status === 'failed' && (
                    <span className="text-red-600 flex items-center gap-1">
                      <AlertCircle size={12} /> Parsing failed
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Download"
              >
                <Download size={18} />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Replace with new resume'}
          </button>
        </div>
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 size={32} className="text-blue-600 animate-spin" />
                <p className="text-gray-600">Uploading and parsing resume...</p>
              </div>
            ) : (
              <>
                <Upload size={36} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-700 font-medium">Click to upload your resume</p>
                <p className="text-sm text-gray-500 mt-1">PDF files only, max 10MB</p>
                <p className="text-xs text-gray-400 mt-2">
                  Skills will be extracted automatically using AI
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeTab;
