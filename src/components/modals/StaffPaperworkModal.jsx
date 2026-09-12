import React, { useState, useEffect } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  ExternalLink, 
  AlertCircle,
  FileCheck,
  ShieldCheck,
  HardDrive
} from 'lucide-react';
import { documentApi } from '../../api/documentApi';

// Standard travel/trekking document types (matches common Spring Boot enum values)
const DOCUMENT_TYPES = [
  { id: 'PASSPORT', label: 'Passport Copy' },
  { id: 'INSURANCE', label: 'Travel & Rescue Insurance' },
  { id: 'VISA', label: 'Entry Visa Copy' },
  { id: 'PERMIT', label: 'TIMS / National Park Permit' },
  { id: 'VOUCHER', label: 'Flight / Hotel Voucher' },
  { id: 'OTHER', label: 'Other Document' }
];

export default function StaffPaperworkModal({ isOpen, onClose, booking }) {
  const [documents, setDocuments] = useState([]);
  const [documentType, setDocumentType] = useState('PASSPORT');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadDocuments = async () => {
    if (!booking?.id) return;
    setFetching(true);
    try {
      const data = await documentApi.getDocumentsByBooking(booking.id);
      setDocuments(data);
    } catch {
      setDocuments([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isOpen && booking?.id) {
      setError('');
      setSuccess('');
      setSelectedFile(null);
      loadDocuments();
    }
  }, [isOpen, booking]);

  if (!isOpen || !booking) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file from your device to upload.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await documentApi.uploadDocument({
        file: selectedFile,
        bookingId: booking.id,
        clientId: booking.clientId || 1, // uses booking's linked clientId
        documentType: documentType
      });

      setSuccess(`File "${selectedFile.name}" stored and recorded successfully.`);
      setSelectedFile(null);
      // Reset the file input element value
      const fileInput = document.getElementById('paperwork-file-input');
      if (fileInput) fileInput.value = '';

      await loadDocuments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload document to backend.');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-100 shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <FileCheck size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Expedition File & Document Vault</h3>
              <p className="text-[10px] text-slate-400">
                Booking: <span className="font-mono font-bold text-sky-600">{booking.bookingCode || `#${booking.id}`}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {success && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2 font-semibold">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
          
          {/* Upload Form */}
          <form onSubmit={handleUpload} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
              Upload Compliance Document / Paperwork
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Document Type (Enum)
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-sky-500"
                >
                  {DOCUMENT_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  File Attachment
                </label>
                <input
                  id="paperwork-file-input"
                  type="file"
                  required
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer bg-white border border-slate-200 rounded-xl p-1"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                <UploadCloud size={14} />
                <span>{loading ? 'Storing Document...' : 'Upload & Link Document'}</span>
              </button>
            </div>
          </form>

          {/* Stored Documents Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Stored Digital Records ({documents.length})
              </span>
              {fetching && <span className="text-[10px] text-slate-400 animate-pulse">Syncing...</span>}
            </div>

            {documents.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                <HardDrive size={24} className="mx-auto mb-2 text-slate-300" />
                <p>No documents filed for this booking yet.</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Upload client permits, flight passes, or ID scans above.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-3.5 bg-white flex items-center justify-between hover:bg-slate-50/80 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <ShieldCheck size={16} />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-xs">{doc.originalFileName}</span>
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[9px] font-bold">
                            {doc.documentType}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {formatFileSize(doc.sizeInBytes)} • {doc.contentType || 'file'}
                        </div>
                      </div>
                    </div>

                    <a
                      href={doc.fileDownloadUri || documentApi.getDownloadUrl(doc.storedFileName)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-sky-50 hover:text-sky-600 rounded-xl text-slate-600 font-bold transition text-[11px]"
                    >
                      <ExternalLink size={12} />
                      <span>View File</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Close Vault
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}