import React, { useState } from 'react';
import { BookOpen, Plus, Search } from 'lucide-react';

export default function SurahsCatalogView({
  surahsList = [],
  currentUser,
  onOpenAddSurahModal
}) {
  const [search, setSearch] = useState('');
  const isAdmin = currentUser?.role === 'admin';

  const safeSurahs = (surahsList || []).map((s) => ({
    id: s.id || s.number,
    number: s.number,
    nameLatin: s.nameLatin || s.name_latin || `Surah ${s.number}`,
    nameArabic: s.nameArabic || s.name_arabic || '',
    totalAyat: s.totalAyat ?? s.total_ayat ?? 0,
    juz: s.juz || 30
  }));

  const filteredSurahs = safeSurahs.filter((s) => {
    const term = search.toLowerCase();
    const nameMatch = s.nameLatin.toLowerCase().includes(term);
    const numMatch = String(s.number).includes(term);
    return nameMatch || numMatch;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              Katalog Surah
            </h1>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {safeSurahs.length} Surah
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Daftar surah Al-Qur'an (Default: 37 Surah Juz Amma / Juz 30). Admin Utama dapat menambahkan surah dari juz lainnya.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={onOpenAddSurahModal}
            className="bg-brand-dark hover:bg-brand-light text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus size={18} className="text-emerald-400" />
            <span>+ Tambah Surah Baru</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-card">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari surah berdasarkan nama atau nomor surah..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden transition-all"
          />
        </div>
      </div>

      {/* Surahs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredSurahs.map((surah) => (
          <div
            key={surah.id}
            className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-100 group-hover:bg-brand-dark group-hover:text-white transition-colors">
                {surah.number}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {surah.nameLatin}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {surah.totalAyat} Ayat • Juz {surah.juz}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-base text-slate-600 font-semibold arabic-font">
                {surah.nameArabic}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
