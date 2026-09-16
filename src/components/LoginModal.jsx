import React, { useState } from 'react';
import {
  X,
  LogIn,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

export default function LoginModal({
  isOpen,
  onClose,
  onSelectUser,
  onSetGuest
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    // 1. Try Supabase Auth
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });

        if (!authError && data?.user) {
          // Fetch user profile from profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const metaRole = data.user.user_metadata?.role;
          const userRole = profile?.role || metaRole || (cleanEmail.includes('admin') ? 'admin' : 'ustadz');
          const fullName = profile?.full_name || data.user.user_metadata?.full_name || (userRole === 'admin' ? 'Admin Utama' : 'Ustadz Pengajar');

          onSelectUser({
            id: data.user.id,
            fullName: fullName,
            role: userRole,
            email: data.user.email,
            avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fullName)}`
          });
          setLoading(false);
          onClose();
          return;
        } else if (authError) {
          let msg = authError.message;
          if (msg === 'Invalid login credentials') {
            msg = 'Email atau password salah. Silakan periksa kembali.';
          } else if (msg === 'Email not confirmed') {
            msg = 'Email belum dikonfirmasi. Silakan matikan opsi "Confirm email" di Dashboard Supabase (Authentication -> Providers -> Email).';
          }
          setError(msg);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Supabase auth attempt error:', err);
      }
    }

    // Fallback error
    setError('Email atau password salah. Silakan periksa kembali kredensial Anda.');
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-dark text-white flex items-center justify-center font-bold shadow-xs">
              <LogIn size={20} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Masuk Sistem Madrasah
              </h2>
              <p className="text-xs text-slate-500">
                Akses Pengajar & Administrasi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-2xl text-xs font-medium border border-red-200 animate-in fade-in duration-100">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Email Akun
            </label>
            <div className="relative">
              <Mail
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-brand-dark hover:bg-brand-light text-white text-xs sm:text-sm font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span>Masuk ke Sistem</span>
                </>
              )}
            </button>
          </div>

          {/* Close / Guest mode option */}
          <div className="pt-2 text-center border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                onSetGuest();
                onClose();
              }}
              className="text-xs text-slate-500 hover:text-slate-700 font-medium hover:underline"
            >
              Tetap lanjut sebagai Tamu / Pengunjung
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
