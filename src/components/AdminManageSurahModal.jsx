import React, { useState } from 'react';
import { X, BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminManageSurahModal({
  isOpen,
  onClose,
  onSave
}) {
  const [number, setNumber] = useState('');
  const [nameLatin, setNameLatin] = useState('');
  const [nameArabic, setNameArabic] = useState('');
  const [totalAyat, setTotalAyat] = useState('');
  const [juz, setJuz] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nameLatin.trim()) {
      setError('Nama latin surah wajib diisi.');
      return;
    }
    if (!number || Number(number) < 1 || Number(number) > 114) {
      setError('Nomor surah harus antara 1 sampai 114.');
      return;
    }
    if (!totalAyat || Number(totalAyat) < 1) {
      setError('Jumlah ayat harus lebih dari 0.');
      return;
    }

    const newSurah = {
      number: Number(number),
      nameLatin: nameLatin.trim(),
      nameArabic: nameArabic.trim() || 'القرآن',
      totalAyat: Number(totalAyat),
      juz: Number(juz) || 1
    };

    onSave(newSurah);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-dark text-white flex items-center justify-center font-bold">
              <BookOpen size={20} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Tambah Surah ke Katalog
              </h2>
              <p className="text-xs text-slate-500">Khusus Akses Admin Utama</p>
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

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                No. Surah
              </label>
              <input
                type="number"
                min="1"
                max="114"
                required
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="Misal: 67"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden transition-all text-center"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Total Ayat
              </label>
              <input
                type="number"
                min="1"
                required
                value={totalAyat}
                onChange={(e) => setTotalAyat(e.target.value)}
                placeholder="30"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden transition-all text-center"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Juz Ke
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={juz}
                onChange={(e) => setJuz(e.target.value)}
                placeholder="29"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden transition-all text-center"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nama Latin Surah
            </label>
            <input
              type="text"
              required
              value={nameLatin}
              onChange={(e) => setNameLatin(e.target.value)}
              placeholder="Contoh: Al-Mulk, Yasin, Al-Kahfi..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Teks Arab (Opsional)
            </label>
            <input
              type="text"
              value={nameArabic}
              onChange={(e) => setNameArabic(e.target.value)}
              placeholder="الملك"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-base text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden transition-all text-right arabic-font"
            />
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
              <span>Simpan Surah</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
