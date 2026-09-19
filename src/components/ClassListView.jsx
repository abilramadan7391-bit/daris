import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Users,
  Lock,
  Unlock,
  ChevronRight,
  ShieldCheck,
  Clock,
  MapPin
} from 'lucide-react';

export default function ClassListView({
  classList = [],
  santriList = [],
  currentUser,
  onEnterClass,
  onOpenCreateClassModal,
  isClassUnlocked
}) {
  const isAdmin = currentUser?.role === 'admin';
  const isUstadz = currentUser?.role === 'ustadz' || currentUser?.role === 'ustadzah';
  const isLoggedIn = isAdmin || isUstadz;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Kelas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Daftar kelas TPQ/Madrasah Darul Istiqomah
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={onOpenCreateClassModal}
            className="bg-brand-dark hover:bg-brand-light text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus size={18} className="text-emerald-400" />
            <span>+ Buat Kelas Baru</span>
          </button>
        )}
      </div>

      {/* Grid of Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classList.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200/80 text-center">
            <p className="text-sm font-bold text-slate-700">Belum ada kelas yang terdaftar</p>
            <p className="text-xs text-slate-400 mt-1">
              {isAdmin
                ? 'Klik tombol "+ Buat Kelas Baru" di atas atau jalankan script manage.py untuk membuat kelas.'
                : 'Belum ada kelas/halaqah aktif saat ini.'}
            </p>
          </div>
        ) : (
          classList.map((cls) => {
          const countSantri = santriList.filter(s => s.classId === cls.id).length;
          const isUnlocked = isClassUnlocked(cls.id);

          return (
            <div
              key={cls.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 flex flex-col justify-between hover:shadow-card-hover transition-all duration-200"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-100/70 text-brand-dark flex items-center justify-center font-bold">
                    <BookOpen size={22} />
                  </div>

                  {isUnlocked ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
                      <Unlock size={13} />
                      Terverifikasi PIN
                    </span>
                  ) : !isLoggedIn ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                      <Lock size={13} />
                      Terkunci (Perlu Login)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
                      <Lock size={13} />
                      Perlu PIN 4-Angka
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {cls.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {cls.description || 'Kelompok bimbingan tahfidzul quran.'}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Wali Kelas:</span>
                    <span className="font-bold text-slate-800">{cls.ustadzName}</span>
                  </div>

                  {cls.room && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <MapPin size={12} /> Ruang:
                      </span>
                      <span className="font-semibold text-slate-700">{cls.room}</span>
                    </div>
                  )}

                  {cls.schedule && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock size={12} /> Jadwal:
                      </span>
                      <span className="font-semibold text-slate-700">{cls.schedule}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Users size={12} /> Santri:
                    </span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {countSantri} Santri
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-2">
                <button
                  onClick={() => onEnterClass(cls)}
                  className={`w-full py-2.5 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    isUnlocked
                      ? 'bg-brand-dark hover:bg-brand-light text-white shadow-xs'
                      : !isLoggedIn
                      ? 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  }`}
                >
                  <span>
                    {isUnlocked
                      ? 'Buka & Kelola Kelas'
                      : !isLoggedIn
                      ? 'Terkunci (Perlu Login)'
                      : 'Masukkan PIN Kelas'}
                  </span>
                  <ChevronRight size={15} />
                </button>

                {isAdmin && (
                  <p className="text-[10px] text-center text-slate-400 mt-2">
                    Kode PIN Kelas: <span className="font-mono font-bold text-slate-700">{cls.pinCode}</span>
                  </p>
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
