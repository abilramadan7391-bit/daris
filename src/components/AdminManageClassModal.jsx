import React, { useState, useEffect } from 'react';
import { X, BookOpen, KeyRound, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { dataService } from '../lib/supabaseClient';

export default function AdminManageClassModal({
  isOpen,
  onClose,
  onSave
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ustadzId, setUstadzId] = useState('');
  const [ustadzList, setUstadzList] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [room, setRoom] = useState('');
  const [schedule, setSchedule] = useState('Senin - Kamis, 07.30 - 09.30');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      let isMounted = true;
      setLoadingProfiles(true);
      setError('');
      dataService.getProfiles().then((data) => {
        if (isMounted) {
          const list = data || [];
          setUstadzList(list);
          if (list.length > 0) {
            setUstadzId(list[0].id);
          }
          setLoadingProfiles(false);
        }
      }).catch((err) => {
        console.error('Error loading ustadz profiles:', err);
        if (isMounted) setLoadingProfiles(false);
      });
    }
  }, [isOpen]);

  const generateRandomPin = () => {
    const random = Math.floor(1000 + Math.random() * 9000).toString();
    setPinCode(random);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama kelas tidak boleh kosong.');
      return;
    }
    if (!pinCode || pinCode.length !== 4 || !/^\d{4}$/.test(pinCode)) {
      setError('Kode PIN harus terdiri dari 4 digit angka.');
      return;
    }

    const selectedUstadz = ustadzList.find(u => u.id === ustadzId);

    const newClass = {
      name: name.trim(),
      description: description.trim() || 'Halaqah Tahfidzul Quran',
      ustadzId: ustadzId || '',
      ustadzName: selectedUstadz?.fullName || 'Belum Ditentukan',
      pinCode,
      room: room.trim() || 'Ruang Halaqah',
      schedule
    };

    onSave(newClass);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Buat Kelas / Halaqah Baru
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

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nama Kelas / Halaqah
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Tahfidz 2A (Laki-laki)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Wali Kelas (Ustadz / Ustadzah)
            </label>
            <select
              value={ustadzId}
              onChange={(e) => setUstadzId(e.target.value)}
              disabled={loadingProfiles}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden transition-all disabled:opacity-60"
            >
              {loadingProfiles ? (
                <option value="">Memuat daftar pengajar...</option>
              ) : ustadzList.length === 0 ? (
                <option value="">-- Belum Ada Pengajar Terdaftar --</option>
              ) : (
                <>
                  <option value="">-- Pilih Wali Kelas Pengampu --</option>
                  {ustadzList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.role === 'admin' ? 'Admin' : u.role === 'ustadzah' ? 'Ustadzah' : 'Ustadz'})
                    </option>
                  ))}
                </>
              )}
            </select>
            {!loadingProfiles && ustadzList.length === 0 && (
              <p className="text-[11px] text-amber-600 font-medium mt-1">
                Belum ada data pengajar di database. Daftarkan user terlebih dahulu di menu Admin 'Kelola User' atau lewat manage.py.
              </p>
            )}
          </div>

          {/* 4 Digit PIN with Generator */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <KeyRound size={13} className="text-emerald-700" />
                <span>Kode Khusus (PIN 4-Angka)</span>
              </label>
              <button
                type="button"
                onClick={generateRandomPin}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                Acak PIN Otomatis
              </button>
            </div>
            <input
              type="text"
              maxLength={4}
              required
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
              placeholder="Misal: 7890"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-base font-mono font-bold tracking-widest text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden transition-all text-center"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Kode ini wajib dimasukkan oleh Ustadz wali kelas untuk membuka akses kelas ini.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Ruang Belajar
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Contoh: Ruang Utsman"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Jadwal
              </label>
              <input
                type="text"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="Senin - Kamis"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden transition-all"
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
              <span>Simpan Kelas</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
