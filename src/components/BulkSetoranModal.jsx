import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  CheckSquare,
  Square,
  Layers,
  Calendar,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BulkSetoranModal({
  isOpen,
  onClose,
  onSaveBatch,
  santriList = [],
  classList = [],
  surahsList = [],
  setoranList = [],
  preselectedSantri = null,
  currentUser
}) {
  const [selectedSantriId, setSelectedSantriId] = useState('');
  const [selectedSurahIds, setSelectedSurahIds] = useState([]);
  const [surahQuery, setSurahQuery] = useState('');
  const [predikat, setPredikat] = useState('A');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('Input setoran awal/riwayat hafalan santri.');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isUstadz = currentUser?.role === 'ustadz' || currentUser?.role === 'ustadzah';
  const assignedClass = isUstadz ? classList.find(c => c.ustadzId === currentUser?.id) : null;

  // Filter santri for Ustadz: only show santri in assigned class
  const availableSantriList = (isUstadz && assignedClass)
    ? santriList.filter(s => s.classId === assignedClass.id)
    : santriList;

  // Sync selected santri when modal opens or preselected changes
  useEffect(() => {
    if (preselectedSantri) {
      setSelectedSantriId(preselectedSantri.id);
    } else if (availableSantriList.length > 0 && (!selectedSantriId || !availableSantriList.some(s => s.id === selectedSantriId))) {
      setSelectedSantriId(availableSantriList[0].id);
    }
  }, [preselectedSantri, availableSantriList]);

  // Set of surah IDs/Names already completed by the selected santri
  const currentSantriSetoran = setoranList.filter(s => s.santriId === selectedSantriId);
  const completedSurahIds = new Set(
    currentSantriSetoran
      .filter(s => s.predikat === 'A' || s.predikat === 'B')
      .map(s => String(s.surahId))
  );
  const completedSurahNames = new Set(
    currentSantriSetoran
      .filter(s => s.predikat === 'A' || s.predikat === 'B')
      .map(s => (s.surahName || '').toLowerCase().trim())
  );

  const isSurahDone = (surah) => {
    const name = (surah.nameLatin || surah.name_latin || '').toLowerCase().trim();
    return completedSurahIds.has(String(surah.id)) || completedSurahIds.has(String(surah.number)) || completedSurahNames.has(name);
  };

  // Reset selected surahs when santri changes
  useEffect(() => {
    setSelectedSurahIds([]);
    setError('');
  }, [selectedSantriId]);

  // Filtered surahs for UI search
  const filteredSurahs = surahsList.filter(s => {
    if (!surahQuery.trim()) return true;
    const q = surahQuery.toLowerCase();
    const name = (s.nameLatin || s.name_latin || '').toLowerCase();
    const number = String(s.number);
    return name.includes(q) || number.includes(q);
  });

  const toggleSurah = (surahId) => {
    setSelectedSurahIds(prev => {
      if (prev.includes(surahId)) {
        return prev.filter(id => id !== surahId);
      } else {
        return [...prev, surahId];
      }
    });
  };

  // Quick selection handlers
  const handleSelectAllJuzAmma = () => {
    // Select all surahs that are not yet completed
    const uncompletedIds = surahsList
      .filter(s => !isSurahDone(s))
      .map(s => s.id || s.number);
    setSelectedSurahIds(uncompletedIds);
  };

  const handleSelectShortSurahs = () => {
    // Select Adh-Dhuha (93) to An-Nas (114) that are not yet completed
    const shortSurahIds = surahsList
      .filter(s => s.number >= 93 && s.number <= 114 && !isSurahDone(s))
      .map(s => s.id || s.number);
    setSelectedSurahIds(shortSurahIds);
  };

  const handleClearSelection = () => {
    setSelectedSurahIds([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSantriId) {
      setError('Silakan pilih santri terlebih dahulu.');
      return;
    }
    if (selectedSurahIds.length === 0) {
      setError('Silakan pilih setidaknya satu surah untuk disetor.');
      return;
    }

    const santri = santriList.find(s => String(s.id) === String(selectedSantriId));
    if (!santri) {
      setError('Data santri tidak ditemukan.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const records = selectedSurahIds.map(surahId => {
        const surah = surahsList.find(s => String(s.id) === String(surahId) || String(s.number) === String(surahId));
        const name = surah ? (surah.nameLatin || surah.name_latin) : `Surah ${surahId}`;
        const totalAyat = surah ? (surah.totalAyat ?? surah.total_ayat ?? 1) : 1;

        return {
          santriId: santri.id,
          santriName: santri.fullName || santri.name || 'Santri',
          classId: santri.classId,
          surahId: surah ? surah.id || surah.number : surahId,
          surahName: name,
          ayatStart: 1,
          ayatEnd: totalAyat,
          predikat,
          notes: notes.trim() || 'Input setoran awal/riwayat hafalan santri.',
          ustadzId: currentUser?.id || 'usr-ustadz-1',
          ustadzName: currentUser?.fullName || 'Ustadz Pengampu',
          date,
          isBulk: true
        };
      });

      await onSaveBatch(records);

      if (predikat === 'A') {
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch (err) {
          // ignore confetti error
        }
      }

      // Reset and close
      setSelectedSurahIds([]);
      setSurahQuery('');
      setError('');
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error('Error saving batch setoran:', err);
      setError('Gagal menyimpan setoran massal. Silakan coba lagi.');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <Layers size={22} className="text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Input Hafalan Massal / Matriks Checklist
              </h2>
              <p className="text-xs text-slate-500">
                Input riwayat setoran beberapa surah sekaligus untuk santri
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 p-3.5 bg-red-50 text-red-700 rounded-2xl text-xs font-medium border border-red-200">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Santri & Batch Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/80 p-4 rounded-3xl border border-slate-200/70">
            {/* Santri Picker */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Pilih Santri
              </label>
              <select
                value={selectedSantriId}
                onChange={(e) => setSelectedSantriId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden transition-all"
              >
                {availableSantriList.length === 0 ? (
                  <option value="">-- Belum ada santri di kelas ini --</option>
                ) : (
                  availableSantriList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.nis})
                    </option>
                  ))
                )}
              </select>
              {completedSurahIds.size > 0 && (
                <p className="text-[11px] text-emerald-700 font-semibold pl-1">
                  ✓ Santri ini sudah menyetor {completedSurahIds.size} surah sebelumnya
                </p>
              )}
            </div>

            {/* Predikat Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Predikat Massal
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPredikat('A')}
                  className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                    predikat === 'A'
                      ? 'bg-emerald-700 text-white border-emerald-700 font-bold shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <span className="text-xs">Mumtaz (A)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPredikat('B')}
                  className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                    predikat === 'B'
                      ? 'bg-amber-500 text-white border-amber-500 font-bold shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <span className="text-xs">Jayyid (B)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPredikat('C')}
                  className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                    predikat === 'C'
                      ? 'bg-red-600 text-white border-red-600 font-bold shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <span className="text-xs">Ulang (C)</span>
                </button>
              </div>
            </div>

            {/* Tanggal Setoran */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Tanggal Setoran
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden transition-all"
                />
              </div>
            </div>

            {/* Catatan Massal */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Catatan Evaluasi
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Misal: Input setoran awal santri"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden transition-all"
              />
            </div>
          </div>

          {/* Section 2: Quick Actions & Search */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-700">Aksi Cepat:</span>
                <button
                  type="button"
                  onClick={handleSelectAllJuzAmma}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
                >
                  Pilih Semua Surah Belum Disetor
                </button>
                <button
                  type="button"
                  onClick={handleSelectShortSurahs}
                  className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
                >
                  Pilih Surah Pendek (93-114)
                </button>
                {selectedSurahIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all"
                  >
                    Kosongkan ({selectedSurahIds.length})
                  </button>
                )}
              </div>

              {/* Search Bar */}
              <div className="relative shrink-0 sm:w-56">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={surahQuery}
                  onChange={(e) => setSurahQuery(e.target.value)}
                  placeholder="Cari surah..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 outline-hidden transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs px-1 text-slate-500">
              <span>
                Pilih surah yang sudah dihafal (Setiap surah diset dari Ayat 1 s/d Akhir):
              </span>
              <span className="font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {selectedSurahIds.length} Surah Dipilih
              </span>
            </div>
          </div>

          {/* Section 3: Surah Checklist Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto p-1 border border-slate-200/80 rounded-2xl bg-slate-50/50">
            {filteredSurahs.length === 0 ? (
              <div className="col-span-full p-8 text-center text-xs text-slate-400 italic">
                Surah tidak ditemukan dengan kata kunci "{surahQuery}".
              </div>
            ) : (
              filteredSurahs.map((surah) => {
                const sId = surah.id || surah.number;
                const name = surah.nameLatin || surah.name_latin || `Surah ${surah.number}`;
                const arabic = surah.nameArabic || surah.name_arabic || '';
                const totalAyat = surah.totalAyat ?? surah.total_ayat ?? 0;
                const isDone = isSurahDone(surah);
                const isSelected = selectedSurahIds.includes(sId);

                return (
                  <div
                    key={sId}
                    onClick={() => toggleSurah(sId)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 select-none ${
                      isSelected
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-md ring-2 ring-emerald-500/30'
                        : isDone
                        ? 'bg-emerald-50/60 text-slate-600 border-emerald-200/70 opacity-90'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="shrink-0">
                        {isSelected ? (
                          <CheckSquare size={18} className="text-white" />
                        ) : (
                          <Square size={18} className={isDone ? "text-emerald-500" : "text-slate-300"} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {surah.number}
                          </span>
                          <span className="text-xs font-bold truncate">
                            {name}
                          </span>
                        </div>
                        <p className={`text-[11px] mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {totalAyat} Ayat
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {isDone && !isSelected ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-200">
                          Sudah Disetor
                        </span>
                      ) : (
                        <span className={`text-xs arabic-font ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                          {arabic}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Section 4: Footer Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="text-xs text-slate-500 font-medium hidden sm:block">
              {selectedSurahIds.length > 0 ? (
                <span className="text-emerald-700 font-bold">
                  Siap menyimpan {selectedSurahIds.length} catatan setoran sekaligus.
                </span>
              ) : (
                <span>Centang surah di atas untuk mulai menginput.</span>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || selectedSurahIds.length === 0}
                className="flex-1 sm:flex-initial px-6 py-2.5 rounded-2xl bg-brand-dark hover:bg-brand-light disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Menyimpan...</span>
                ) : (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>Simpan {selectedSurahIds.length} Setoran Massal</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
