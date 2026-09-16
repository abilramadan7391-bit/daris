import React from 'react';
import {
  ArrowLeft,
  Users,
  Plus,
  BookOpen,
  Calendar,
  PenTool,
  Clock,
  KeyRound,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function ClassDetailView({
  targetClass,
  onBack,
  santriList = [],
  setoranList = [],
  currentUser,
  onOpenSetoranForSantri,
  onOpenAddSantri,
  onSelectSantri,
  onEditSantri
}) {
  const isAdmin = currentUser?.role === 'admin';
  const isUstadz = currentUser?.role === 'ustadz' || currentUser?.role === 'ustadzah';
  const canEdit = isAdmin || isUstadz;

  // Filter santri in this class
  const classSantri = santriList.filter(s => s.classId === targetClass.id);

  return (
    <div className="space-y-6">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {targetClass.name}
              </h1>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {classSantri.length} Santri
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Wali Kelas: <span className="font-semibold text-slate-800">{targetClass.ustadzName}</span>
            </p>
          </div>
        </div>

        {canEdit && (
          <button
            onClick={() => onOpenAddSantri(targetClass.id)}
            className="bg-brand-dark hover:bg-brand-light text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus size={18} className="text-emerald-400" />
            <span>+ Tambah Santri Baru</span>
          </button>
        )}
      </div>

      {/* Info Card Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
            <BookOpen size={18} />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Deskripsi</p>
            <p className="text-xs font-bold text-slate-800">{targetClass.description || 'Halaqah Tahfidz Qur\'an'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Jadwal & Ruangan</p>
            <p className="text-xs font-bold text-slate-800">{targetClass.schedule || 'Senin - Kamis'} ({targetClass.room || 'Ruang Halaqah'})</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
            <KeyRound size={18} />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Kode PIN Verifikasi</p>
            <p className="text-xs font-bold text-slate-800">
              {isAdmin || canEdit ? (
                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">{targetClass.pinCode}</span>
              ) : (
                '•••• (Terkunci)'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Santri Table in this class */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Daftar Santri ({classSantri.length})
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            Pencatatan hafalan harian
          </span>
        </div>

        {classSantri.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Users size={24} />
            </div>
            <p className="text-sm font-bold text-slate-700">Belum ada santri di kelas ini</p>
            <p className="text-xs text-slate-400 mt-1">
              {canEdit ? 'Klik tombol "+ Tambah Santri Baru" di atas untuk menambahkan santri.' : 'Belum ada santri yang terdaftar.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-5">Santri</th>
                  <th className="py-3 px-4">NIS</th>
                  <th className="py-3 px-4">Setoran Terakhir</th>
                  <th className="py-3 px-4 text-center">Predikat Terakhir</th>
                  <th className="py-3 px-4 text-center">Total Riwayat</th>
                  <th className="py-3 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {classSantri.map((santri) => {
                  const santriSetoran = setoranList.filter(s => s.santriId === santri.id);
                  const latest = santriSetoran[0] || null;

                  return (
                    <tr
                      key={santri.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Santri Name & Avatar */}
                      <td className="py-3.5 px-5">
                        <div
                          onClick={() => onSelectSantri(santri)}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <img
                            src={santri.avatar}
                            alt={santri.fullName}
                            className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                              {santri.fullName}
                            </p>
                            <span className="text-[10px] text-slate-400">
                              Wali: {santri.parentName || '-'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* NIS */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-600">
                        {santri.nis}
                      </td>

                      {/* Latest Setoran */}
                      <td className="py-3.5 px-4">
                        {latest ? (
                          <div>
                            <p className="font-bold text-slate-800">
                              {latest.surahName}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Ayat {latest.ayatStart} - {latest.ayatEnd} • {latest.date}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">
                            Belum ada setoran
                          </span>
                        )}
                      </td>

                      {/* Latest Grade */}
                      <td className="py-3.5 px-4 text-center">
                        {latest ? (
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                              latest.predikat === 'A'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : latest.predikat === 'B'
                                ? 'bg-amber-100 text-amber-800 border-amber-200'
                                : 'bg-red-100 text-red-800 border-red-200'
                            }`}
                          >
                            Predikat {latest.predikat}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Total Count */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                        {santriSetoran.length}x
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canEdit && (
                            <button
                              onClick={() => onOpenSetoranForSantri(santri)}
                              className="p-1.5 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1 transition-colors"
                              title="Catat Setoran Baru"
                            >
                              <PenTool size={13} />
                              <span>Setor</span>
                            </button>
                          )}

                          <button
                            onClick={() => onSelectSantri(santri)}
                            className="p-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors"
                            title="Lihat Rapor Santri"
                          >
                            Rapor
                          </button>

                          {canEdit && (
                            <button
                              onClick={() => onEditSantri(santri)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                              title="Edit Data Santri"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
