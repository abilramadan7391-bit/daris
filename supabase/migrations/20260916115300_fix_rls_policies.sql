-- Fix RLS Policies for Classes, Santri, Setoran, Surahs, and Profiles
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE santri ENABLE ROW LEVEL SECURITY;
ALTER TABLE setoran ENABLE ROW LEVEL SECURITY;
ALTER TABLE surahs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Publik dan User dapat mengelola kelas" ON classes;
DROP POLICY IF EXISTS "Admin dapat mengelola kelas" ON classes;
CREATE POLICY "Publik dan User dapat mengelola kelas" ON classes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Publik dan User dapat mengelola santri" ON santri;
DROP POLICY IF EXISTS "Ustadz dan Admin dapat menambah santri" ON santri;
DROP POLICY IF EXISTS "Ustadz dan Admin dapat update santri" ON santri;
CREATE POLICY "Publik dan User dapat mengelola santri" ON santri FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Publik dan User dapat mengelola setoran" ON setoran;
DROP POLICY IF EXISTS "Ustadz dan Admin dapat mencatat setoran" ON setoran;
DROP POLICY IF EXISTS "Ustadz dan Admin dapat update setoran" ON setoran;
CREATE POLICY "Publik dan User dapat mengelola setoran" ON setoran FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Publik dan User dapat mengelola surahs" ON surahs;
DROP POLICY IF EXISTS "Admin dapat mengelola surah" ON surahs;
CREATE POLICY "Publik dan User dapat mengelola surahs" ON surahs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Publik dan User dapat mengelola profiles" ON profiles;
DROP POLICY IF EXISTS "Publik dapat melihat profil ustadz" ON profiles;
DROP POLICY IF EXISTS "User dapat update profil sendiri" ON profiles;
CREATE POLICY "Publik dan User dapat mengelola profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
