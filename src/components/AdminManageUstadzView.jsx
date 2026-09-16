import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  Trash2,
  Edit,
  Mail,
  Lock,
  BookOpen,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { isSupabaseConfigured, supabase, dataService } from '../lib/supabaseClient';

export default function AdminManageUstadzView({
  classList = [],
  currentUser,
  onRefreshData
}) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [deletingProfile, setDeletingProfile] = useState(null);

  // Form states for Add/Edit
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formRole, setFormRole] = useState('ustadz');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Fetch profiles on mount
  const loadProfiles = async () => {
    setLoading(true);
    try {
      const data = await dataService.getProfiles();
      setProfiles(data || []);
    } catch (err) {
      console.error('Error fetching profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  // Filter profiles
  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch =
      (p.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.email || '').toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === 'ALL' ||
      (roleFilter === 'USTADZ_ALL' ? (p.role === 'ustadz' || p.role === 'ustadzah') : p.role === roleFilter);

    return matchesSearch && matchesRole;
  });

  // Calculate statistics
  const totalUsers = profiles.length;
  const countUstadz = profiles.filter(p => p.role === 'ustadz').length;
  const countUstadzah = profiles.filter(p => p.role === 'ustadzah').length;
  const countAdmin = profiles.filter(p => p.role === 'admin').length;

  // Open Add Modal
  const handleOpenAddModal = () => {
    setFormEmail('');
    setFormPassword('');
    setFormFullName('');
    setFormRole('ustadz');
    setFormError('');
    setFormSuccess('');
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (profile) => {
    setEditingProfile(profile);
    setFormFullName(profile.fullName);
    setFormRole(profile.role);
    setFormError('');
    setFormSuccess('');
  };

  // Handle Add User Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setFormSubmitting(true);

    const cleanEmail = formEmail.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setFormError('Alamat email tidak valid.');
      setFormSubmitting(false);
      return;
    }

    if (formPassword.length < 6) {
      setFormError('Password minimal 6 karakter.');
      setFormSubmitting(false);
      return;
    }

    if (!formFullName.trim()) {
      setFormError('Nama lengkap harus diisi.');
      setFormSubmitting(false);
      return;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        // Sign up user via Supabase Auth
        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email: cleanEmail,
          password: formPassword,
          options: {
            data: {
              full_name: formFullName.trim(),
              role: formRole
            }
          }
        });

        if (authErr) {
          throw new Error(authErr.message);
        }

        const userId = authData?.user?.id;

        if (userId) {
          // Insert profile record into profiles table
          await supabase.from('profiles').upsert([
            {
              id: userId,
              full_name: formFullName.trim(),
              role: formRole,
              avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(formFullName.trim())}`
            }
          ]);
        }

        setFormSuccess(`Berhasil mendaftarkan ${formFullName.trim()} (${formRole.toUpperCase()})!`);
        setTimeout(() => {
          setIsAddModalOpen(false);
          loadProfiles();
          if (onRefreshData) onRefreshData();
        }, 1200);

      } catch (err) {
        setFormError(err.message || 'Gagal mendaftarkan user baru.');
      } finally {
        setFormSubmitting(false);
      }
    } else {
      // Local fallback
      const newProfile = {
        id: `usr-${Date.now()}`,
        fullName: formFullName.trim(),
        email: cleanEmail,
        role: formRole,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(formFullName.trim())}`
      };
      setProfiles([newProfile, ...profiles]);
      setFormSuccess('User berhasil ditambahkan ke store lokal!');
      setTimeout(() => {
        setIsAddModalOpen(false);
      }, 1000);
      setFormSubmitting(false);
    }
  };

  // Handle Edit User Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingProfile) return;

    setFormError('');
    setFormSubmitting(true);

    try {
      await dataService.updateProfile(editingProfile.id, {
        fullName: formFullName.trim(),
        role: formRole
      });

      setFormSuccess('Profil pengajar berhasil diperbarui!');
      setTimeout(() => {
        setEditingProfile(null);
        loadProfiles();
        if (onRefreshData) onRefreshData();
      }, 1000);
    } catch (err) {
      setFormError('Gagal memperbarui profil: ' + err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!deletingProfile) return;

    try {
      await dataService.deleteProfile(deletingProfile.id);
      setProfiles(profiles.filter(p => p.id !== deletingProfile.id));
      setDeletingProfile(null);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      alert('Gagal menghapus user: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              Kelola User
            </h1>
            <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
              Khusus Admin
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manajemen akun pengajar halaqah, penetapan role, dan registrasi ustadz/ustadzah baru.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-brand-dark hover:bg-brand-light text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-sm transition-all active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus size={18} className="text-emerald-400" />
          <span>+ Tambah Ustadz / Pengajar</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Pengajar</p>
              <p className="text-xl font-extrabold text-slate-900">{totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
              <UserCheck size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Ustadz (Laki-laki)</p>
              <p className="text-xl font-extrabold text-slate-900">{countUstadz}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-800 flex items-center justify-center font-bold">
              <UserCheck size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Ustadzah (Perempuan)</p>
              <p className="text-xl font-extrabold text-slate-900">{countUstadzah}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Admin Utama</p>
              <p className="text-xl font-extrabold text-slate-900">{countAdmin}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-card flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari ustadz berdasarkan nama atau email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden transition-all"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full sm:w-56 px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden"
        >
          <option value="ALL">Semua Peran / Role</option>
          <option value="USTADZ_ALL">Ustadz & Ustadzah</option>
          <option value="ustadz">Ustadz saja (Laki-laki)</option>
          <option value="ustadzah">Ustadzah saja (Perempuan)</option>
          <option value="admin">Admin Utama</option>
        </select>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center">
          <p className="text-sm font-semibold text-slate-600">Memuat daftar pengajar...</p>
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center">
          <p className="text-sm font-bold text-slate-700">Belum ada data pengajar</p>
          <p className="text-xs text-slate-400 mt-1">
            Klik tombol "+ Tambah Ustadz / Pengajar" di atas untuk mendaftarkan ustadz baru.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredProfiles.map((user) => {
            const assignedClass = classList.find((c) => c.ustadzId === user.id);
            const isSelf = currentUser?.id === user.id;

            return (
              <div
                key={user.id}
                className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top user header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.fullName}
                        className="w-11 h-11 rounded-2xl object-cover ring-2 ring-emerald-500/20 bg-slate-100"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">
                          {user.fullName}
                        </h3>
                        <p className="text-[11px] text-slate-400 truncate max-w-[160px]">
                          {user.email || 'Email belum diset'}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                        user.role === 'admin'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : user.role === 'ustadzah'
                          ? 'bg-purple-100 text-purple-900 border border-purple-200'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      }`}
                    >
                      {user.role === 'admin'
                        ? 'Admin Utama'
                        : user.role === 'ustadzah'
                        ? 'Ustadzah'
                        : 'Ustadz'}
                    </span>
                  </div>

                  {/* Assigned Class info */}
                  <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Halaqah Asuhan
                    </p>
                    {assignedClass ? (
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                          <BookOpen size={13} className="text-emerald-600" />
                          {assignedClass.name}
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded-md text-slate-600 border border-slate-200">
                          PIN: {assignedClass.pinCode}
                        </span>
                      </div>
                    ) : (
                      <p className="text-slate-400 italic text-[11px]">
                        Belum ditugaskan di kelas mana pun
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenEditModal(user)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Edit size={14} />
                    <span>Edit Profil</span>
                  </button>

                  {!isSelf && (
                    <button
                      onClick={() => setDeletingProfile(user)}
                      className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                      title="Hapus Pengajar"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: TAMBAH USTADZ BARU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-dark text-white flex items-center justify-center font-bold">
                  <UserCheck size={20} className="text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Tambah Pengajar Baru
                  </h2>
                  <p className="text-xs text-slate-500">
                    Registrasi Ustadz / Ustadzah Baru
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 sm:p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-2xl text-xs font-medium border border-red-200">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-medium border border-emerald-200">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Lengkap & Gelar
                </label>
                <input
                  type="text"
                  required
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  placeholder="Contoh: Ustadz Ahmad Fauzi, S.Pd.I"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Alamat Email Pengguna
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="ahmad.fauzi@daris.sch.id"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password Akun (min. 6 karakter)
                </label>
                <input
                  type="password"
                  required
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Peran / Role Pengguna
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden"
                >
                  <option value="ustadz">Ustadz (Pengajar Laki-laki / Putra)</option>
                  <option value="ustadzah">Ustadzah (Pengajar Perempuan / Putri)</option>
                  <option value="admin">Admin Utama (Akses Penuh Seluruh Sistem)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full py-2.5 px-4 bg-brand-dark hover:bg-brand-light text-white text-xs sm:text-sm font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] disabled:opacity-60"
                >
                  {formSubmitting ? (
                    <span>Mendaftarkan...</span>
                  ) : (
                    <>
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      <span>Simpan & Daftarkan Pengajar</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT USTADZ */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-dark text-white flex items-center justify-center font-bold">
                  <Edit size={18} className="text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Edit Profil Pengajar
                  </h2>
                  <p className="text-xs text-slate-500">
                    Perbarui Nama atau Peran Role
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingProfile(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 sm:p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-2xl text-xs font-medium border border-red-200">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-medium border border-emerald-200">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Peran / Role Pengguna
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden"
                >
                  <option value="ustadz">Ustadz (Pengajar Laki-laki / Putra)</option>
                  <option value="ustadzah">Ustadzah (Pengajar Perempuan / Putri)</option>
                  <option value="admin">Admin Utama (Akses Penuh Seluruh Sistem)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full py-2.5 px-4 bg-brand-dark hover:bg-brand-light text-white text-xs sm:text-sm font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] disabled:opacity-60"
                >
                  {formSubmitting ? (
                    <span>Menyimpan...</span>
                  ) : (
                    <>
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: KONFIRMASI HAPUS */}
      {deletingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-100 p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 font-bold">
              <Trash2 size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Hapus Pengajar?
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Apakah Anda yakin ingin menghapus akun <span className="font-bold text-slate-800">{deletingProfile.fullName}</span>? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeletingProfile(null)}
                className="py-2.5 px-4 rounded-2xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="py-2.5 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
