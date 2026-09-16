import React from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  PenTool,
  LogOut,
  ShieldCheck,
  UserCheck,
  X
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenSetoranModal,
  mobileOpen,
  setMobileOpen,
  counts
}) {
  const isUstadz = currentUser?.role === 'ustadz';
  const isAdmin = currentUser?.role === 'admin';
  const canRecord = isAdmin || isUstadz;

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'classes',
      label: 'Kelas & Halaqah',
      icon: BookOpen,
      badge: counts.classes
    },
    {
      id: 'santri',
      label: 'Data Santri',
      icon: GraduationCap,
      badge: counts.santri
    },
    {
      id: 'surahs',
      label: 'Daftar Surah',
      icon: BookOpen,
      badge: `${counts.surahs} Surah`
    }
  ];

  const adminMenuItems = [
    {
      id: 'ustadz',
      label: 'Kelola User',
      icon: UserCheck,
      badge: 'Admin'
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-dark flex items-center justify-center text-white shadow-md shadow-brand-dark/20">
              <span className="text-xl font-bold">DI</span>
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-tight tracking-tight text-lg">
                Darul Istiqomah
              </h1>
              <p className="text-xs text-emerald-700 font-semibold tracking-wide">
                Monitoring Tahfidz
              </p>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Action for Ustadz/Admin */}
        {canRecord && (
          <div className="px-5 py-2">
            <button
              onClick={() => {
                onOpenSetoranModal();
                setMobileOpen(false);
              }}
              className="w-full bg-brand-dark hover:bg-brand-light text-white font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all duration-200 active:scale-[0.98]"
            >
              <PenTool size={17} className="text-emerald-400" />
              <span>+ Catat Setoran</span>
            </button>
          </div>
        )}

        {/* Navigation Menus */}
        <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
          {/* MENU UTAMA */}
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Menu Utama
            </div>

            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-mint text-brand-dark font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={19}
                      className={isActive ? 'text-brand-dark' : 'text-slate-400'}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                        isActive
                          ? 'bg-brand-dark text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* MENU ADMIN - Hanya tampil jika logged in sebagai admin */}
          {isAdmin && (
            <div className="space-y-1 pt-3 border-t border-slate-100">
              <div className="px-3 pb-2 text-[11px] font-semibold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-amber-500" />
                <span>Menu Admin</span>
              </div>

              {adminMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-amber-50 text-amber-900 font-semibold shadow-xs border border-amber-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={19}
                        className={isActive ? 'text-amber-700' : 'text-slate-400'}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                          isActive
                            ? 'bg-amber-700 text-white'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* User Card & Role Status at Bottom */}
        <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
          <div className="bg-white p-3 rounded-2xl border border-slate-200/70 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                  isAdmin
                    ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-400/30'
                    : isUstadz
                    ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-500/30'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {isAdmin ? (
                  <ShieldCheck size={18} />
                ) : isUstadz ? (
                  <UserCheck size={18} />
                ) : (
                  <Users size={16} />
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {currentUser ? currentUser.fullName : 'Tamu / Pengunjung'}
                </p>
                <span
                  className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md mt-0.5 ${
                    isAdmin
                      ? 'bg-amber-100 text-amber-800'
                      : isUstadz
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isAdmin
                    ? 'Admin Utama'
                    : isUstadz
                    ? 'Ustadz/Ustadzah'
                    : 'Mode Publik'}
                </span>
              </div>
            </div>

            {currentUser ? (
              <button
                onClick={onLogout}
                title="Keluar / Logout"
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={16} />
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
