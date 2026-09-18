import React, { useState, useEffect } from 'react';
import { operationsApi } from '../../api/operationsApi';
import axiosClient from '../../api/axiosClient';
import { documentApi } from '../../api/documentApi';
import { FolderArchive, UploadCloud, FileText, Download, AlertCircle } from 'lucide-react';

export default function DocumentVault() {
  const [documents, setDocuments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [metadata, setMetadata] = useState({
    bookingId: '',
    documentType: 'PASSPORT',
  });
  const [notice, setNotice] = useState(null);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const [docs, bookRes] = await Promise.all([
        operationsApi.getAllDocuments(),
        axiosClient.get('/bookings'),
      ]);
      setDocuments(docs || []);
      setBookings(bookRes.data || []);
      setNotice(null);
    } catch (err) {
      setNotice({ type: 'error', text: err.response?.data?.message || 'Could not load documents.' });
      setDocuments([]);
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
    const booking = bookings.find((b) => String(b.id) === String(metadata.bookingId));
    if (!booking?.clientId) {
      setNotice({ type: 'error', text: 'Select a booking with a valid client.' });
      return;
    }

    setUploading(true);
    try {
      await documentApi.uploadDocument({
        file: selectedFile,
        bookingId: Number(metadata.bookingId),
        clientId: booking.clientId,
        documentType: metadata.documentType,
      });
      setNotice({ type: 'success', text: 'Document uploaded to the vault.' });
      setSelectedFile(null);
      loadDocuments();
    } catch (err) {
      setNotice({ type: 'error', text: err.response?.data?.message || 'Upload failed.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      await operationsApi.downloadDocument(doc.storedFileName, doc.originalFileName);
    } catch {
      window.open(documentApi.getDownloadUrl(doc.storedFileName), '_blank');
    }
  };

  const bookingLabel = (id) => {
    const b = bookings.find((row) => row.id === id);
    return b ? b.bookingCode : `#${id}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <FolderArchive size={20} className="text-sky-500" /> Secure document vault
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Passport scans, insurance, and visa files per booking.</p>
      </div>

      {notice && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 border ${
          notice.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <AlertCircle size={14} />
          <span>{notice.text}</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <UploadCloud size={18} className="text-sky-500" /> Upload document
        </h3>
        <form onSubmit={handleFileUpload} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <select
            required
            value={metadata.bookingId}
            onChange={(e) => setMetadata({ ...metadata, bookingId: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
          >
            <option value="">Select booking</option>
            {bookings.map((b) => (
              <option key={b.id} value={b.id}>{b.bookingCode} — {b.clientName}</option>
            ))}
          </select>
          <select
            value={metadata.documentType}
            onChange={(e) => setMetadata({ ...metadata, documentType: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
          >
            <option value="PASSPORT">Passport</option>
            <option value="NEPAL_VISA">Nepal visa</option>
            <option value="INSURANCE_POLICY">Insurance</option>
            <option value="PP_SIZE_PHOTO">Photo</option>
            <option value="MEDICAL_CLEARANCE">Medical clearance</option>
            <option value="PERMIT_SCAN">Permit scan</option>
            <option value="EXPENSE_RECEIPT">Expense receipt</option>
          </select>
          <input
            type="file"
            required
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="w-full text-[11px] text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:bg-sky-50 file:text-sky-600 file:font-semibold"
          />
          <div className="md:col-span-3 flex justify-end">
            <button type="submit" disabled={uploading} className="px-6 py-2.5 bg-sky-500 text-white font-bold rounded-xl disabled:opacity-50">
              {uploading ? 'Uploading…' : 'Upload to vault'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
              <th className="py-3 px-6 font-bold">File</th>
              <th className="py-3 px-6 font-bold">Booking</th>
              <th className="py-3 px-6 font-bold text-center">Type</th>
              <th className="py-3 px-6 font-bold text-right">Download</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={4} className="py-10 text-center text-slate-400">Loading vault…</td></tr>
            ) : documents.length === 0 ? (
              <tr><td colSpan={4} className="py-10 text-center text-slate-400">No documents uploaded yet.</td></tr>
            ) : documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50/60">
                <td className="py-3.5 px-6 flex items-center gap-2.5 font-semibold text-slate-800">
                  <FileText size={16} className="text-sky-500 shrink-0" />
                  <span className="truncate max-w-xs">{doc.originalFileName || doc.fileName}</span>
                </td>
                <td className="py-3.5 px-6 font-mono text-sky-600 font-bold">{bookingLabel(doc.bookingId)}</td>
                <td className="py-3.5 px-6 text-center">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-600">
                    {doc.documentType}
                  </span>
                </td>
                <td className="py-3.5 px-6 text-right">
                  <button type="button" onClick={() => handleDownload(doc)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-sky-50 text-slate-700 rounded-xl font-semibold cursor-pointer">
                    <Download size={13} /> Download
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
