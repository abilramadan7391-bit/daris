import { createClient } from '@supabase/supabase-js';
import {
  DEFAULT_JUZ_AMMA_SURAHS,
  INITIAL_CLASSES,
  INITIAL_SANTRI,
  INITIAL_SETORAN,
  INITIAL_USERS
} from '../data/initialData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id') &&
  !supabaseUrl.includes('abcdefghijklmnop')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ====================================================================
// NORMALIZERS (BRIDGING SUPABASE SNAKE_CASE & FRONTEND CAMELCASE)
// ====================================================================
export const normalizeSurah = (s) => {
  if (!s) return null;
  return {
    id: s.id,
    number: s.number,
    nameLatin: s.nameLatin || s.name_latin || `Surah ${s.number}`,
    nameArabic: s.nameArabic || s.name_arabic || '',
    totalAyat: s.totalAyat ?? s.total_ayat ?? 0,
    juz: s.juz || 30,
    isActive: s.isActive ?? s.is_active ?? true
  };
};

export const normalizeClass = (cls) => {
  if (!cls) return null;
  return {
    id: cls.id,
    name: cls.name || '',
    description: cls.description || '',
    ustadzId: cls.ustadzId || cls.ustadz_id || '',
    ustadzName: cls.ustadzName || cls.ustadz_name || 'Ustadz Pengampu',
    pinCode: cls.pinCode || cls.pin_code || '1234',
    room: cls.room || '',
    schedule: cls.schedule || ''
  };
};

export const normalizeSantri = (s) => {
  if (!s) return null;
  const name = s.fullName || s.full_name || 'Santri';
  return {
    id: s.id,
    nis: s.nis || '',
    fullName: name,
    nickname: s.nickname || name.split(' ')[0],
    gender: s.gender || 'L',
    classId: s.classId || s.class_id || '',
    parentName: s.parentName || s.parent_name || '',
    parentPhone: s.parentPhone || s.parent_phone || '',
    status: s.status || 'Aktif',
    targetJuz: s.targetJuz ?? s.target_juz ?? 30,
    avatar: s.avatar || s.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
  };
};

export const normalizeSetoran = (item) => {
  if (!item) return null;
  return {
    id: item.id,
    santriId: item.santriId || item.santri_id || '',
    santriName: item.santriName || item.santri_name || '',
    classId: item.classId || item.class_id || '',
    surahId: item.surahId || item.surah_id || 0,
    surahName: item.surahName || item.surah_name || '',
    ayatStart: item.ayatStart ?? item.ayat_start ?? 1,
    ayatEnd: item.ayatEnd ?? item.ayat_end ?? 1,
    predikat: item.predikat || 'A',
    notes: item.notes || '',
    ustadzId: item.ustadzId || item.ustadz_id || '',
    ustadzName: item.ustadzName || item.ustadz_name || 'Ustadz Penguji',
    date: item.date || item.setoran_date || new Date().toISOString().split('T')[0],
    isBulk: item.isBulk ?? item.is_bulk ?? (Boolean(item.notes && item.notes.includes('Input setoran awal')))
  };
};

const isValidUUID = (str) => {
  if (!str || typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

// ====================================================================
// LOCAL STORAGE REACTIVE STORE (DEMO / OFFLINE FALLBACK)
// ====================================================================
const STORAGE_KEYS = {
  SURAHS: 'mti_surahs_v2',
  CLASSES: 'mti_classes_v2',
  SANTRI: 'mti_santri_v2',
  SETORAN: 'mti_setoran_v2',
  USER: 'mti_active_user_v2',
  PIN_SESSIONS: 'mti_unlocked_classes_v2'
};

const getLocal = (key, fallback) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    console.warn(`Error reading localStorage ${key}:`, e);
    return fallback;
  }
};

const setLocal = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error writing localStorage ${key}:`, e);
  }
};

// Initial setup: clean legacy demo data and ensure clean slate
export const initializeStore = () => {
  try {
    // Purge legacy mock data keys from browser
    const legacyKeys = [
      'mti_classes_v1',
      'mti_santri_v1',
      'mti_setoran_v1',
      'mti_surahs_v1',
      'mti_active_user_v1',
      'mti_unlocked_classes_v1'
    ];
    legacyKeys.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    // ignore
  }

  if (!localStorage.getItem(STORAGE_KEYS.SURAHS)) {
    setLocal(STORAGE_KEYS.SURAHS, DEFAULT_JUZ_AMMA_SURAHS);
  }
};

export const resetToDefaultData = () => {
  localStorage.clear();
  setLocal(STORAGE_KEYS.SURAHS, DEFAULT_JUZ_AMMA_SURAHS);
  setLocal(STORAGE_KEYS.CLASSES, []);
  setLocal(STORAGE_KEYS.SANTRI, []);
  setLocal(STORAGE_KEYS.SETORAN, []);
  setLocal(STORAGE_KEYS.PIN_SESSIONS, []);
  window.location.reload();
};

// Data access layer that bridges Supabase and local storage
export const dataService = {
  // --- SURAHS ---
  async getSurahs() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('surahs').select('*').order('number');
        if (!error && data && data.length > 0) {
          return data.map(normalizeSurah);
        }
      } catch (e) {
        console.error('Supabase getSurahs error, falling back:', e);
      }
    }
    const local = getLocal(STORAGE_KEYS.SURAHS, DEFAULT_JUZ_AMMA_SURAHS);
    return (local || []).map(normalizeSurah);
  },

  async addSurah(surah) {
    if (isSupabaseConfigured && supabase) {
      try {
        const payload = {
          number: Number(surah.number),
          name_latin: surah.nameLatin || surah.name_latin,
          name_arabic: surah.nameArabic || surah.name_arabic || 'القرآن',
          total_ayat: Number(surah.totalAyat || surah.total_ayat),
          juz: Number(surah.juz) || 30
        };
        const { data, error } = await supabase.from('surahs').insert([payload]).select().single();
        if (!error && data) return normalizeSurah(data);
      } catch (e) {
        console.error('Supabase addSurah error:', e);
      }
    }
    const current = getLocal(STORAGE_KEYS.SURAHS, DEFAULT_JUZ_AMMA_SURAHS);
    const newSurah = normalizeSurah({
      id: surah.number || Date.now(),
      ...surah
    });
    const updated = [...current, newSurah].sort((a, b) => a.number - b.number);
    setLocal(STORAGE_KEYS.SURAHS, updated);
    return newSurah;
  },

  // --- CLASSES ---
  async getClasses() {
    if (isSupabaseConfigured && supabase) {
      try {
        const [classesRes, profilesRes] = await Promise.all([
          supabase.from('classes').select('*').order('name'),
          supabase.from('profiles').select('id, full_name')
        ]);

        if (!classesRes.error && Array.isArray(classesRes.data)) {
          const profileMap = {};
          if (!profilesRes.error && Array.isArray(profilesRes.data)) {
            profilesRes.data.forEach(p => {
              if (p.id) profileMap[p.id] = p.full_name;
            });
          }

          return classesRes.data.map(cls => {
            const resolvedUstadzName = profileMap[cls.ustadz_id] || cls.ustadz_name || cls.ustadzName || 'Ustadz Pengampu';
            return normalizeClass({
              ...cls,
              ustadzName: resolvedUstadzName
            });
          });
        }
      } catch (e) {
        console.error('Supabase getClasses error, falling back:', e);
      }
    }
    const local = getLocal(STORAGE_KEYS.CLASSES, []);
    return (local || []).map(normalizeClass);
  },

  async addClass(newClass) {
    if (isSupabaseConfigured && supabase) {
      try {
        const payload = {
          name: newClass.name,
          description: newClass.description || 'Halaqah Tahfidz',
          pin_code: String(newClass.pinCode || '1234'),
          room: newClass.room || '',
          schedule: newClass.schedule || ''
        };
        if (isValidUUID(newClass.ustadzId)) {
          payload.ustadz_id = newClass.ustadzId;
        }
        const { data, error } = await supabase.from('classes').insert([payload]).select().single();
        if (!error && data) {
          let ustadzName = newClass.ustadzName;
          if (!ustadzName && data.ustadz_id) {
            const { data: prof } = await supabase.from('profiles').select('full_name').eq('id', data.ustadz_id).maybeSingle();
            if (prof) ustadzName = prof.full_name;
          }
          return normalizeClass({ ...data, ustadzName: ustadzName || 'Ustadz Pengampu' });
        }
      } catch (e) {
        console.error('Supabase addClass error:', e);
      }
    }
    const current = getLocal(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
    const created = normalizeClass({
      id: `cls-${Date.now()}`,
      ...newClass
    });
    const updated = [...current, created];
    setLocal(STORAGE_KEYS.CLASSES, updated);
    return created;
  },

  async updateClass(classId, updates) {
    if (isSupabaseConfigured && supabase && isValidUUID(classId)) {
      try {
        const payload = {};
        if (updates.name) payload.name = updates.name;
        if (updates.description) payload.description = updates.description;
        if (updates.pinCode) payload.pin_code = updates.pinCode;
        if (updates.room) payload.room = updates.room;
        if (updates.schedule) payload.schedule = updates.schedule;
        if (updates.ustadzId !== undefined) payload.ustadz_id = updates.ustadzId || null;

        const { data, error } = await supabase.from('classes').update(payload).eq('id', classId).select().single();
        if (!error && data) {
          let ustadzName = updates.ustadzName;
          if (!ustadzName && data.ustadz_id) {
            const { data: prof } = await supabase.from('profiles').select('full_name').eq('id', data.ustadz_id).maybeSingle();
            if (prof) ustadzName = prof.full_name;
          }
          return normalizeClass({ ...data, ustadzName: ustadzName || 'Ustadz Pengampu' });
        }
      } catch (e) {
        console.error('Supabase updateClass error:', e);
      }
    }
    const current = getLocal(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
    const updated = current.map(cls => cls.id === classId ? normalizeClass({ ...cls, ...updates }) : cls);
    setLocal(STORAGE_KEYS.CLASSES, updated);
    return updated.find(cls => cls.id === classId);
  },

  // --- SANTRI ---
  async getSantri() {
    let remoteList = [];
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('santri').select('*').order('full_name');
        if (!error && Array.isArray(data)) {
          remoteList = data.map(normalizeSantri);
        }
      } catch (e) {
        console.error('Supabase getSantri error, falling back:', e);
      }
    }
    const local = getLocal(STORAGE_KEYS.SANTRI, INITIAL_SANTRI);
    const localList = (local || []).map(normalizeSantri);

    if (remoteList.length === 0) {
      return localList;
    }

    const map = new Map();
    remoteList.forEach(s => map.set(String(s.id), s));
    localList.forEach(ls => {
      const existing = map.get(String(ls.id));
      if (!existing) {
        if (ls.fullName && ls.fullName !== 'Santri') {
          map.set(String(ls.id), ls);
        }
      } else {
        const merged = { ...existing };
        if (ls.avatar && !ls.avatar.includes('dicebear')) {
          merged.avatar = ls.avatar;
          merged.avatar_url = ls.avatar;
        }
        if (ls.fullName && ls.fullName !== 'Santri') merged.fullName = ls.fullName;
        if (ls.nickname) merged.nickname = ls.nickname;
        if (ls.nis) merged.nis = ls.nis;
        if (ls.classId) merged.classId = ls.classId;
        if (ls.parentName) merged.parentName = ls.parentName;
        if (ls.parentPhone) merged.parentPhone = ls.parentPhone;
        if (ls.gender) merged.gender = ls.gender;
        if (ls.status) merged.status = ls.status;

        map.set(String(ls.id), normalizeSantri(merged));
      }
    });

    const result = Array.from(map.values());
    setLocal(STORAGE_KEYS.SANTRI, result);
    return result;
  },

  async addSantri(santri) {
    const current = getLocal(STORAGE_KEYS.SANTRI, INITIAL_SANTRI);
    const created = normalizeSantri({
      id: `san-${Date.now()}`,
      avatar: santri.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(santri.fullName || 'Santri')}`,
      status: 'Aktif',
      ...santri
    });
    const updated = [created, ...current];
    setLocal(STORAGE_KEYS.SANTRI, updated);

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = {
          nis: santri.nis,
          full_name: santri.fullName,
          nickname: santri.nickname || (santri.fullName ? santri.fullName.split(' ')[0] : 'Santri'),
          gender: santri.gender || 'L',
          parent_name: santri.parentName || '',
          parent_phone: santri.parentPhone || '',
          target_juz: Number(santri.targetJuz) || 30,
          status: 'Aktif'
        };
        if (santri.avatar) {
          payload.avatar_url = santri.avatar;
          payload.avatar = santri.avatar;
        }
        if (isValidUUID(santri.classId)) {
          payload.class_id = santri.classId;
        }
        const { data, error } = await supabase.from('santri').insert([payload]).select().single();
        if (!error && data) return normalizeSantri(data);
      } catch (e) {
        console.error('Supabase addSantri error:', e);
      }
    }
    return created;
  },

  async updateSantri(santriId, updates) {
    const current = getLocal(STORAGE_KEYS.SANTRI, INITIAL_SANTRI);
    let found = false;
    const updatedList = current.map(s => {
      if (String(s.id) === String(santriId)) {
        found = true;
        return { ...s, ...updates };
      }
      return s;
    });

    if (!found) {
      updatedList.push({ id: santriId, ...updates });
    }

    setLocal(STORAGE_KEYS.SANTRI, updatedList);

    let updatedSantri = updatedList.find(s => String(s.id) === String(santriId));

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = {};
        if (updates.fullName) payload.full_name = updates.fullName;
        if (updates.nis) payload.nis = updates.nis;
        if (updates.gender) payload.gender = updates.gender;
        if (updates.parentName) payload.parent_name = updates.parentName;
        if (updates.parentPhone) payload.parent_phone = updates.parentPhone;
        if (updates.targetJuz) payload.target_juz = Number(updates.targetJuz);
        if (updates.avatar !== undefined) {
          payload.avatar_url = updates.avatar;
          payload.avatar = updates.avatar;
        }
        if (isValidUUID(updates.classId)) payload.class_id = updates.classId;

        if (Object.keys(payload).length > 0) {
          const { data, error } = await supabase.from('santri').update(payload).eq('id', String(santriId)).select().maybeSingle();
          if (!error && data) {
            updatedSantri = normalizeSantri(data);
          }
        }
      } catch (e) {
        console.error('Supabase updateSantri exception:', e);
      }
    }

    return updatedSantri;
  },

  async deleteSantri(santriId) {
    const currentSantri = getLocal(STORAGE_KEYS.SANTRI, INITIAL_SANTRI);
    const updatedSantri = currentSantri.filter(s => String(s.id) !== String(santriId));
    setLocal(STORAGE_KEYS.SANTRI, updatedSantri);

    const currentSetoran = getLocal(STORAGE_KEYS.SETORAN, INITIAL_SETORAN);
    const updatedSetoran = currentSetoran.filter(s => String(s.santriId) !== String(santriId));
    setLocal(STORAGE_KEYS.SETORAN, updatedSetoran);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('setoran').delete().eq('santri_id', String(santriId));
        await supabase.from('santri').delete().eq('id', String(santriId));
      } catch (e) {
        console.error('Supabase deleteSantri error:', e);
      }
    }

    return true;
  },

  // --- SETORAN ---
  async getSetoran() {
    let remoteList = [];
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('setoran').select('*').order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          remoteList = data.map(normalizeSetoran);
        }
      } catch (e) {
        console.error('Supabase getSetoran error, falling back:', e);
      }
    }
    const local = getLocal(STORAGE_KEYS.SETORAN, INITIAL_SETORAN);
    const localList = (local || []).map(normalizeSetoran);

    if (remoteList.length === 0) {
      return localList;
    }

    const map = new Map();
    localList.forEach(s => map.set(String(s.id), s));
    remoteList.forEach(s => {
      if (!map.has(String(s.id))) {
        map.set(String(s.id), s);
      }
    });

    return Array.from(map.values());
  },

  async addSetoran(record) {
    const current = getLocal(STORAGE_KEYS.SETORAN, INITIAL_SETORAN);
    const created = normalizeSetoran({
      id: `set-${Date.now()}`,
      date: record.date || new Date().toISOString().split('T')[0],
      ...record
    });
    const updated = [created, ...current];
    setLocal(STORAGE_KEYS.SETORAN, updated);

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = {
          surah_id: Number(record.surahId),
          surah_name: record.surahName,
          ayat_start: Number(record.ayatStart),
          ayat_end: Number(record.ayatEnd),
          predikat: record.predikat,
          notes: record.notes || '',
          ustadz_name: record.ustadzName || 'Ustadz Pengampu',
          setoran_date: record.date || new Date().toISOString().split('T')[0]
        };
        if (isValidUUID(record.santriId)) payload.santri_id = record.santriId;
        if (isValidUUID(record.classId)) payload.class_id = record.classId;
        if (isValidUUID(record.ustadzId)) payload.ustadz_id = record.ustadzId;

        const { data, error } = await supabase.from('setoran').insert([payload]).select().single();
        if (!error && data) return normalizeSetoran(data);
      } catch (e) {
        console.error('Supabase addSetoran error:', e);
      }
    }

    return created;
  },

  async addSetoranBatch(records) {
    if (!records || records.length === 0) return [];

    const current = getLocal(STORAGE_KEYS.SETORAN, INITIAL_SETORAN);
    const createdList = records.map((record, idx) => normalizeSetoran({
      id: `set-${Date.now()}-${idx}`,
      date: record.date || new Date().toISOString().split('T')[0],
      isBulk: true,
      ...record
    }));
    const updated = [...createdList, ...current];
    setLocal(STORAGE_KEYS.SETORAN, updated);

    if (isSupabaseConfigured && supabase) {
      try {
        const payloads = records.map(record => {
          const payload = {
            surah_id: Number(record.surahId),
            surah_name: record.surahName,
            ayat_start: Number(record.ayatStart),
            ayat_end: Number(record.ayatEnd),
            predikat: record.predikat || 'A',
            notes: record.notes || 'Input setoran awal/riwayat hafalan santri.',
            ustadz_name: record.ustadzName || 'Ustadz Pengampu',
            setoran_date: record.date || new Date().toISOString().split('T')[0],
            is_bulk: true
          };
          if (isValidUUID(record.santriId)) payload.santri_id = record.santriId;
          if (isValidUUID(record.classId)) payload.class_id = record.classId;
          if (isValidUUID(record.ustadzId)) payload.ustadz_id = record.ustadzId;
          return payload;
        });

        await supabase.from('setoran').insert(payloads).select();
      } catch (e) {
        console.error('Supabase addSetoranBatch error:', e);
      }
    }

    return createdList;
  },

  async updateSetoran(setoranId, updates) {
    if (isSupabaseConfigured && supabase && (isValidUUID(setoranId) || typeof setoranId === 'string')) {
      try {
        const payload = {};
        if (updates.surahId) payload.surah_id = Number(updates.surahId);
        if (updates.surahName) payload.surah_name = updates.surahName;
        if (updates.ayatStart !== undefined) payload.ayat_start = Number(updates.ayatStart);
        if (updates.ayatEnd !== undefined) payload.ayat_end = Number(updates.ayatEnd);
        if (updates.predikat) payload.predikat = updates.predikat;
        if (updates.notes !== undefined) payload.notes = updates.notes;
        if (updates.date) payload.setoran_date = updates.date;
        if (isValidUUID(updates.santriId)) payload.santri_id = updates.santriId;
        if (isValidUUID(updates.classId)) payload.class_id = updates.classId;

        const { data, error } = await supabase.from('setoran').update(payload).eq('id', setoranId).select().single();
        if (!error && data) return normalizeSetoran(data);
      } catch (e) {
        console.error('Supabase updateSetoran error:', e);
      }
    }
    const current = getLocal(STORAGE_KEYS.SETORAN, INITIAL_SETORAN);
    const updated = current.map(s => s.id === setoranId ? normalizeSetoran({ ...s, ...updates }) : s);
    setLocal(STORAGE_KEYS.SETORAN, updated);
    return updated.find(s => s.id === setoranId);
  },

  async deleteSetoran(setoranId) {
    if (isSupabaseConfigured && supabase && (isValidUUID(setoranId) || typeof setoranId === 'string')) {
      try {
        const { error } = await supabase.from('setoran').delete().eq('id', setoranId);
        if (!error) return true;
      } catch (e) {
        console.error('Supabase deleteSetoran error:', e);
      }
    }
    const current = getLocal(STORAGE_KEYS.SETORAN, INITIAL_SETORAN);
    const updated = current.filter(s => s.id !== setoranId);
    setLocal(STORAGE_KEYS.SETORAN, updated);
    return true;
  },

  // --- PROFILES / USERS ---
  async getProfiles() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          return data.map(p => ({
            id: p.id,
            fullName: p.full_name || 'Pengajar',
            role: p.role || 'ustadz',
            email: p.email || '',
            avatar: p.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(p.full_name || 'User')}`,
            createdAt: p.created_at
          }));
        }
      } catch (e) {
        console.error('Supabase getProfiles error, falling back:', e);
      }
    }
    const local = getLocal('mti_profiles_v2', []);
    return local;
  },

  async updateProfile(profileId, updates) {
    if (isSupabaseConfigured && supabase && isValidUUID(profileId)) {
      try {
        const payload = {};
        if (updates.fullName) payload.full_name = updates.fullName;
        if (updates.role) payload.role = updates.role;
        const { data, error } = await supabase.from('profiles').update(payload).eq('id', profileId).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.error('Supabase updateProfile error:', e);
      }
    }
  },

  async deleteProfile(profileId) {
    if (isSupabaseConfigured && supabase && isValidUUID(profileId)) {
      try {
        const { error } = await supabase.from('profiles').delete().eq('id', profileId);
        if (!error) return true;
      } catch (e) {
        console.error('Supabase deleteProfile error:', e);
      }
    }
    return false;
  },

  // --- PIN VERIFICATION FOR USTADZ ---
  isClassUnlocked(classId) {
    const unlocked = getLocal(STORAGE_KEYS.PIN_SESSIONS, []);
    return unlocked.includes(classId);
  },

  unlockClass(classId) {
    const unlocked = getLocal(STORAGE_KEYS.PIN_SESSIONS, []);
    if (!unlocked.includes(classId)) {
      setLocal(STORAGE_KEYS.PIN_SESSIONS, [...unlocked, classId]);
    }
  },

  lockAllClasses() {
    setLocal(STORAGE_KEYS.PIN_SESSIONS, []);
  },

  // --- ACTIVE USER SESSION ---
  getActiveUser() {
    return getLocal(STORAGE_KEYS.USER, null);
  },

  setActiveUser(user) {
    setLocal(STORAGE_KEYS.USER, user);
  },

  clearActiveUser() {
    localStorage.removeItem(STORAGE_KEYS.USER);
    this.lockAllClasses();
  }
};
