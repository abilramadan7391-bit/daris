import React, { useState, useEffect } from 'react';
import { X, GraduationCap, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AddSantriModal({
  isOpen,
  onClose,
  onSave,
  classList = [],
  defaultClassId = '',
  editingSantri = null
}) {
  const [nis, setNis] = useState('');
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState('L');
  const [classId, setClassId] = useState(defaultClassId || classList[0]?.id || '');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [targetJuz, setTargetJuz] = useState(30);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingSantri) {
      setNis(editingSantri.nis || '');
      setFullName(editingSantri.fullName || '');
      setNickname(editingSantri.nickname || '');
      setGender(editingSantri.gender || 'L');
      setClassId(editingSantri.classId || defaultClassId || classList[0]?.id || '');
      setParentName(editingSantri.parentName || '');
      setParentPhone(editingSantri.parentPhone || '');
      setTargetJuz(editingSantri.targetJuz || 30);
    } else {
      setNis(`DI-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`);
      setFullName('');
      setNickname('');
      setGender('L');
      setClassId(defaultClassId || classList[0]?.id || '');
      setParentName('');
      setParentPhone('');
      setTargetJuz(30);
    }
  }, [editingSantri, defaultClassId, classList, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Nama lengkap santri wajib diisi.');
      return;
    }
    if (!nis.trim()) {
      setError('NIS wajib diisi.');
      return;
    }

    const santriData = {
      nis: nis.trim(),
      fullName: fullName.trim(),
      nickname: nickname.trim() || fullName.trim().split(' ')[0],
      gender,
      classId,
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      targetJuz: Number(targetJuz) || 30
    };

    onSave(santriData, editingSantri?.id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-dark text-white flex items-center justify-center font-bold">
              <GraduationCap size={20} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {editingSantri ? 'Edit Data Santri' : 'Tambah Santri Baru'}
              </h2>
              <p className="text-xs text-slate-500">
                Data santri tahfidz Madrasah Darul Istiqomah
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-2xl text-xs font-medium border border-red-200">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                NIS (Nomor Induk Santri)
              </label>
              <input
                type="text"
                required
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                placeholder="DI-2026-001"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-mono font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Jenis Kelamin
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGender('L')}
                  className={`flex-1 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                    gender === 'L'
                      ? 'bg-brand-dark text-white border-brand-dark'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Laki-laki (L)
                </button>
                <button
                  type="button"
                  onClick={() => setGender('P')}
                  className={`flex-1 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                    gender === 'P'
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Perempuan (P)
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nama Lengkap Santri
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Contoh: Ahmad Fauzan Robbani"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kelas / Halaqah
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden transition-all"
              >
                {classList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Target Hafalan (Juz)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={targetJuz}
                onChange={(e) => setTargetJuz(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden transition-all text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nama Orang Tua / Wali
              </label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Nama ayah / ibu"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                No. WhatsApp Wali
              </label>
              <input
                type="text"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="0812xxxxxxx"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden transition-all"
              />
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-2xl bg-brand-dark hover:bg-brand-light text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>{editingSantri ? 'Simpan Perubahan' : 'Daftarkan Santri'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
