import React, { useRef, useState } from 'react';
import {
  X,
  Printer,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Phone,
  User,
  PenTool,
  Pencil,
  Trash2,
  Layers,
  Camera,
  Loader2
} from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';

export default function SantriDetailModal({
  santri,
  onClose,
  classList = [],
  setoranList = [],
  surahsList = [],
  currentUser,
  onOpenSetoranForSantri,
  onOpenBulkSetoranForSantri,
  onEditSetoran,
  onDeleteSetoran,
  onUpdateSantri
}) {
  const fileInputRef = useRef(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [pendingPhoto, setPendingPhoto] = useState(null);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [photoSavedNotice, setPhotoSavedNotice] = useState(false);

  if (!santri) return null;

  const isAdmin = currentUser?.role === 'admin';
  const isUstadz = currentUser?.role === 'ustadz';
  const canRecord = isAdmin || isUstadz;

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const compressedDataUrl = await compressImage(file, 300, 0.7);
      setPendingPhoto(compressedDataUrl);
    } catch (err) {
      console.error('Error compressing image:', err);
      alert('Gagal memproses foto profil. Silakan coba file gambar lain.');
    } finally {
      setIsCompressing(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSavePhoto = async () => {
    if (!pendingPhoto || !onUpdateSantri) return;
    try {
      setIsSavingPhoto(true);
      await onUpdateSantri(santri.id, { avatar: pendingPhoto });
      setPendingPhoto(null);
      setPhotoSavedNotice(true);
      setTimeout(() => setPhotoSavedNotice(false), 3000);
    } catch (err) {
      console.error('Error saving photo:', err);
      alert('Gagal menyimpan foto profil.');
    } finally {
      setIsSavingPhoto(false);
    }
  };

  const currentClass = classList.find(c => c.id === santri.classId);
  const santriSetoran = setoranList.filter(s => s.santriId === santri.id);

  const gradeACount = santriSetoran.filter(s => s.predikat === 'A').length;
  const gradeBCount = santriSetoran.filter(s => s.predikat === 'B').length;
  const gradeCCount = santriSetoran.filter(s => s.predikat === 'C').length;

  // Set of surah names that have been deposited with grade A or B
  const completedSurahs = new Set(
    santriSetoran
      .filter(s => s.predikat === 'A' || s.predikat === 'B')
      .map(s => s.surahName)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Buku Rapor Tahfidz Digital
              </h2>
              <p className="text-xs text-slate-500">
                Madrasah Darul Istiqomah • Progres Santri
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-xs font-semibold flex items-center gap-1.5"
              title="Cetak Rapor Digital"
            >
              <Printer size={16} />
              <span className="hidden sm:inline">Cetak Rapor</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Profile Card */}
          <div className="bg-gradient-to-r from-emerald-900 to-brand-dark text-white p-5 rounded-3xl shadow-md flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="flex flex-col items-center gap-1.5">
                <div className="relative group shrink-0">
                  <img
                    src={pendingPhoto || santri.avatar}
                    alt={santri.fullName}
                    className={`w-16 h-16 rounded-2xl bg-white/10 border-2 object-cover shadow-xs ${
                      pendingPhoto ? 'border-amber-400 ring-4 ring-amber-400/30' : 'border-white/20'
                    }`}
                  />
                  {canRecord && (
                    <>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isCompressing || isSavingPhoto}
                        className="absolute -bottom-1 -right-1 bg-emerald-500 hover:bg-emerald-400 text-white p-1.5 rounded-xl shadow-md border border-white/40 transition-all hover:scale-105"
                        title="Pilih Foto Profil Baru"
                      >
                        {isCompressing ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Camera size={12} />
                        )}
                      </button>
                    </>
                  )}
                </div>

                {/* Explicit Simpan Foto Button when a new photo is selected */}
                {pendingPhoto && (
                  <div className="flex items-center gap-1 mt-1">
                    <button
                      type="button"
                      onClick={handleSavePhoto}
                      disabled={isSavingPhoto}
                      className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-white text-[11px] font-bold rounded-lg shadow-sm flex items-center gap-1 transition-all"
                    >
                      {isSavingPhoto ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={12} />
                      )}
                      <span>Simpan Foto</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingPhoto(null)}
                      className="px-2 py-1 bg-white/20 hover:bg-white/30 text-white text-[11px] font-semibold rounded-lg transition-all"
                    >
                      Batal
                    </button>
                  </div>
                )}

                {photoSavedNotice && (
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-400/40 animate-in fade-in">
                    ✓ Foto tersimpan!
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-lg font-extrabold tracking-tight">
                  {santri.fullName}
                </h3>
                <p className="text-xs text-emerald-200 font-mono mt-0.5">
                  NIS: {santri.nis} • {santri.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="bg-white/15 text-white text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                    {currentClass ? currentClass.name : 'Kelas Umum'}
                  </span>
                  <span className="text-[11px] text-emerald-200">
                    Pengampu: {currentClass ? currentClass.ustadzName : '-'}
                  </span>
                </div>
              </div>
            </div>

            {canRecord && (
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    onClose();
                    onOpenBulkSetoranForSantri?.(santri);
                  }}
                  className="bg-emerald-800/80 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.98] border border-white/20"
                >
                  <Layers size={15} className="text-emerald-300" />
                  <span>+ Input Massal</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenSetoranForSantri(santri);
                  }}
                  className="bg-white hover:bg-emerald-50 text-brand-dark text-xs font-bold px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.98]"
                >
                  <PenTool size={15} className="text-emerald-700" />
                  <span>+ Catat Setoran</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Setoran</p>
              <p className="text-xl font-extrabold text-slate-800 mt-0.5">
                {santriSetoran.length}x
              </p>
            </div>
            <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-100 text-center">
              <p className="text-[10px] uppercase font-bold text-emerald-700">Mumtaz (A)</p>
              <p className="text-xl font-extrabold text-emerald-800 mt-0.5">
                {gradeACount}
              </p>
            </div>
            <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-100 text-center">
              <p className="text-[10px] uppercase font-bold text-amber-700">Jayyid (B)</p>
              <p className="text-xl font-extrabold text-amber-800 mt-0.5">
                {gradeBCount}
              </p>
            </div>
            <div className="bg-red-50 p-3.5 rounded-2xl border border-red-100 text-center">
              <p className="text-[10px] uppercase font-bold text-red-700">Perlu Ulang (C)</p>
              <p className="text-xl font-extrabold text-red-800 mt-0.5">
                {gradeCCount}
              </p>
            </div>
          </div>

          {/* 37 Surah Juz Amma Progress Visualizer */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Capaian Surah Juz 30 (Juz Amma)
                </h4>
                <p className="text-xs text-slate-400">
                  {completedSurahs.size} dari {surahsList.length} surah telah disetor
                </p>
              </div>
              <div className="flex items-center gap-2">
                {canRecord && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenBulkSetoranForSantri?.(santri);
                    }}
                    className="px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold flex items-center gap-1 transition-all"
                  >
                    <Layers size={13} />
                    <span>Input Massal</span>
                  </button>
                )}
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  {Math.round((completedSurahs.size / (surahsList.length || 1)) * 100)}%
                </span>
              </div>
            </div>

            {/* Surah Pills Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1 max-h-48 overflow-y-auto pr-1">
              {surahsList.map((surah) => {
                const surahName = surah.nameLatin || surah.name_latin || `Surah ${surah.number}`;
                const isDone = completedSurahs.has(surahName);
                return (
                  <div
                    key={surah.id || surah.number}
                    className={`p-2 rounded-xl text-[11px] font-bold flex items-center justify-between border transition-all ${
                      isDone
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    <span className="truncate">{surahName}</span>
                    {isDone ? (
                      <CheckCircle2 size={13} className="text-emerald-300 shrink-0" />
                    ) : (
                      <span className="text-[9px] text-slate-400 font-mono shrink-0">
                        {surah.number}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Setoran History Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">
                Riwayat Evaluasi Setoran
              </h4>
              <span className="text-xs text-slate-400">
                {santriSetoran.length} Catatan
              </span>
            </div>

            {santriSetoran.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 italic">
                Belum ada data setoran untuk santri ini.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {santriSetoran.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {item.surahName}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="font-semibold text-slate-600">
                          Ayat {item.ayatStart} - {item.ayatEnd}
                        </span>
                        <span
                          className={`ml-1 text-[10px] font-black px-2 py-0.5 rounded-md border ${
                            item.predikat === 'A'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : item.predikat === 'B'
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                          }`}
                        >
                          Predikat {item.predikat}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] italic">
                        "{item.notes}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 shrink-0">
                      <div className="text-left sm:text-right">
                        <p className="font-medium text-slate-600">{item.ustadzName}</p>
                        <p>{item.date}</p>
                      </div>

                      {canRecord && (
                        <div className="flex items-center gap-1 border-l border-slate-200 pl-2 ml-1">
                          <button
                            onClick={() => onEditSetoran(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                            title="Edit Catatan Setoran"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => onDeleteSetoran(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                            title="Hapus Catatan Setoran"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
