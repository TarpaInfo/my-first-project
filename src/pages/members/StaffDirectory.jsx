import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { operationsApi } from '../../api/operationsApi';
import { 
  Plus, 
  Phone, 
  Mail, 
  Award, 
  AlertCircle, 
  FileText, 
  UploadCloud, 
  ExternalLink, 
  X,
  Pencil,
  Trash2,
  Loader2
} from 'lucide-react';

export default function StaffDirectory() {
  const [staffList, setStaffList] = useState([]);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [openingDocId, setOpeningDocId] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    role: 'LEAD_GUIDE_SIRDAR',
    phone: '',
    email: '',
    licenseNumber: '',
  });

  const loadStaff = async () => {
    setError('');
    try {
      const data = await operationsApi.getStaffDirectory();
      setStaffList(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load staff roster.');
      setStaffList([]);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const openCreateModal = () => {
    setIsEditMode(false);
    setEditingStaffId(null);
    setCvFile(null);
    setFormData({
      fullName: '',
      role: 'LEAD_GUIDE_SIRDAR',
      phone: '',
      email: '',
      licenseNumber: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (crew) => {
    setIsEditMode(true);
    setEditingStaffId(crew.id);
    setCvFile(null);
    setFormData({
      fullName: crew.fullName || '',
      role: crew.role || 'LEAD_GUIDE_SIRDAR',
      phone: crew.phoneNumber || crew.phone || '',
      email: crew.email || '',
      licenseNumber: crew.licenseNumber || '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteStaff = async (crew) => {
    const confirmed = window.confirm(`Are you sure you want to remove ${crew.fullName} from the roster?`);
    if (!confirmed) return;

    try {
      await operationsApi.deleteStaffMember(crew.id);
      loadStaff();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove staff member.');
    }
  };

  // Securely retrieve the CV document as a Blob and open it in a new tab
  const handleViewCv = async (crew) => {
    if (!crew.id) return;
    setOpeningDocId(crew.id);
    setError('');

    try {
      const res = await axiosClient.get(`/logistics/staff/${crew.id}/cv/view`, {
        responseType: 'blob',
      });

      const mimeType = res.headers['content-type'] || crew.cvFileType || 'application/pdf';
      const fileBlob = new Blob([res.data], { type: mimeType });
      const objectUrl = window.URL.createObjectURL(fileBlob);

      const previewTab = window.open(objectUrl, '_blank');
      if (!previewTab) {
        const downloadLink = document.createElement('a');
        downloadLink.href = objectUrl;
        downloadLink.download = crew.cvFileName || `staff_cv_${crew.id}`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
      }

      setTimeout(() => window.URL.revokeObjectURL(objectUrl), 60000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to open CV document from server.');
    } finally {
      setOpeningDocId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUploading(true);

    try {
      if (isEditMode) {
        await operationsApi.updateStaffMember(editingStaffId, formData);
        if (cvFile) {
          await operationsApi.uploadStaffCv(editingStaffId, cvFile);
        }
      } else {
        const createdStaff = await operationsApi.createStaffMember(formData);
        if (cvFile && createdStaff?.id) {
          await operationsApi.uploadStaffCv(createdStaff.id, cvFile);
        }
      }

      setIsModalOpen(false);
      setCvFile(null);
      loadStaff();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Mountain crew & staff roster</h1>
          <p className="text-xs text-slate-400 mt-0.5">Guides, sirdars, and field staff from logistics.</p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-xs font-bold cursor-pointer transition shadow-sm shadow-sky-500/25"
        >
          <Plus size={16} />
          Add staff
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {staffList.length === 0 && !error && (
        <p className="text-xs text-slate-400">No staff enrolled yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {staffList.map((crew) => (
          <div key={crew.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-base">
                  {(crew.fullName || '?').charAt(0)}
                </div>
                
                {/* Actions: Edit & Delete */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(crew)}
                    className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition cursor-pointer"
                    title="Edit Staff Member"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteStaff(crew)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    title="Delete Staff Member"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800">{crew.fullName}</h3>
                <p className="text-xs font-medium text-slate-400">{String(crew.role || '').replaceAll('_', ' ')}</p>
              </div>

              <div className="pt-2 border-t border-slate-50 space-y-2 text-xs text-slate-600">
                {crew.licenseNumber && (
                  <div className="flex items-center gap-2">
                    <Award size={14} className="text-sky-500" />
                    <span>{crew.licenseNumber}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" />
                  <span>{crew.phoneNumber || crew.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-slate-400" />
                  <span className="truncate">{crew.email}</span>
                </div>
              </div>
            </div>

            {/* Authenticated CV Document Preview Button */}
            <div className="pt-3 border-t border-slate-100">
              {crew.cvFileUrl ? (
                <button
                  type="button"
                  disabled={openingDocId === crew.id}
                  onClick={() => handleViewCv(crew)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-sky-50 hover:bg-sky-100 text-sky-700 text-[11px] font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  {openingDocId === crew.id ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <FileText size={13} />
                  )}
                  <span>{openingDocId === crew.id ? 'Opening Document...' : 'View CV Document'}</span>
                  <ExternalLink size={11} className="ml-0.5 opacity-70" />
                </button>
              ) : (
                <div className="text-[11px] text-slate-400 text-center py-1">
                  No CV uploaded
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Shared Create & Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800">
                {isEditMode ? 'Update staff member' : 'Enroll crew member'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <input
                required
                placeholder="Full legal name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 focus:outline-none transition"
              />

              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 focus:outline-none transition"
              >
                <option value="LEAD_GUIDE_SIRDAR">Lead guide / sirdar</option>
                <option value="TREK_GUIDE">Trek guide</option>
                <option value="HIGH_ALTITUDE_MEDIC">High altitude medic</option>
                <option value="DRIVER">Driver</option>
              </select>

              <input
                required
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 focus:outline-none transition"
              />

              <input
                required
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 focus:outline-none transition"
              />

              <input
                placeholder="License number"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 focus:outline-none transition"
              />

              {/* CV File Upload Field */}
              <div className="space-y-1 pt-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {isEditMode ? 'Replace CV / Credentials (Optional)' : 'Staff CV / Credentials (PDF or Photo)'}
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="staffCvFile"
                    accept="application/pdf,image/png,image/jpeg,image/webp"
                    onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label
                    htmlFor="staffCvFile"
                    className="w-full flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition text-xs"
                  >
                    <span className="truncate text-slate-500">
                      {cvFile ? cvFile.name : 'Choose PDF, PNG, or JPG...'}
                    </span>
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-sky-50 text-sky-600 font-bold rounded-lg text-[11px] shrink-0">
                      <UploadCloud size={13} />
                      <span>Browse</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  {uploading 
                    ? (isEditMode ? 'Updating...' : 'Enrolling...') 
                    : (isEditMode ? 'Update' : 'Enroll')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}