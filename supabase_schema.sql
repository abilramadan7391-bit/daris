-- ====================================================================
-- MADRASAH DARUL ISTIQOMAH - SKEMA DATABASE SUPABASE (FREE TIER)
-- Jalankan skrip ini di: Supabase Console -> SQL Editor -> New Query -> Run
-- ====================================================================

-- 1. TABEL PROFIL PENGGUNA (Admin, Ustadz & Ustadzah)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'ustadz', 'ustadzah')),
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL KELAS / HALAQAH
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    ustadz_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    pin_code VARCHAR(4) NOT NULL, -- PIN 4 digit untuk verifikasi akses Ustadz
    room TEXT,
    schedule TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL MASTER SURAH (Default Juz 30 / Juz Amma)
CREATE TABLE IF NOT EXISTS surahs (
    id SERIAL PRIMARY KEY,
    number INT NOT NULL UNIQUE,
    name_latin TEXT NOT NULL,
    name_arabic TEXT NOT NULL,
    total_ayat INT NOT NULL,
    juz INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL DATA SANTRI
CREATE TABLE IF NOT EXISTS santri (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nis VARCHAR(50) UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    nickname TEXT,
    gender VARCHAR(1) CHECK (gender IN ('L', 'P')),
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    parent_name TEXT,
    parent_phone TEXT,
    status TEXT DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Lulus', 'Nonaktif')),
    target_juz INT DEFAULT 30,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL CATATAN SETORAN HAFALAN
CREATE TABLE IF NOT EXISTS setoran (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    santri_id UUID NOT NULL REFERENCES santri(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    surah_id INT NOT NULL REFERENCES surahs(id) ON DELETE RESTRICT,
    surah_name TEXT NOT NULL,
    ayat_start INT NOT NULL,
    ayat_end INT NOT NULL,
    predikat VARCHAR(1) NOT NULL CHECK (predikat IN ('A', 'B', 'C')),
    notes TEXT,
    ustadz_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ustadz_name TEXT,
    setoran_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Aktifkan RLS di setiap tabel
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE surahs ENABLE ROW LEVEL SECURITY;
ALTER TABLE santri ENABLE ROW LEVEL SECURITY;
ALTER TABLE setoran ENABLE ROW LEVEL SECURITY;

-- Kebijakan untuk Tamu / Publik (Read-Only)
CREATE POLICY "Publik dapat melihat profil ustadz" ON profiles FOR SELECT USING (true);
CREATE POLICY "Publik dapat melihat daftar kelas" ON classes FOR SELECT USING (true);
CREATE POLICY "Publik dapat melihat daftar surah" ON surahs FOR SELECT USING (true);
CREATE POLICY "Publik dapat melihat data santri" ON santri FOR SELECT USING (true);
CREATE POLICY "Publik dapat melihat riwayat setoran" ON setoran FOR SELECT USING (true);

-- Kebijakan Modifikasi untuk Ustadz & Admin Terautentikasi
CREATE POLICY "User dapat update profil sendiri" ON profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Admin dapat mengelola kelas" ON classes FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin dapat mengelola surah" ON surahs FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Ustadz dan Admin dapat menambah santri" ON santri FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'ustadz'))
);

CREATE POLICY "Ustadz dan Admin dapat update santri" ON santri FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'ustadz'))
);

CREATE POLICY "Ustadz dan Admin dapat mencatat setoran" ON setoran FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'ustadz'))
);

CREATE POLICY "Ustadz dan Admin dapat update setoran" ON setoran FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'ustadz'))
);

-- ====================================================================
-- SEED DATA 37 SURAH JUZ 30 (JUZ AMMA)
-- ====================================================================
INSERT INTO surahs (number, name_latin, name_arabic, total_ayat, juz) VALUES
(78, 'An-Naba''', 'النبأ', 40, 30),
(79, 'An-Nazi''at', 'النازعات', 46, 30),
(80, '''Abasa', 'عبس', 42, 30),
(81, 'At-Takwir', 'التكوير', 29, 30),
(82, 'Al-Infitar', 'الانفطار', 19, 30),
(83, 'Al-Muthaffifin', 'المطففين', 36, 30),
(84, 'Al-Inshiqaq', 'الانشقاق', 25, 30),
(85, 'Al-Buruj', 'البروج', 22, 30),
(86, 'Ath-Thariq', 'الطارق', 17, 30),
(87, 'Al-A''la', 'الأعلى', 19, 30),
(88, 'Al-Ghasyiyah', 'الغاشية', 26, 30),
(89, 'Al-Fajr', 'الفجر', 30, 30),
(90, 'Al-Balad', 'البلد', 20, 30),
(91, 'Asy-Syams', 'الشمس', 15, 30),
(92, 'Al-Lail', 'الليل', 21, 30),
(93, 'Adh-Dhuha', 'الضحى', 11, 30),
(94, 'Asy-Syarh', 'الشرح', 8, 30),
(95, 'At-Tin', 'التين', 8, 30),
(96, 'Al-''Alaq', 'العلق', 19, 30),
(97, 'Al-Qadr', 'القدر', 5, 30),
(98, 'Al-Bayyinah', 'البينة', 8, 30),
(99, 'Az-Zalzalah', 'الزلزلة', 8, 30),
(100, 'Al-''Adiyat', 'العاديات', 11, 30),
(101, 'Al-Qari''ah', 'القارعة', 11, 30),
(102, 'At-Takatsur', 'التكاثر', 8, 30),
(103, 'Al-''Ashr', 'العصر', 3, 30),
(104, 'Al-Humazah', 'الهمزة', 9, 30),
(105, 'Al-Fil', 'الفيل', 5, 30),
(106, 'Quraisy', 'قريش', 4, 30),
(107, 'Al-Ma''un', 'الماعون', 7, 30),
(108, 'Al-Kautsar', 'الكوثر', 3, 30),
(109, 'Al-Kafirun', 'الكافرون', 6, 30),
(110, 'An-Nasr', 'النصر', 3, 30),
(111, 'Al-Lahab', 'اللهب', 5, 30),
(112, 'Al-Ikhlas', 'الإخلاص', 4, 30),
(113, 'Al-Falaq', 'الفلق', 5, 30),
(114, 'An-Nas', 'الناس', 6, 30)
ON CONFLICT (number) DO NOTHING;
