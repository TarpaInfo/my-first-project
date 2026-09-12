import React, { useState, useEffect } from 'react';
import { operationsApi } from '../../api/operationsApi';
import { 
  FolderArchive, 
  UploadCloud, 
  FileText, 
  Download, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Clock
} from 'lucide-react';

export default function DocumentVault() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [metadata, setMetadata] = useState({
    bookingId: '1',
    documentType: 'PASSPORT',
    trekkerName: '',
  });
  const [notice, setNotice] = useState(null);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await operationsApi.getAllDocuments();
      setDocuments(data);
    } catch {
      // Fallback preview
      setDocuments([
        { id: 1, fileName: 'Julian_Thorne_Passport.pdf', trekkerName: 'Julian Thorne', documentType: 'PASSPORT', bookingId: 101, uploadedAt: '2026-09-06' },
        { id: 2, fileName: 'HighAltitude_Insurance_Policy.pdf', trekkerName: 'Elena Rostova', documentType: 'INSURANCE', bookingId: 102, uploadedAt: '2026-09-07' },
        { id: 3, fileName: 'Nepal_Tourist_Visa_Entry.pdf', trekkerName: 'Kenji Sato', documentType: 'VISA', bookingId: 103, uploadedAt: '2026-09-08' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setNotice({ type: 'error', text: 'Please select a file to upload.' });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('bookingId', metadata.bookingId);
    formData.append('documentType', metadata.documentType);
    formData.append('trekkerName', metadata.trekkerName);

    setUploading(true);
    try {
      await operationsApi.uploadDocument(formData);
      setNotice({ type: 'success', text: 'Document securely uploaded to Satori Vault.' });
      setSelectedFile(null);
      setMetadata({ bookingId: '1', documentType: 'PASSPORT', trekkerName: '' });
      loadDocuments();
    } catch (err) {
      setNotice({ type: 'error', text: err.response?.data?.message || 'Upload failed. Verify file constraints.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      await operationsApi.downloadDocument(doc.id, doc.fileName);
    } catch {
      alert('Failed to initiate secure file stream.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Secure Document Vault</h1>
        <p className="text-xs text-slate-400 mt-0.5">Encrypted passport scans, evacuation insurance policies, and visa stamps.</p>
      </div>

      {notice && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between border ${
          notice.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <span>{notice.text}</span>
          <button onClick={() => setNotice(null)} className="text-slate-500 font-bold">✕</button>
        </div>
      )}

      {/* Upload Zone */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <UploadCloud size={18} className="text-sky-500" /> Upload Expedition Document
        </h3>
        <form onSubmit={handleFileUpload} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-600 mb-1 uppercase tracking-wider text-[10px]">Trekker Name</label>
            <input
              type="text"
              required
              value={metadata.trekkerName}
              onChange={(e) => setMetadata({ ...metadata, trekkerName: e.target.value })}
              placeholder="e.g. Julian Thorne"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1 uppercase tracking-wider text-[10px]">Booking Reference ID</label>
            <input
              type="number"
              required
              value={metadata.bookingId}
              onChange={(e) => setMetadata({ ...metadata, bookingId: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1 uppercase tracking-wider text-[10px]">Document Type</label>
            <select
              value={metadata.documentType}
              onChange={(e) => setMetadata({ ...metadata, documentType: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="PASSPORT">Passport Scan</option>
              <option value="INSURANCE">High-Altitude Insurance</option>
              <option value="VISA">Nepal Entry Visa</option>
              <option value="MEDICAL">Medical Clearance Certificate</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1 uppercase tracking-wider text-[10px]">Select PDF / Scan</label>
            <input
              type="file"
              required
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full text-[11px] text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:bg-sky-50 file:text-sky-600 file:font-semibold hover:file:bg-sky-100"
            />
          </div>

          <div className="md:col-span-4 flex justify-end">
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-md shadow-sky-500/25 transition disabled:opacity-50"
            >
              {uploading ? 'Encrypting & Uploading...' : 'Dispatch to Vault'}
            </button>
          </div>
        </form>
      </div>

      {/* Document Records Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
              <th className="py-3 px-6 font-bold">Document Name</th>
              <th className="py-3 px-6 font-bold">Expedition Member</th>
              <th className="py-3 px-6 font-bold">Booking Link</th>
              <th className="py-3 px-6 font-bold text-center">Category</th>
              <th className="py-3 px-6 font-bold text-right">Secure Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50/60 transition">
                <td className="py-3.5 px-6 flex items-center gap-2.5 font-semibold text-slate-800">
                  <FileText size={16} className="text-sky-500 shrink-0" />
                  <span className="truncate max-w-xs">{doc.fileName}</span>
                </td>
                <td className="py-3.5 px-6 font-medium text-slate-600">{doc.trekkerName}</td>
                <td className="py-3.5 px-6 font-mono text-sky-600 font-bold">#{doc.bookingId}</td>
                <td className="py-3.5 px-6 text-center">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-600">
                    {doc.documentType}
                  </span>
                </td>
                <td className="py-3.5 px-6 text-right">
                  <button
                    type="button"
                    onClick={() => handleDownload(doc)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-600 rounded-xl font-semibold transition cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Download</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}