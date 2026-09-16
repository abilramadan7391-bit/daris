import React, { useState, useRef, useEffect } from 'react';
import { Lock, X, AlertCircle, KeyRound } from 'lucide-react';

export default function PinModal({
  targetClass,
  onClose,
  onSuccess
}) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    // Focus first input on mount
    inputRefs[0].current?.focus();
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setError('');

    // Auto advance focus to next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto verify when 4 digits are completed
    if (newPin.every(digit => digit !== '') && index === 3) {
      verifyCode(newPin.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const verifyCode = (code) => {
    if (code === targetClass.pinCode) {
      onSuccess(targetClass);
    } else {
      setError('Kode PIN salah. Silakan periksa kembali dengan Admin Utama.');
      setPin(['', '', '', '']);
      inputRefs[0].current?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    verifyCode(pin.join(''));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center">
              <KeyRound size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Verifikasi PIN Kelas
              </h2>
              <p className="text-xs text-slate-400">Autentikasi Wali Kelas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="text-center">
            <span className="inline-block bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full mb-1">
              {targetClass.name}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              Pengampu: <span className="font-semibold text-slate-700">{targetClass.ustadzName}</span>
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Masukkan <span className="font-bold text-slate-700">4 digit kode khusus</span> yang diberikan oleh Admin Utama untuk mengakses kelas ini.
            </p>
          </div>

          {/* 4 Digit Boxes */}
          <div className="flex justify-center gap-3">
            {pin.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="password"
                maxLength={1}
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-13 h-14 text-center text-2xl font-bold rounded-2xl border-2 border-slate-200 focus:border-brand-dark focus:ring-4 focus:ring-emerald-500/20 outline-hidden transition-all text-slate-800 bg-slate-50 focus:bg-white"
              />
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2.5 bg-red-50 text-red-700 rounded-xl text-xs font-medium border border-red-200">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100 text-center">
            <p className="text-[11px] text-emerald-800 font-medium">
              💡 Petunjuk Demo: PIN kelas ini adalah <span className="font-bold underline">{targetClass.pinCode}</span>
            </p>
          </div>

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={pin.some(d => d === '')}
              className="flex-1 py-2.5 rounded-xl bg-brand-dark hover:bg-brand-light text-white text-xs font-bold disabled:opacity-50 transition-all shadow-xs"
            >
              Verifikasi Masuk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
