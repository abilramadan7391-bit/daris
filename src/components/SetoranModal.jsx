import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  User
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SetoranModal({
  isOpen,
  onClose,
  onSave,
  santriList = [],
  classList = [],
  surahsList = [],
  preselectedSantri = null,
  currentUser
}) {
  const [selectedSantriId, setSelectedSantriId] = useState('');
  const [surahQuery, setSurahQuery] = useState('');
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [isSurahDropdownOpen, setIsSurahDropdownOpen] = useState(false);
  const [ayatStart, setAyatStart] = useState(1);
  const [ayatEnd, setAyatEnd] = useState(1);
  const [predikat, setPredikat] = useState('A');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const isUstadz = currentUser?.role === 'ustadz' || currentUser?.role === 'ustadzah';
  const assignedClass = isUstadz ? classList.find(c => c.ustadzId === currentUser?.id) : null;

  // Filter santri for Ustadz: only show santri in assigned class
  const availableSantriList = (isUstadz && assignedClass)
    ? santriList.filter(s => s.classId === assignedClass.id)
    : santriList;

  useEffect(() => {
    if (preselectedSantri) {
      setSelectedSantriId(preselectedSantri.id);
    } else if (availableSantriList.length > 0 && (!selectedSantriId || !availableSantriList.some(s => s.id === selectedSantriId))) {
      setSelectedSantriId(availableSantriList[0].id);
    }
  }, [preselectedSantri, availableSantriList]);

  // Filter surahs based on user typing
  const filteredSurahs = surahQuery.trim() === ''
    ? surahsList.slice(0, 8)
    : surahsList.filter(s => {
        const name = s.nameLatin || s.name_latin || '';
        return (
          name.toLowerCase().includes(surahQuery.toLowerCase()) ||
          String(s.number).includes(surahQuery)
        );
      });

  const handleSelectSurah = (surah) => {
    const name = surah.nameLatin || surah.name_latin || `Surah ${surah.number}`;
    const total = surah.totalAyat ?? surah.total_ayat ?? 10;
    setSelectedSurah({ ...surah, nameLatin: name, totalAyat: total });
    setSurahQuery(name);
    setIsSurahDropdownOpen(false);
    setAyatStart(1);
    setAyatEnd(Math.min(10, total));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSantriId) {
      setError('Silakan pilih santri terlebih dahulu.');
      return;
    }
    if (!selectedSurah) {
      setError('Silakan pilih surah dari daftar saran.');
      return;
    }
    if (Number(ayatStart) < 1 || Number(ayatEnd) < Number(ayatStart)) {
      setError('Rentang ayat tidak valid. Ayat akhir harus >= ayat mulai.');
      return;
    }
    if (Number(ayatEnd) > selectedSurah.totalAyat) {
      setError(`Surah ${selectedSurah.nameLatin} hanya memiliki ${selectedSurah.totalAyat} ayat.`);
      return;
    }

    const santri = santriList.find(s => s.id === selectedSantriId);

    const record = {
      santriId: santri.id,
      santriName: santri.fullName,
      classId: santri.classId,
      surahId: selectedSurah.id,
      surahName: selectedSurah.nameLatin,
      ayatStart: Number(ayatStart),
      ayatEnd: Number(ayatEnd),
      predikat,
      notes: notes.trim() || 'Alhamdulillah setoran lancar.',
      ustadzId: currentUser?.id || 'usr-ustadz-1',
      ustadzName: currentUser?.fullName || 'Ustadz Pengampu'
    };

    onSave(record);

    // Trigger celebratory confetti for Grade A
    if (predikat === 'A') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Ignore confetti failure on minimal environments
      }
    }

    // Reset & Close
    setSurahQuery('');
    setSelectedSurah(null);
    setNotes('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-dark text-white flex items-center justify-center shadow-xs">
              <BookOpen size={20} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Catat Setoran Hafalan
              </h2>
              <p className="text-xs text-slate-500">
                Input evaluasi hafalan santri Darul Istiqomah
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

          {/* Santri Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Pilih Santri
              </label>
              {isUstadz && assignedClass && (
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Halaqah Asuhan: {assignedClass.name}
                </span>
              )}
            </div>
            <div className="relative">
              <select
                value={selectedSantriId}
                onChange={(e) => setSelectedSantriId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden transition-all"
              >
                {availableSantriList.length === 0 ? (
                  <option value="">-- Belum ada santri di kelas asuhan Anda --</option>
                ) : (
                  availableSantriList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.nis})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Autocomplete Surah Input */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nama Surah <span className="text-emerald-700 font-normal">(Ketik untuk mencari surah)</span>
            </label>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={surahQuery}
                onChange={(e) => {
                  setSurahQuery(e.target.value);
                  setIsSurahDropdownOpen(true);
                  if (selectedSurah && e.target.value !== selectedSurah.nameLatin) {
                    setSelectedSurah(null);
                  }
                }}
                onFocus={() => setIsSurahDropdownOpen(true)}
                placeholder="Ketik nama surah, misal: An-Naba, Al-Ikhlas..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden transition-all"
              />
              {selectedSurah && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  {selectedSurah.totalAyat} Ayat
                </span>
              )}
            </div>

            {/* Surah Dropdown Results */}
            {isSurahDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsSurahDropdownOpen(false)}
                />
                <div className="absolute top-full left-0 right-0 mt-1.5 max-h-48 overflow-y-auto bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-20">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Daftar Surah (Juz Amma & Master)
                  </div>
                  {filteredSurahs.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-slate-500 text-center">
                      Surah tidak ditemukan. Coba ketik nama lain.
                    </div>
                  ) : (
                    filteredSurahs.map((surah) => (
                      <button
                        key={surah.id}
                        type="button"
                        onClick={() => handleSelectSurah(surah)}
                        className="w-full px-3.5 py-2 flex items-center justify-between hover:bg-emerald-50/80 text-left transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                            {surah.number}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-slate-800">
                              {surah.nameLatin || surah.name_latin}
                            </span>
                            <span className="text-[11px] text-slate-400 ml-2">
                              ({surah.totalAyat ?? surah.total_ayat ?? 0} ayat)
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-slate-500 font-semibold arabic-font">
                          {surah.nameArabic || surah.name_arabic}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          {/* Ayat Range Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Ayat Mulai
              </label>
              <input
                type="number"
                min="1"
                max={selectedSurah ? selectedSurah.totalAyat : 286}
                value={ayatStart}
                onChange={(e) => setAyatStart(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden transition-all text-center"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Ayat Selesai
              </label>
              <input
                type="number"
                min={ayatStart || 1}
                max={selectedSurah ? selectedSurah.totalAyat : 286}
                value={ayatEnd}
                onChange={(e) => setAyatEnd(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden transition-all text-center"
              />
            </div>
          </div>

          {/* Predikat Selector (A, B, C) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Predikat Kelancaran
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setPredikat('A')}
                className={`py-2.5 px-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                  predikat === 'A'
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-500/30'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="text-base font-black">A</span>
                <span className="text-[10px] font-semibold mt-0.5 opacity-90">
                  Mumtaz (Lancar)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPredikat('B')}
                className={`py-2.5 px-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                  predikat === 'B'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm ring-2 ring-amber-400/30'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="text-base font-black">B</span>
                <span className="text-[10px] font-semibold mt-0.5 opacity-90">
                  Jayyid (Cukup)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPredikat('C')}
                className={`py-2.5 px-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                  predikat === 'C'
                    ? 'bg-red-600 text-white border-red-600 shadow-sm ring-2 ring-red-400/30'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="text-base font-black">C</span>
                <span className="text-[10px] font-semibold mt-0.5 opacity-90">
                  Perlu Ulang
                </span>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Catatan Ustadz / Makhraj & Tajwid
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Perhatikan panjang harakat mad jaiz dan dengung ikhfa'..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden transition-all resize-none"
            />
          </div>

          {/* Action Buttons */}
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
              <span>Simpan Setoran</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
