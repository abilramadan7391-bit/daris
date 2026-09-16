import React, { useState } from 'react';
import {
  Search,
  Menu,
  LogIn,
  LogOut,
  ShieldCheck,
  UserCheck,
  Users,
  ChevronDown,
  Bell
} from 'lucide-react';

export default function TopNavbar({
  currentUser,
  onOpenLogin,
  onLogout,
  onToggleMobileSidebar,
  searchQuery,
  setSearchQuery,
  onSelectSantriFromSearch,
  santriList = [],
  classList = []
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const isAdmin = currentUser?.role === 'admin';
  const isUstadz = currentUser?.role === 'ustadz' || currentUser?.role === 'ustadzah';
  const assignedClass = isUstadz ? classList.find(c => c.ustadzId === currentUser?.id) : null;

  // Filter searchable santri for Ustadz (scoped to their assigned class)
  const searchableSantri = (isUstadz && assignedClass)
    ? santriList.filter(s => s.classId === assignedClass.id)
    : santriList;

  // Filter santri for quick search dropdown
  const searchResults = searchQuery.trim().length > 0
    ? searchableSantri.filter(s => {
        const name = s.fullName || s.full_name || '';
        const nis = s.nis || '';
        return (
          name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          nis.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }).slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-30 bg-[#f0f4f2]/90 backdrop-blur-md px-4 lg:px-8 py-3.5 flex items-center justify-between border-b border-slate-200/50">
      {/* Left: Mobile hamburger & Search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl bg-white border border-slate-200/70 text-slate-700 shadow-xs hover:bg-slate-50"
          aria-label="Buka Menu"
        >
          <Menu size={20} />
        </button>

        <div className="relative w-full">
          <div className="relative flex items-center">
            <Search
              size={18}
              className="absolute left-3.5 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Cari nama santri, NIS, atau surah..."
              className="w-full pl-10 pr-12 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 shadow-xs transition-all"
            />
            <kbd className="hidden sm:inline-block absolute right-3 px-2 py-0.5 text-[11px] font-semibold text-slate-400 bg-slate-100 rounded-md border border-slate-200">
              ⌘K
            </kbd>
          </div>

          {/* Quick Autocomplete Search Overlay */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Hasil Pencarian Santri</span>
                {isUstadz && assignedClass && (
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-md border border-emerald-200">
                    Halaqah: {assignedClass.name}
                  </span>
                )}
              </div>
              {searchResults.map((santri) => (
                <button
                  key={santri.id}
                  onClick={() => {
                    onSelectSantriFromSearch(santri);
                    setShowSearchResults(false);
                    setSearchQuery('');
                  }}
                  className="w-full px-3.5 py-2 flex items-center justify-between hover:bg-emerald-50/70 text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={santri.avatar}
                      alt={santri.fullName}
                      className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {santri.fullName}
                      </p>
                      <p className="text-[11px] text-slate-400">NIS: {santri.nis}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                    Lihat Rapor ↗
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Notification Icon */}
      <div className="flex items-center gap-3">
        {/* Subtle notification icon */}
        <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-2xl bg-white border border-slate-200/80 text-slate-500 shadow-xs hover:text-slate-800">
          <Bell size={18} />
        </div>
      </div>
    </header>
  );
}
