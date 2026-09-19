import React, { useState } from 'react';
import {
  GraduationCap,
  Search,
  Filter,
  Plus,
  PenTool,
  Award,
  ChevronRight,
  BookOpen,
  Trash2,
  Pencil
} from 'lucide-react';

export default function StudentListView({
  santriList = [],
  classList = [],
  setoranList = [],
  currentUser,
  onSelectSantri,
  onOpenSetoranForSantri,
  onOpenAddSantri,
  onDeleteSantri,
  onEditSantri
}) {
  const [search, setSearch] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');

  const isAdmin = currentUser?.role === 'admin';
  const isUstadz = currentUser?.role === 'ustadz';
  const canAdd = isAdmin || isUstadz;

  const filteredSantri = santriList.filter((santri) => {
    const name = santri.fullName || santri.full_name || '';
    const nis = santri.nis || '';
    const classId = santri.classId || santri.class_id || '';

    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      nis.toLowerCase().includes(search.toLowerCase());

    const matchesClass =
      selectedClassFilter === 'ALL' || classId === selectedClassFilter;

    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Data Santri
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Daftar seluruh santri TPQ/Madrasah Darul Istiqomah (Dari kelas yang sudah terdaftar)
          </p>
        </div>

        {canAdd && (
          <button
            onClick={() => onOpenAddSantri()}
            className="bg-brand-dark hover:bg-brand-light text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus size={18} className="text-emerald-400" />
            <span>+ Tambah Santri</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
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
            placeholder="Cari santri berdasarkan nama atau NIS..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={16} className="text-slate-400 shrink-0" />
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="w-full sm:w-56 px-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden"
          >
            <option value="ALL">Semua Kelas / Halaqah</option>
            {classList.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Santri Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredSantri.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200/80 text-center">
            <p className="text-sm font-bold text-slate-700">Tidak ada data santri</p>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian Anda.</p>
          </div>
        ) : (
          filteredSantri.map((santri) => {
            const santriClass = classList.find(c => c.id === santri.classId);
            const santriSetoran = setoranList.filter(s => s.santriId === santri.id);
            const latest = santriSetoran[0] || null;

            return (
              <div
                key={santri.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-5 hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={santri.avatar}
                        alt={santri.fullName}
                        className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 object-cover"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {santri.fullName}
                        </h3>
                        <p className="text-[11px] font-mono text-slate-400 font-semibold">
                          NIS: {santri.nis}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                      {santri.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </span>
                  </div>

                  {/* Class Badge */}
                  <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50/80 px-2.5 py-1.5 rounded-xl border border-emerald-100 font-medium">
                    <BookOpen size={13} className="shrink-0 text-emerald-600" />
                    <span className="truncate">{santriClass ? santriClass.name : 'Belum Ada Kelas'}</span>
                  </div>

                  {/* Latest Setoran info */}
                  <div className="mt-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Setoran Terakhir
                    </p>
                    {latest ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-800">{latest.surahName}</p>
                          <p className="text-[11px] text-slate-500">Ayat {latest.ayatStart} - {latest.ayatEnd}</p>
                        </div>
                        <span
                          className={`text-[11px] font-black px-2.5 py-0.5 rounded-lg border ${
                            latest.predikat === 'A'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : latest.predikat === 'B'
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                          }`}
                        >
                          {latest.predikat}
                        </span>
                      </div>
                    ) : (
                      <p className="text-slate-400 italic text-[11px]">Belum pernah menyetor</p>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => onSelectSantri(santri)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    Buka Rapor
                  </button>

                  {(isAdmin || isUstadz) && (
                    <>
                      <button
                        onClick={() => onOpenSetoranForSantri(santri)}
                        className="py-2 px-3 rounded-xl bg-brand-dark hover:bg-brand-light text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                        title="Catat Setoran"
                      >
                        <PenTool size={14} className="text-emerald-400" />
                        <span>Setor</span>
                      </button>

                      {onEditSantri && (
                        <button
                          onClick={() => onEditSantri(santri)}
                          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Edit Data Santri"
                        >
                          <Pencil size={15} />
                        </button>
                      )}

                      {onDeleteSantri && (
                        <button
                          onClick={() => onDeleteSantri(santri.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Hapus Santri"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
