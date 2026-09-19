import React, { useState } from 'react';
import {
  ArrowUpRight,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  BookOpen,
  Pencil,
  Trash2,
  X,
  Trophy
} from 'lucide-react';
import { DEFAULT_JUZ_AMMA_SURAHS } from '../data/initialData';

export default function DashboardOverview({
  santriList = [],
  setoranList = [],
  classList = [],
  surahsList = [],
  currentUser,
  onOpenSetoranModal,
  onSelectSantri,
  onSelectClass,
  onEditSetoran,
  onDeleteSetoran
}) {
  const [selectedCategoryModal, setSelectedCategoryModal] = useState(null);
  const [selectedRankSantriModal, setSelectedRankSantriModal] = useState(null);

  // Compute ranking of top 7 santri based on memorized surah count in Rapor
  const santriRankList = React.useMemo(() => {
    const list = santriList.map(santri => {
      const passedSetoran = setoranList.filter(
        s => String(s.santriId) === String(santri.id) && (s.predikat === 'A' || s.predikat === 'B')
      );
      const uniqueSurahKeys = new Set(passedSetoran.map(s => String(s.surahId || s.surahName || '')));
      return {
        santri,
        surahCount: uniqueSurahKeys.size,
        passedCount: passedSetoran.length
      };
    });

    list.sort((a, b) => b.surahCount - a.surahCount || b.passedCount - a.passedCount);

    return list.slice(0, 7).map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));
  }, [santriList, setoranList]);

  // Order from right to left (Rank 1 at far right, Rank 7 at far left)
  const displayBars = React.useMemo(() => {
    return [...santriRankList].reverse();
  }, [santriRankList]);

  const maxSurahCount = Math.max(...santriRankList.map(s => s.surahCount), 1);

  const isUstadz = currentUser?.role === 'ustadz' || currentUser?.role === 'ustadzah';
  const isAdmin = currentUser?.role === 'admin';
  const canRecord = isAdmin || isUstadz;

  // Filter out bulk / input massal setoran records from Dashboard statistics & feed
  const regularSetoranList = setoranList.filter(s => {
    const isBulk = s.isBulk || s.is_bulk || (s.notes && s.notes.includes('Input setoran awal'));
    return !isBulk;
  });

  const totalSantri = santriList.length;
  const gradeACount = regularSetoranList.filter(s => s.predikat === 'A').length;
  const gradeBCount = regularSetoranList.filter(s => s.predikat === 'B').length;
  const gradeCCount = regularSetoranList.filter(s => s.predikat === 'C').length;
  const totalSetoran = regularSetoranList.length || 1;
  const mutqinPercentage = Math.round((gradeACount / totalSetoran) * 100);

  // Day distribution for weekly chart (Mon - Sun)
  const daysOfWeek = ['S', 'S', 'R', 'K', 'J', 'S', 'M']; // Senin, Selasa, Rabu, Kamis, Jumat, Sabtu, Minggu
  const barHeights = [45, 80, 65, 95, 30, 70, 50]; // Dynamic distribution

  // Palette of colors assigned to classes
  const CLASS_PALETTE = [
    { bg: 'bg-emerald-500', dot: 'bg-emerald-500', text: 'text-emerald-700' },
    { bg: 'bg-indigo-500', dot: 'bg-indigo-500', text: 'text-indigo-700' },
    { bg: 'bg-amber-500', dot: 'bg-amber-500', text: 'text-amber-700' },
    { bg: 'bg-sky-500', dot: 'bg-sky-500', text: 'text-sky-700' },
    { bg: 'bg-rose-500', dot: 'bg-rose-500', text: 'text-rose-700' },
    { bg: 'bg-purple-500', dot: 'bg-purple-500', text: 'text-purple-700' },
  ];

  const effectiveSurahsList = surahsList.length > 0 ? surahsList : DEFAULT_JUZ_AMMA_SURAHS;
  const cleanStr = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  const getSantriPassedSetoran = (santriId) => {
    return setoranList.filter(s => String(s.santriId) === String(santriId) && (s.predikat === 'A' || s.predikat === 'B'));
  };

  const isSurahCompletedBySantri = (santriPassedSetoran, surah) => {
    const surahNum = Number(surah.number);
    const surahIdStr = String(surah.id);
    const surahNameClean = cleanStr(surah.nameLatin || surah.name_latin || '');

    return santriPassedSetoran.some(s => {
      const sSurahIdStr = String(s.surahId);
      const sSurahNum = Number(s.surahId);
      const sSurahNameClean = cleanStr(s.surahName);

      return (
        sSurahIdStr === surahIdStr ||
        sSurahNum === surahNum ||
        (surahNameClean && sSurahNameClean && (
          sSurahNameClean === surahNameClean ||
          sSurahNameClean.includes(surahNameClean) ||
          surahNameClean.includes(sSurahNameClean)
        ))
      );
    });
  };

  // Range 1: An-Nas (114) down to Adh-Dhuha (93) - 22 Surahs
  const adhDhuhaSurahs = effectiveSurahsList.filter(s => Number(s.number) >= 93 && Number(s.number) <= 114);
  const checkAdhDhuha = (santriId) => {
    const passedSetoran = getSantriPassedSetoran(santriId);
    if (adhDhuhaSurahs.length === 0) return false;
    return adhDhuhaSurahs.every(surah => isSurahCompletedBySantri(passedSetoran, surah));
  };

  // Range 2: An-Nas (114) down to An-Naba' (78) - 37 Surahs (Juz 30 Complete)
  const anNabaSurahs = effectiveSurahsList.filter(s => Number(s.number) >= 78 && Number(s.number) <= 114);
  const checkAnNaba = (santriId) => {
    const passedSetoran = getSantriPassedSetoran(santriId);
    if (anNabaSurahs.length === 0) return false;
    return anNabaSurahs.every(surah => isSurahCompletedBySantri(passedSetoran, surah));
  };

  // Categorize santri
  const santriAdhDhuha = santriList.filter(s => checkAdhDhuha(s.id));
  const santriAnNaba = santriList.filter(s => checkAnNaba(s.id));
  const santriMurajaah = santriList.filter(s => !checkAdhDhuha(s.id));

  // Helper component to render Stacked Progress Bar per Class
  const ClassProgressBar = ({ targetSantriGroup }) => {
    const totalCount = targetSantriGroup.length;
    if (totalCount === 0) {
      return (
        <div className="mt-2 space-y-1">
          <div className="w-full h-2 rounded-full bg-slate-200" />
          <p className="text-[10px] text-slate-400 font-medium">0% (Belum ada santri)</p>
        </div>
      );
    }

    const countsByClass = {};
    classList.forEach(cls => { countsByClass[cls.id] = 0; });
    targetSantriGroup.forEach(s => {
      if (countsByClass[s.classId] !== undefined) {
        countsByClass[s.classId] += 1;
      }
    });

    const segments = classList.map((cls, idx) => {
      const cnt = countsByClass[cls.id] || 0;
      const pct = Math.round((cnt / totalCount) * 100);
      const color = CLASS_PALETTE[idx % CLASS_PALETTE.length];
      return { cls, cnt, pct, color };
    }).filter(seg => seg.cnt > 0);

    return (
      <div className="mt-2 space-y-1.5">
        <div className="w-full h-2 rounded-full bg-slate-100 flex overflow-hidden shadow-inner">
          {segments.map(({ cls, cnt, pct, color }) => (
            <div
              key={cls.id}
              style={{ width: `${pct}%` }}
              className={`h-full ${color.bg} transition-all duration-500`}
              title={`${cls.name}: ${pct}% (${cnt} santri)`}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10px] font-semibold text-slate-600">
          {segments.map(({ cls, cnt, pct, color }) => (
            <span key={cls.id} className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
              <span>{cls.name}: {cnt} ({pct}%)</span>
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header section with Page title */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
          Dashboard
        </h1>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Santri (Dark Green Hero Card) */}
        <div className="bg-brand-dark text-white p-5 rounded-3xl shadow-lg shadow-brand-dark/15 relative overflow-hidden flex flex-col justify-between min-h-[145px]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-emerald-300">
              Total Santri Aktif
            </span>
            <div
              onClick={() => setSelectedCategoryModal({ title: 'Total Santri Aktif', list: santriList })}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer"
              title="Lihat Santri Total Santri Aktif"
            >
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div>
            <div className="text-3xl lg:text-4xl font-extrabold tracking-tight">
              {totalSantri}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-300/90 mt-1.5 font-medium">
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                {classList.length} Kelas
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: An-Naas - Adh-Dhuha */}
        <div className="bg-white text-slate-800 p-5 rounded-3xl border border-slate-200/70 shadow-card flex flex-col justify-between min-h-[145px]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-700">
              An-Naas - Adh-Dhuha
            </span>
            <div
              onClick={() => setSelectedCategoryModal({ title: 'An-Naas - Adh-Dhuha', list: santriAdhDhuha })}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200/70 active:scale-95 flex items-center justify-center text-slate-600 transition-all cursor-pointer"
              title="Lihat Santri An-Naas - Adh-Dhuha"
            >
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div>
            <div className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              {santriAdhDhuha.length}
            </div>
            <ClassProgressBar targetSantriGroup={santriAdhDhuha} />
          </div>
        </div>

        {/* Card 3: An-Naas - An-Naba' */}
        <div className="bg-white text-slate-800 p-5 rounded-3xl border border-slate-200/70 shadow-card flex flex-col justify-between min-h-[145px]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-700">
              An-Naas - An-Naba'
            </span>
            <div
              onClick={() => setSelectedCategoryModal({ title: "An-Naas - An-Naba'", list: santriAnNaba })}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200/70 active:scale-95 flex items-center justify-center text-slate-600 transition-all cursor-pointer"
              title="Lihat Santri An-Naas - An-Naba'"
            >
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div>
            <div className="text-3xl lg:text-4xl font-extrabold text-emerald-700 tracking-tight">
              {santriAnNaba.length}
            </div>
            <ClassProgressBar targetSantriGroup={santriAnNaba} />
          </div>
        </div>

        {/* Card 4: Perlu Muraja'ah */}
        <div className="bg-white text-slate-800 p-5 rounded-3xl border border-slate-200/70 shadow-card flex flex-col justify-between min-h-[145px]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-700">
              Perlu Muraja'ah
            </span>
            <div
              onClick={() => setSelectedCategoryModal({ title: "Perlu Muraja'ah", list: santriMurajaah })}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200/70 active:scale-95 flex items-center justify-center text-slate-600 transition-all cursor-pointer"
              title="Lihat Santri Perlu Muraja'ah"
            >
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div>
            <div className="text-3xl lg:text-4xl font-extrabold text-amber-600 tracking-tight">
              {santriMurajaah.length}
            </div>
            <ClassProgressBar targetSantriGroup={santriMurajaah} />
          </div>
        </div>
      </div>

      {/* Middle Row: Analytics & Reminders & Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Santri Ranking Bar Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/70 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Peringkat Hafalan Santri
              </h2>
              <p className="text-xs text-slate-400">Top 7 santri surah terbanyak (Kanan #1 s/d Kiri #7)</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
              <Trophy size={13} className="text-emerald-600" />
              <span>Top 7</span>
            </span>
          </div>

          {/* Styled pill bars for Top 7 Santri */}
          <div className="flex items-end justify-between gap-2.5 pt-6 pb-2 px-1">
            {displayBars.map((item) => {
              const heightPct = Math.max(Math.round((item.surahCount / maxSurahCount) * 100), 18);
              const isRank1 = item.rank === 1;
              const isTop3 = item.rank <= 3;
              const santriName = item.santri.name || item.santri.fullName || 'Santri';
              const shortName = santriName.split(' ')[0];
              const avatarSrc = item.santri.avatar || item.santri.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(santriName)}`;

              return (
                <div
                  key={item.santri.id}
                  onClick={() => setSelectedRankSantriModal({ santri: item.santri, rank: item.rank, surahCount: item.surahCount })}
                  className="flex flex-col items-center gap-2 flex-1 cursor-pointer group"
                  title={`Klik untuk melihat detail ${santriName}`}
                >
                  <div className="w-full bg-slate-100 h-36 rounded-full flex flex-col justify-end p-1 relative">
                    {/* Hover Floating Card showing Name & Photo */}
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs p-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap font-semibold shadow-lg z-20 flex items-center gap-2 border border-slate-700">
                      <img
                        src={avatarSrc}
                        alt={santriName}
                        className="w-6 h-6 rounded-full object-cover border border-white/40 bg-slate-200"
                      />
                      <div className="text-left">
                        <p className="text-[11px] font-bold leading-tight">{santriName}</p>
                        <p className="text-[9px] text-emerald-300 font-medium">Rank #{item.rank} • {item.surahCount} Surah</p>
                      </div>
                    </div>

                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-full transition-all duration-500 relative flex flex-col items-center justify-start pt-1.5 ${
                        isRank1
                          ? 'bg-brand-dark shadow-md ring-2 ring-emerald-400/40'
                          : isTop3
                          ? 'bg-emerald-500 shadow-xs'
                          : 'bg-emerald-300'
                      }`}
                    >
                      {/* Surah count badge inside bar top */}
                      <span className="text-[10px] font-extrabold text-white leading-none">
                        {item.surahCount}
                      </span>
                    </div>
                  </div>

                  {/* Underneath: Rank & Short Name */}
                  <div className="text-center">
                    <span className={`text-[10px] font-bold block ${isRank1 ? 'text-brand-dark' : 'text-slate-700'}`}>
                      #{item.rank}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 block truncate max-w-[45px]" title={santriName}>
                      {shortName}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Reminders / Agenda Madrasah (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/70 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Agenda Tahfidz
              </span>
              <Calendar size={16} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              Ujian Tasmi' Akbar Juz Amma (Juz 30)
            </h3>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5 font-medium">
              <Clock size={13} className="text-emerald-600" />
              Kamis, 08.00 - 11.30 WIB
            </p>
            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Santri yang telah menuntaskan setoran surah Al-A'la s/d An-Nas dijadwalkan mengikuti evaluasi kelancaran sekali duduk.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button className="w-full bg-brand-dark hover:bg-brand-light text-white font-semibold text-xs py-2.5 rounded-2xl flex items-center justify-center gap-2 transition-colors">
              <Award size={15} className="text-emerald-400" />
              <span>Daftar Santri Tasmi'</span>
            </button>
          </div>
        </div>

        {/* Right: Kelas & Halaqah Quick List (3 cols) */}
        <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-200/70 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-800">Kelas Halaqah</h2>
              <span className="text-[11px] text-slate-400 font-semibold">
                {classList.length} Kelas
              </span>
            </div>

            <div className="space-y-3">
              {classList.slice(0, 3).map((cls) => {
                const countSantriInClass = santriList.filter(s => s.classId === cls.id).length;
                return (
                  <div
                    key={cls.id}
                    onClick={() => onSelectClass(cls)}
                    className="p-3 rounded-2xl border border-slate-100 hover:border-emerald-200 bg-slate-50/50 hover:bg-emerald-50/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">
                        {cls.name}
                      </p>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {cls.ustadzName}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] font-semibold text-slate-400">
                      <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-600">
                        {countSantriInClass} Santri
                      </span>
                      <span>PIN: ••••</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Setoran Feed & Progress Arc Gauge & Time Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Feed Setoran Terbaru (Team Collaboration in Donezo) (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/70 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Aktivitas Setoran Terbaru
              </h2>
              <p className="text-xs text-slate-400">Pencatatan hafalan real-time</p>
            </div>
            {canRecord && (
              <button
                onClick={onOpenSetoranModal}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100"
              >
                + Input
              </button>
            )}
          </div>

          <div className="space-y-3.5">
            {regularSetoranList.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 italic bg-slate-50 rounded-2xl border border-slate-100">
                Belum ada aktivitas setoran harian.
              </div>
            ) : (
              regularSetoranList.slice(0, 4).map((item) => {
              const predikatColor =
                item.predikat === 'A'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : item.predikat === 'B'
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-red-100 text-red-800 border-red-200';

              const predikatLabel =
                item.predikat === 'A'
                  ? 'Mumtaz (A)'
                  : item.predikat === 'B'
                  ? 'Jayyid (B)'
                  : 'Ulang (C)';

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    const matchedSantri = santriList.find(s => s.id === item.santriId);
                    if (matchedSantri) onSelectSantri(matchedSantri);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100/70 flex items-center justify-center text-emerald-800 font-bold text-xs border border-emerald-200">
                      {item.santriName ? item.santriName.charAt(0) : 'S'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">
                        {item.santriName}
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <span className="font-semibold text-slate-700">
                          {item.surahName}
                        </span>
                        <span>: Ayat {item.ayatStart} - {item.ayatEnd}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-right">
                    <div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${predikatColor}`}
                      >
                        {predikatLabel}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {item.date}
                      </p>
                    </div>

                    {canRecord && (
                      <div className="flex items-center gap-1 border-l border-slate-200 pl-2 ml-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onEditSetoran(item)}
                          className="p-1 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                          title="Edit Setoran"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => onDeleteSetoran(item.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                          title="Hapus Setoran"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
            )}
          </div>
        </div>

        {/* Center: Kelancaran Progress Arc (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/70 shadow-card flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 mb-1">
              Tingkat Kelancaran Santri
            </h2>
            <p className="text-xs text-slate-400">Rasio predikat setoran madrasah</p>
          </div>

          <div className="py-4 flex flex-col items-center justify-center">
            {/* SVG Arc Gauge */}
            <div className="relative w-44 h-28 flex items-end justify-center overflow-hidden">
              <svg viewBox="0 0 100 55" className="w-full h-full">
                <path
                  d="M 10 50 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <path
                  d="M 10 50 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke="#166534"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray="125.6"
                  strokeDashoffset={125.6 - (125.6 * (mutqinPercentage / 100))}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute bottom-1 text-center">
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {mutqinPercentage}%
                </div>
                <div className="text-[11px] font-semibold text-emerald-700">
                  Mutqin (A)
                </div>
              </div>
            </div>

            {/* Legend indicators */}
            <div className="flex items-center justify-center gap-4 mt-4 text-[11px]">
              <div className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-800" />
                <span>A: {gradeACount}</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>B: {gradeBCount}</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span>C: {gradeCCount}</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-center text-slate-400 font-medium">
            Berdasarkan seluruh riwayat evaluasi setoran
          </div>
        </div>

        {/* Right: Tahfidz Companion & Schedule Widget (3 cols) */}
        <div className="lg:col-span-3 bg-brand-dark text-white p-6 rounded-3xl shadow-md flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background circles */}
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-emerald-700/30 rounded-full blur-xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between text-emerald-300">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Halaqah Qur'an
              </span>
              <BookOpen size={16} />
            </div>
            <h3 className="text-base font-bold text-white mt-2">
              Darul Istiqomah
            </h3>
            <p className="text-xs text-emerald-200/80 mt-1">
              Pondok & Madrasah Tahfidzul Qur'an
            </p>
          </div>

          <div className="my-5 bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10 text-center">
            <p className="text-[11px] text-emerald-300 font-medium uppercase tracking-wider">
              Target Tahfidz
            </p>
            <p className="text-2xl font-extrabold text-white mt-0.5 tracking-tight">
              Juz Amma (30)
            </p>
            <p className="text-[11px] text-emerald-200 mt-1 font-medium">
              37 Surah • 564 Ayat
            </p>
          </div>

          <div className="flex items-center text-xs text-emerald-300/80 pt-2 border-t border-white/10">
            <span className="flex items-center gap-1 font-medium">
              <CheckCircle2 size={13} className="text-emerald-400" />
              Sistem Aktif
            </span>
          </div>
        </div>
      </div>

      {/* Category Santri List Modal (Only photo & name displayed) */}
      {selectedCategoryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scaleUp">
            {/* Modal Header */}
            <div className="p-5 bg-brand-dark text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg">
                  {selectedCategoryModal.title}
                </h3>
                <p className="text-xs text-emerald-300 font-medium mt-0.5">
                  Total {selectedCategoryModal.list.length} Santri
                </p>
              </div>
              <button
                onClick={() => setSelectedCategoryModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: List of santri (STRICTLY avatar + name only) */}
            <div className="p-5 overflow-y-auto space-y-3">
              {selectedCategoryModal.list.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <p className="text-sm font-medium">Belum ada santri dalam kategori ini</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedCategoryModal.list.map((santri) => {
                    const displayName = santri.name || santri.fullName || 'Santri';
                    const avatarSrc = santri.avatar || santri.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName)}`;

                    return (
                      <div
                        key={santri.id}
                        onClick={() => {
                          if (onSelectSantri) {
                            onSelectSantri(santri);
                            setSelectedCategoryModal(null);
                          }
                        }}
                        className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all cursor-pointer group shadow-2xs"
                      >
                        <img
                          src={avatarSrc}
                          alt={displayName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs group-hover:scale-105 transition-transform bg-slate-200"
                        />
                        <span className="font-bold text-slate-800 text-sm group-hover:text-brand-dark transition-colors line-clamp-2">
                          {displayName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedCategoryModal(null)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Rank Santri Detail Modal (Name & Profile Photo when clicked) */}
      {selectedRankSantriModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scaleUp">
            {/* Header */}
            <div className="p-4 bg-brand-dark text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-emerald-400" />
                <h3 className="font-extrabold text-sm sm:text-base">
                  Peringkat #{selectedRankSantriModal.rank} Hafalan
                </h3>
              </div>
              <button
                onClick={() => setSelectedRankSantriModal(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content: Photo & Name strictly */}
            <div className="p-6 text-center flex flex-col items-center gap-4">
              <div className="relative">
                <img
                  src={
                    selectedRankSantriModal.santri.avatar ||
                    selectedRankSantriModal.santri.avatar_url ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(selectedRankSantriModal.santri.name || 'Santri')}`
                  }
                  alt={selectedRankSantriModal.santri.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-emerald-100 shadow-md bg-slate-100"
                />
                <span className="absolute -bottom-1 -right-1 bg-brand-dark text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full border-2 border-white shadow-xs">
                  #{selectedRankSantriModal.rank}
                </span>
              </div>

              <div>
                <h4 className="text-lg font-extrabold text-slate-900">
                  {selectedRankSantriModal.santri.name || selectedRankSantriModal.santri.fullName}
                </h4>
                <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 mt-2 inline-block">
                  {selectedRankSantriModal.surahCount} Surah Dihafal
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedRankSantriModal(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
              >
                Tutup
              </button>
              {onSelectSantri && (
                <button
                  onClick={() => {
                    onSelectSantri(selectedRankSantriModal.santri);
                    setSelectedRankSantriModal(null);
                  }}
                  className="px-4 py-2 bg-brand-dark hover:bg-brand-light text-white font-semibold text-xs rounded-xl transition-colors"
                >
                  Buka Rapor Santri
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
