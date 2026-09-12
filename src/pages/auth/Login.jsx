import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Compass, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Shield, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function AuthPage() {
  const [mode, setMode] = useState('LOGIN'); // 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD'
  
  // Registration & Login Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('OPERATIONS_MANAGER');
  const [email, setEmail] = useState('sagarnepal98@gmail.com');
  const [password, setPassword] = useState('SagarTest');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const switchMode = (newMode) => {
    setMode(newMode);
    setGeneralError('');
    setFieldErrors({});
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setFieldErrors({});
    setSuccessMessage('');
    setLoading(true);

    try {
      if (mode === 'LOGIN') {
        await login(email, password);
        navigate('/dashboard');
      } else if (mode === 'SIGNUP') {
        if (password !== confirmPassword) {
          setFieldErrors({ confirmPassword: 'Passwords do not match.' });
          setLoading(false);
          return;
        }

        await axiosClient.post('/auth/register', {
          fullName,
          phone,
          role,
          email,
          password
        });

        setSuccessMessage('Staff account registered! Please sign in.');
        switchMode('LOGIN');
      } else if (mode === 'FORGOT_PASSWORD') {
        await axiosClient.post('/auth/forgot-password', { email });
        setSuccessMessage('Password reset instructions dispatched to your email.');
      }
    } catch (err) {
      const responseData = err.response?.data;
      if (responseData?.errors && typeof responseData.errors === 'object') {
        setFieldErrors(responseData.errors);
        setGeneralError('Please correct the validation errors highlighted below.');
      } else if (responseData?.message) {
        setGeneralError(responseData.message);
      } else {
        setGeneralError('Authentication failed. Verify credentials and backend status.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-sky-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 mb-3">
            <Compass size={26} className="stroke-[2.5]" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Satori Adventures Nepal</h2>
          <p className="text-xs font-semibold text-slate-400 tracking-widest uppercase mt-0.5">
            Operations Portal
          </p>
        </div>

        {/* Tab Toggle */}
        {mode !== 'FORGOT_PASSWORD' && (
          <div className="grid grid-cols-2 p-1 bg-slate-100/80 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => switchMode('LOGIN')}
              className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                mode === 'LOGIN' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('SIGNUP')}
              className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                mode === 'SIGNUP' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
              }`}
            >
              Register Staff
            </button>
          </div>
        )}

        {/* Global Error Alert */}
        {generalError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-600 text-xs font-medium">
            <AlertCircle size={16} className="shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700 text-xs font-medium">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'SIGNUP' && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Sagar Sharma"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white transition ${
                      fieldErrors.fullName ? 'border-rose-400' : 'border-slate-200 focus:border-sky-500'
                    }`}
                  />
                </div>
                {fieldErrors.fullName && <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.fullName}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Contact Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9801046037"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white transition ${
                      fieldErrors.phone ? 'border-rose-400' : 'border-slate-200 focus:border-sky-500'
                    }`}
                  />
                </div>
                {fieldErrors.phone && <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.phone}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Role Assignment
                </label>
                <div className="relative">
                  <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                  >
                    <option value="OPERATIONS_MANAGER">Operations Manager</option>
                    <option value="PERMITS_DOCUMENTATION_OFFICER">Permits & Documentation Officer</option>
                    <option value="MANAGING_DIRECTOR">Managing Director</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sagarsharmarabi@gmail.com"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white transition ${
                  fieldErrors.email ? 'border-rose-400' : 'border-slate-200 focus:border-sky-500'
                }`}
              />
            </div>
            {fieldErrors.email && <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.email}</p>}
          </div>

          {mode !== 'FORGOT_PASSWORD' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Password
                </label>
                {mode === 'LOGIN' && (
                  <button
                    type="button"
                    onClick={() => switchMode('FORGOT_PASSWORD')}
                    className="text-[11px] font-semibold text-sky-500 hover:text-sky-600 transition cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white transition ${
                    fieldErrors.password ? 'border-rose-400' : 'border-slate-200 focus:border-sky-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.password}</p>}
            </div>
          )}

          {mode === 'SIGNUP' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white transition ${
                    fieldErrors.confirmPassword ? 'border-rose-400' : 'border-slate-200 focus:border-sky-500'
                  }`}
                />
              </div>
              {fieldErrors.confirmPassword && <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.confirmPassword}</p>}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-md shadow-sky-500/25 transition disabled:opacity-50 text-xs mt-2 cursor-pointer"
          >
            {loading ? 'Connecting...' : mode === 'LOGIN' ? 'Sign In to Operations' : mode === 'SIGNUP' ? 'Submit Registration' : 'Send Reset Link'}
          </button>
        </form>

        {mode === 'FORGOT_PASSWORD' && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => switchMode('LOGIN')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}