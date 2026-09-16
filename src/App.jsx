import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import DashboardOverview from './components/DashboardOverview';
import ClassListView from './components/ClassListView';
import ClassDetailView from './components/ClassDetailView';
import StudentListView from './components/StudentListView';
import SurahsCatalogView from './components/SurahsCatalogView';
import SetoranModal from './components/SetoranModal';
import PinModal from './components/PinModal';
import SantriDetailModal from './components/SantriDetailModal';
import AdminManageClassModal from './components/AdminManageClassModal';
import AdminManageSurahModal from './components/AdminManageSurahModal';
import AddSantriModal from './components/AddSantriModal';
import LoginModal from './components/LoginModal';
import AdminManageUstadzView from './components/AdminManageUstadzView';
import { dataService, initializeStore } from './lib/supabaseClient';

export default function App() {
  // Initialize storage
  useEffect(() => {
    initializeStore();
  }, []);

  // Application Data States
  const [surahsList, setSurahsList] = useState([]);
  const [classList, setClassList] = useState([]);
  const [santriList, setSantriList] = useState([]);
  const [setoranList, setSetoranList] = useState([]);
  const [currentUser, setCurrentUser] = useState(dataService.getActiveUser());

  // UI Navigation States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSantri, setSelectedSantri] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSetoranModalOpen, setIsSetoranModalOpen] = useState(false);
  const [setoranPreselectedSantri, setSetoranPreselectedSantri] = useState(null);
  const [pinTargetClass, setPinTargetClass] = useState(null);
  const [isAdminClassModalOpen, setIsAdminClassModalOpen] = useState(false);
  const [isAdminSurahModalOpen, setIsAdminSurahModalOpen] = useState(false);
  const [isAddSantriModalOpen, setIsAddSantriModalOpen] = useState(false);
  const [addSantriClassId, setAddSantriClassId] = useState('');
  const [editingSantri, setEditingSantri] = useState(null);

  // Load Data
  const reloadData = async () => {
    const [surahs, classes, santri, setoran] = await Promise.all([
      dataService.getSurahs(),
      dataService.getClasses(),
      dataService.getSantri(),
      dataService.getSetoran()
    ]);
    setSurahsList(surahs);
    setClassList(classes);
    setSantriList(santri);
    setSetoranList(setoran);
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Role helpers
  const isAdmin = currentUser?.role === 'admin';
  const isUstadz = currentUser?.role === 'ustadz' || currentUser?.role === 'ustadzah';
  const isLoggedIn = isAdmin || isUstadz;

  // Handling Class Enter / PIN verification
  const handleEnterClass = (cls) => {
    if (!isLoggedIn) {
      alert(`Akses Terbatas:\n\nPengunjung publik tidak memiliki wewenang mengakses detail kelas dan santri.\nSilakan login sebagai Ustadz/Ustadzah atau Admin dan masukkan 4-digit PIN kelas.`);
      return;
    }

    // Baik Admin maupun Ustadz/Ustadzah membutuhkan PIN jika kelas belum di-unlock
    if (dataService.isClassUnlocked(cls.id)) {
      setSelectedClass(cls);
    } else {
      setPinTargetClass(cls);
    }
  };

  const handleSelectSantri = (santri) => {
    if (!isLoggedIn) {
      alert(`Akses Terbatas:\n\nDetail rapor santri hanya dapat diakses oleh Ustadz/Ustadzah dan Admin terdaftar.\nSilakan login terlebih dahulu.`);
      return;
    }
    setSelectedSantri(santri);
  };

  const handlePinSuccess = (cls) => {
    dataService.unlockClass(cls.id);
    setPinTargetClass(null);
    setSelectedClass(cls);
  };

  // Setoran Modal Launchers
  const handleOpenSetoran = (santri = null) => {
    setSetoranPreselectedSantri(santri);
    setIsSetoranModalOpen(true);
  };

  const handleSaveSetoran = async (record) => {
    await dataService.addSetoran(record);
    await reloadData();
  };

  // Add / Edit Santri Launchers
  const handleOpenAddSantri = (classId = '') => {
    setEditingSantri(null);
    setAddSantriClassId(classId);
    setIsAddSantriModalOpen(true);
  };

  const handleEditSantri = (santri) => {
    setEditingSantri(santri);
    setAddSantriClassId(santri.classId);
    setIsAddSantriModalOpen(true);
  };

  const handleSaveSantri = async (santriData, existingId = null) => {
    if (existingId) {
      await dataService.updateSantri(existingId, santriData);
    } else {
      await dataService.addSantri(santriData);
    }
    await reloadData();
  };

  // Admin Class creation
  const handleSaveClass = async (newClass) => {
    await dataService.addClass(newClass);
    await reloadData();
  };

  // Admin Surah addition
  const handleSaveSurah = async (newSurah) => {
    await dataService.addSurah(newSurah);
    await reloadData();
  };

  // User Auth Handlers
  const handleLogin = (user) => {
    dataService.setActiveUser(user);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    dataService.clearActiveUser();
    setCurrentUser(null);
    setSelectedClass(null);
  };

  const handleSetGuest = () => {
    dataService.clearActiveUser();
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-[#f0f4f2] flex flex-col antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedClass(null);
        }}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenSetoranModal={() => handleOpenSetoran(null)}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        counts={{
          classes: classList.length,
          santri: santriList.length,
          surahs: surahsList.length
        }}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1 min-w-0">
        {/* Top Navbar */}
        <TopNavbar
          currentUser={currentUser}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onLogout={handleLogout}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSelectSantriFromSearch={(santri) => handleSelectSantri(santri)}
          santriList={santriList}
          classList={classList}
        />

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <DashboardOverview
              santriList={santriList}
              setoranList={setoranList}
              classList={classList}
              currentUser={currentUser}
              onOpenSetoranModal={() => handleOpenSetoran(null)}
              onSelectSantri={(santri) => handleSelectSantri(santri)}
              onSelectClass={(cls) => {
                setActiveTab('classes');
                handleEnterClass(cls);
              }}
            />
          )}

          {/* TAB 2: KELAS & HALAQAH */}
          {activeTab === 'classes' && (
            selectedClass ? (
              <ClassDetailView
                targetClass={selectedClass}
                onBack={() => setSelectedClass(null)}
                santriList={santriList}
                setoranList={setoranList}
                currentUser={currentUser}
                onOpenSetoranForSantri={(s) => handleOpenSetoran(s)}
                onOpenAddSantri={handleOpenAddSantri}
                onSelectSantri={(s) => handleSelectSantri(s)}
                onEditSantri={handleEditSantri}
              />
            ) : (
              <ClassListView
                classList={classList}
                santriList={santriList}
                currentUser={currentUser}
                onEnterClass={handleEnterClass}
                onOpenCreateClassModal={() => setIsAdminClassModalOpen(true)}
                isClassUnlocked={(id) => dataService.isClassUnlocked(id)}
              />
            )
          )}

          {/* TAB 3: DATA SANTRI */}
          {activeTab === 'santri' && (
            <StudentListView
              santriList={santriList}
              classList={classList}
              setoranList={setoranList}
              currentUser={currentUser}
              onSelectSantri={(santri) => handleSelectSantri(santri)}
              onOpenSetoranForSantri={(santri) => handleOpenSetoran(santri)}
              onOpenAddSantri={() => handleOpenAddSantri()}
            />
          )}

          {/* TAB 4: DAFTAR SURAH */}
          {activeTab === 'surahs' && (
            <SurahsCatalogView
              surahsList={surahsList}
              currentUser={currentUser}
              onOpenAddSurahModal={() => setIsAdminSurahModalOpen(true)}
            />
          )}

          {/* TAB 5: KELOLA USTADZ & USTADZAH (KHUSUS ADMIN UTAMA) */}
          {activeTab === 'ustadz' && isAdmin && (
            <AdminManageUstadzView
              classList={classList}
              currentUser={currentUser}
              onRefreshData={reloadData}
            />
          )}
        </main>
      </div>

      {/* MODALS */}
      {/* 1. Modal Catat Setoran Hafalan */}
      <SetoranModal
        isOpen={isSetoranModalOpen}
        onClose={() => setIsSetoranModalOpen(false)}
        onSave={handleSaveSetoran}
        santriList={santriList}
        classList={classList}
        surahsList={surahsList}
        preselectedSantri={setoranPreselectedSantri}
        currentUser={currentUser}
      />

      {/* 2. Modal Verifikasi PIN 4-Angka Kelas */}
      {pinTargetClass && (
        <PinModal
          targetClass={pinTargetClass}
          onClose={() => setPinTargetClass(null)}
          onSuccess={handlePinSuccess}
        />
      )}

      {/* 3. Modal Rapor Digital Santri */}
      {selectedSantri && (
        <SantriDetailModal
          santri={selectedSantri}
          onClose={() => setSelectedSantri(null)}
          classList={classList}
          setoranList={setoranList}
          surahsList={surahsList}
          currentUser={currentUser}
          onOpenSetoranForSantri={(santri) => handleOpenSetoran(santri)}
        />
      )}

      {/* 4. Modal Buat Kelas Baru (Admin Utama) */}
      <AdminManageClassModal
        isOpen={isAdminClassModalOpen}
        onClose={() => setIsAdminClassModalOpen(false)}
        onSave={handleSaveClass}
      />

      {/* 5. Modal Tambah Surah Baru (Admin Utama) */}
      <AdminManageSurahModal
        isOpen={isAdminSurahModalOpen}
        onClose={() => setIsAdminSurahModalOpen(false)}
        onSave={handleSaveSurah}
      />

      {/* 6. Modal Tambah / Edit Santri */}
      <AddSantriModal
        isOpen={isAddSantriModalOpen}
        onClose={() => setIsAddSantriModalOpen(false)}
        onSave={handleSaveSantri}
        classList={classList}
        defaultClassId={addSantriClassId}
        editingSantri={editingSantri}
      />

      {/* 7. Modal Login Pengajar / Admin / Tamu */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSelectUser={handleLogin}
        onSetGuest={handleSetGuest}
      />
    </div>
  );
}
