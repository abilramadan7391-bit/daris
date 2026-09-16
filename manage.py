#!/usr/bin/env python3
"""
===================================================================
PENGELOLA DATABASE MADRASAH DARUL ISTIQOMAH (manage.py)
Script CLI interaktif untuk administrasi Supabase & Manajemen Data
===================================================================
"""

import os
import sys
import json
import random
import datetime
import urllib.request
import urllib.error
import urllib.parse

# -------------------------------------------------------------
# Color Palettes & Formatting
# -------------------------------------------------------------
C_RESET  = "\033[0m"
C_BOLD   = "\033[1m"
C_DIM    = "\033[2m"
C_GREEN  = "\033[32m"
C_YELLOW = "\033[33m"
C_BLUE   = "\033[34m"
C_CYAN   = "\033[36m"
C_RED    = "\033[31m"
C_BG_GREEN = "\033[42;30m"

# -------------------------------------------------------------
# Load Environment Variables (.env)
# -------------------------------------------------------------
def load_env():
    env_vars = {}
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if not os.path.exists(env_path):
        env_path = '.env'
    
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    env_vars[k.strip()] = v.strip().strip("'\"")
    return env_vars

ENV = load_env()
SUPABASE_URL = ENV.get("VITE_SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = ENV.get("VITE_SUPABASE_ANON_KEY", "")
SERVICE_ROLE_KEY = ENV.get("SUPABASE_SERVICE_ROLE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    print(f"{C_RED}{C_BOLD}[PERINGATAN]{C_RESET} File .env tidak memiliki VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY.")
    print("Pastikan file .env sudah diisi dengan kredensial Supabase Anda.\n")

# -------------------------------------------------------------
# Supabase HTTP Client Helper (Zero-dependency via urllib)
# -------------------------------------------------------------
def supabase_request(endpoint, method="GET", data=None, extra_headers=None):
    if not SUPABASE_URL or not SUPABASE_KEY:
        return None, "Kredensial Supabase belum dikonfigurasi di file .env."

    auth_key = SERVICE_ROLE_KEY if SERVICE_ROLE_KEY else SUPABASE_KEY

    url = f"{SUPABASE_URL}{endpoint}"
    headers = {
        "apikey": auth_key,
        "Authorization": f"Bearer {auth_key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    if extra_headers:
        headers.update(extra_headers)

    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            if res_body:
                try:
                    return json.loads(res_body), None
                except json.JSONDecodeError:
                    return res_body, None
            return {}, None
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        try:
            err_json = json.loads(err_msg)
            return None, err_json.get("message") or err_json.get("error_description") or err_msg
        except Exception:
            return None, err_msg
    except Exception as e:
        return None, str(e)


# -------------------------------------------------------------
# FITUR 1: Lihat Semua Santri & Status
# -------------------------------------------------------------
def list_santri():
    print(f"\n{C_BOLD}{C_CYAN}=== DAFTAR SANTRI MADRASAH DARUL ISTIQOMAH ==={C_RESET}")
    # Get santri and classes for name resolution
    santri_list, err = supabase_request("/rest/v1/santri?select=*&order=nis.asc")
    classes_list, _ = supabase_request("/rest/v1/classes?select=id,name")

    if err:
        print(f"{C_RED}Gagal memuat data santri: {err}{C_RESET}")
        return

    if not santri_list:
        print(f"{C_YELLOW}Belum ada data santri di database.{C_RESET}")
        return

    class_map = {c["id"]: c["name"] for c in (classes_list or [])}

    print("-" * 88)
    print(f"{'NIS':<12} {'NAMA LENGKAP':<28} {'G':<3} {'KELAS':<22} {'JUZ':<5} {'STATUS':<10}")
    print("-" * 88)
    for s in santri_list:
        nis = s.get("nis") or "-"
        name = s.get("full_name") or "-"
        gender = s.get("gender") or "-"
        cname = class_map.get(s.get("class_id"), "Belum Ada")
        juz = str(s.get("target_juz") or 30)
        status = s.get("status") or "Aktif"
        
        status_color = C_GREEN if status == "Aktif" else (C_CYAN if status == "Lulus" else C_RED)
        print(f"{nis:<12} {name[:26]:<28} {gender:<3} {cname[:20]:<22} {juz:<5} {status_color}{status:<10}{C_RESET}")
    print("-" * 88)
    print(f"Total Santri: {C_BOLD}{len(santri_list)}{C_RESET}\n")


# -------------------------------------------------------------
# FITUR 2: Tambah & Edit Data Santri
# -------------------------------------------------------------
def manage_santri():
    print(f"\n{C_BOLD}{C_CYAN}=== MANAJEMEN DATA SANTRI ==={C_RESET}")
    print("1. Tambah Santri Baru")
    print("2. Edit Data Santri yang Sudah Ada")
    print("0. Kembali ke Menu Utama")
    choice = input(f"{C_BOLD}Pilih opsi [0-2]: {C_RESET}").strip()

    if choice == "1":
        add_santri()
    elif choice == "2":
        edit_santri()


def add_santri():
    print(f"\n{C_BOLD}{C_GREEN}--- TAMBAH SANTRI BARU ---{C_RESET}")
    nis = input("Nomor Induk Santri (NIS) [contoh: DI-2026-001]: ").strip()
    if not nis:
        print(f"{C_RED}NIS tidak boleh kosong.{C_RESET}")
        return

    name = input("Nama Lengkap Santri: ").strip()
    if not name:
        print(f"{C_RED}Nama tidak boleh kosong.{C_RESET}")
        return

    nickname = input(f"Nama Panggilan (default: {name.split()[0]}): ").strip() or name.split()[0]
    
    gender = input("Jenis Kelamin [L/P]: ").strip().upper()
    if gender not in ["L", "P"]:
        gender = "L"

    # List classes to select
    classes_list, _ = supabase_request("/rest/v1/classes?select=id,name&order=name.asc")
    selected_class_id = None
    if classes_list:
        print("\nPilih Kelas / Halaqah:")
        for idx, cls in enumerate(classes_list, 1):
            print(f"  {idx}. {cls['name']}")
        c_choice = input(f"Pilih nomor kelas (tekan Enter jika tanpa kelas): ").strip()
        if c_choice.isdigit() and 1 <= int(c_choice) <= len(classes_list):
            selected_class_id = classes_list[int(c_choice) - 1]["id"]

    parent_name = input("Nama Orang Tua / Wali: ").strip()
    parent_phone = input("Nomor HP / WhatsApp Orang Tua: ").strip()
    target_juz_in = input("Target Hafalan Juz (default: 30): ").strip()
    target_juz = int(target_juz_in) if target_juz_in.isdigit() else 30

    payload = {
        "nis": nis,
        "full_name": name,
        "nickname": nickname,
        "gender": gender,
        "parent_name": parent_name,
        "parent_phone": parent_phone,
        "target_juz": target_juz,
        "status": "Aktif"
    }
    if selected_class_id:
        payload["class_id"] = selected_class_id

    res, err = supabase_request("/rest/v1/santri", method="POST", data=payload)
    if err:
        print(f"{C_RED}Gagal menambahkan santri: {err}{C_RESET}")
    else:
        print(f"{C_GREEN}{C_BOLD}✓ Berhasil! Santri {name} (NIS: {nis}) telah ditambahkan.{C_RESET}")


def edit_santri():
    print(f"\n{C_BOLD}{C_YELLOW}--- EDIT DATA SANTRI ---{C_RESET}")
    santri_list, err = supabase_request("/rest/v1/santri?select=*&order=nis.asc")
    if not santri_list:
        print(f"{C_YELLOW}Tidak ada data santri untuk diedit.{C_RESET}")
        return

    print("\nPilih Santri yang Ingin Diedit:")
    for idx, s in enumerate(santri_list, 1):
        print(f"  {idx}. {s.get('nis')} - {s.get('full_name')} ({s.get('status')})")

    idx_in = input(f"\nMasukkan nomor santri [1-{len(santri_list)}]: ").strip()
    if not idx_in.isdigit() or not (1 <= int(idx_in) <= len(santri_list)):
        print(f"{C_RED}Pilihan tidak valid.{C_RESET}")
        return

    target = santri_list[int(idx_in) - 1]
    santri_id = target["id"]

    print(f"\n{C_CYAN}Tekan Enter langsung jika tidak ingin mengubah nilai lama.{C_RESET}")
    new_name = input(f"Nama Lengkap [{target.get('full_name')}]: ").strip() or target.get("full_name")
    new_nis = input(f"NIS [{target.get('nis')}]: ").strip() or target.get("nis")
    new_gender = input(f"Gender L/P [{target.get('gender')}]: ").strip().upper() or target.get("gender")
    new_parent = input(f"Orang Tua [{target.get('parent_name')}]: ").strip() or target.get("parent_name")
    new_phone = input(f"No HP [{target.get('parent_phone')}]: ").strip() or target.get("parent_phone")
    
    print("\nStatus:")
    print("  1. Aktif")
    print("  2. Lulus")
    print("  3. Nonaktif")
    stat_in = input(f"Pilih status baru (1/2/3, kosongkan jika tetap '{target.get('status')}'): ").strip()
    status_map = {"1": "Aktif", "2": "Lulus", "3": "Nonaktif"}
    new_status = status_map.get(stat_in, target.get("status"))

    update_payload = {
        "full_name": new_name,
        "nis": new_nis,
        "gender": new_gender,
        "parent_name": new_parent,
        "parent_phone": new_phone,
        "status": new_status
    }

    res, err = supabase_request(f"/rest/v1/santri?id=eq.{santri_id}", method="PATCH", data=update_payload)
    if err:
        print(f"{C_RED}Gagal mengupdate data santri: {err}{C_RESET}")
    else:
        print(f"{C_GREEN}{C_BOLD}✓ Berhasil memperbarui data santri {new_name}!{C_RESET}")


# -------------------------------------------------------------
# FITUR 3: Tambah Kelas Baru & Generate PIN (4 Angka)
# -------------------------------------------------------------
def add_class():
    print(f"\n{C_BOLD}{C_GREEN}=== TAMBAH KELAS BARU & GENERATE PIN ==={C_RESET}")
    name = input("Nama Kelas / Halaqah [contoh: Tahfidz 1A (Laki-laki)]: ").strip()
    if not name:
        print(f"{C_RED}Nama kelas tidak boleh kosong.{C_RESET}")
        return

    desc = input("Deskripsi Singkat [contoh: Halaqah Ula Putra - Juz 30]: ").strip() or "Halaqah Tahfidzul Qur'an"
    room = input("Ruangan Kelas [contoh: Ruang Abu Bakar]: ").strip() or "Ruang Utama"
    schedule = input("Jadwal Belajar [contoh: Senin - Kamis, 07.30 - 09.30]: ").strip() or "Setiap Hari"

    # Select Ustadz / Ustadzah
    profiles, _ = supabase_request("/rest/v1/profiles?select=id,full_name,role&order=full_name.asc")
    ustadz_list = [p for p in (profiles or []) if p.get("role") in ["ustadz", "ustadzah"]]
    
    selected_ustadz_id = None
    selected_ustadz_name = "Belum Ditentukan"
    if ustadz_list:
        print("\nPilih Ustadz / Ustadzah Pengampu:")
        for idx, u in enumerate(ustadz_list, 1):
            print(f"  {idx}. {u['full_name']} ({u['role'].capitalize()})")
        u_choice = input("Pilih nomor pengampu (Enter jika kosong): ").strip()
        if u_choice.isdigit() and 1 <= int(u_choice) <= len(ustadz_list):
            selected_ustadz_id = ustadz_list[int(u_choice) - 1]["id"]
            selected_ustadz_name = ustadz_list[int(u_choice) - 1]["full_name"]

    # PIN 4 Digit
    print("\nOpsi PIN Keamanan Kelas (4 Digit):")
    print("  1. Generate PIN 4 Angka Otomatis Acak")
    print("  2. Masukkan PIN 4 Angka Manual Sendiri")
    pin_choice = input("Pilih opsi [1/2, default: 1]: ").strip()
    
    if pin_choice == "2":
        while True:
            pin = input("Masukkan 4 Digit Angka PIN [0000-9999]: ").strip()
            if len(pin) == 4 and pin.isdigit():
                break
            print(f"{C_RED}PIN harus tepat 4 digit angka!{C_RESET}")
    else:
        pin = str(random.randint(1000, 9999))

    payload = {
        "name": name,
        "description": desc,
        "room": room,
        "schedule": schedule,
        "pin_code": pin
    }
    if selected_ustadz_id:
        payload["ustadz_id"] = selected_ustadz_id

    res, err = supabase_request("/rest/v1/classes", method="POST", data=payload)
    if err:
        print(f"{C_RED}Gagal membuat kelas: {err}{C_RESET}")
    else:
        print(f"\n{C_BG_GREEN} BERHASIL MEMBUAT KELAS {C_RESET}")
        print(f"Nama Kelas   : {C_BOLD}{name}{C_RESET}")
        print(f"Wali Kelas   : {selected_ustadz_name}")
        print(f"Ruangan      : {room}")
        print(f"Jadwal       : {schedule}")
        print(f"PIN Keamanan : {C_BOLD}{C_YELLOW}{pin}{C_RESET}  <-- Berikan 4 angka ini kepada Ustadz pengampu")


# -------------------------------------------------------------
# FITUR 4: Lihat Daftar Kelas
# -------------------------------------------------------------
def list_classes():
    print(f"\n{C_BOLD}{C_CYAN}=== DAFTAR KELAS & HALAQAH MADRASAH ==={C_RESET}")
    classes, err = supabase_request("/rest/v1/classes?select=*&order=created_at.desc")
    profiles, _ = supabase_request("/rest/v1/profiles?select=id,full_name")
    santri, _ = supabase_request("/rest/v1/santri?select=class_id")

    if err:
        print(f"{C_RED}Gagal memuat kelas: {err}{C_RESET}")
        return

    if not classes:
        print(f"{C_YELLOW}Belum ada kelas yang terdaftar.{C_RESET}")
        return

    profile_map = {p["id"]: p["full_name"] for p in (profiles or [])}
    
    # Count santri per class
    count_map = {}
    for s in (santri or []):
        cid = s.get("class_id")
        if cid:
            count_map[cid] = count_map.get(cid, 0) + 1

    print("-" * 88)
    print(f"{'NAMA KELAS':<26} {'WALI PENGAMPU':<26} {'RUANGAN':<16} {'PIN':<6} {'SANTRI':<8}")
    print("-" * 88)
    for c in classes:
        cname = c.get("name") or "-"
        ustadz = profile_map.get(c.get("ustadz_id"), "Belum Ditentukan")
        room = c.get("room") or "-"
        pin = c.get("pin_code") or "****"
        scount = f"{count_map.get(c.get('id'), 0)} Santri"

        print(f"{cname[:24]:<26} {ustadz[:24]:<26} {room[:14]:<16} {C_YELLOW}{pin:<6}{C_RESET} {scount:<8}")
    print("-" * 88)
    print(f"Total Kelas: {C_BOLD}{len(classes)}{C_RESET}\n")


# -------------------------------------------------------------
# FITUR 5: Backup Database ke File JSON
# -------------------------------------------------------------
def backup_database():
    print(f"\n{C_BOLD}{C_BLUE}=== BACKUP SELURUH DATABASE KE FILE JSON ==={C_RESET}")
    tables = ["profiles", "classes", "santri", "setoran", "surahs"]
    backup_data = {
        "project": "Madrasah Darul Istiqomah",
        "created_at": datetime.datetime.now().isoformat(),
        "tables": {}
    }

    for tbl in tables:
        print(f"  Mengunduh tabel '{tbl}'...", end="", flush=True)
        data, err = supabase_request(f"/rest/v1/{tbl}?select=*")
        if err:
            print(f" {C_RED}Gagal ({err}){C_RESET}")
            backup_data["tables"][tbl] = []
        else:
            print(f" {C_GREEN}✓ ({len(data)} baris){C_RESET}")
            backup_data["tables"][tbl] = data

    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = os.path.join(os.path.dirname(__file__), "backups")
    os.makedirs(backup_dir, exist_ok=True)
    filename = os.path.join(backup_dir, f"backup_madrasah_{timestamp}.json")

    with open(filename, "w", encoding="utf-8") as f:
        json.dump(backup_data, f, indent=2, ensure_ascii=False)

    size_kb = round(os.path.getsize(filename) / 1024, 2)
    print(f"\n{C_GREEN}{C_BOLD}✓ Backup Berhasil Disimpan!{C_RESET}")
    print(f"Lokasi File : {C_BOLD}{filename}{C_RESET}")
    print(f"Ukuran File : {size_kb} KB\n")


# -------------------------------------------------------------
# FITUR 6: Tambah User (Admin / Ustadz / Ustadzah)
# -------------------------------------------------------------
def add_user():
    print(f"\n{C_BOLD}{C_GREEN}=== TAMBAH USER BARU (ADMIN / USTADZ / USTADZAH) ==={C_RESET}")
    email = input("Alamat Email Pengguna: ").strip().lower()
    if not email or "@" not in email:
        print(f"{C_RED}Format email tidak valid.{C_RESET}")
        return

    password = input("Password (minimal 6 karakter): ").strip()
    if len(password) < 6:
        print(f"{C_RED}Password minimal 6 karakter.{C_RESET}")
        return

    full_name = input("Nama Lengkap User: ").strip()
    if not full_name:
        print(f"{C_RED}Nama lengkap tidak boleh kosong.{C_RESET}")
        return

    print("\nPilih Hak Akses (Role):")
    print("  1. Admin Utama       (Akses Penuh Seluruh Sistem)")
    print("  2. Ustadz Pengajar   (Input Setoran, Kelola Santri di Kelasnya, butuh PIN)")
    print("  3. Ustadzah Pengajar (Input Setoran, Kelola Santri di Kelasnya, butuh PIN)")
    role_choice = input(f"{C_BOLD}Pilih nomor role [1-3]: {C_RESET}").strip()

    role_map = {"1": "admin", "2": "ustadz", "3": "ustadzah"}
    selected_role = role_map.get(role_choice, "ustadz")

    print(f"\nMendaftarkan user '{email}' ke Supabase Auth...")
    
    user_id = None
    user_token = None
    auth_err = None

    if SERVICE_ROLE_KEY:
        admin_headers = {
            "apikey": SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SERVICE_ROLE_KEY}"
        }
        admin_payload = {
            "email": email,
            "password": password,
            "email_confirm": True,
            "user_metadata": {
                "full_name": full_name,
                "role": selected_role
            }
        }
        auth_res, auth_err = supabase_request("/auth/v1/admin/users", method="POST", data=admin_payload, extra_headers=admin_headers)
        if auth_res and isinstance(auth_res, dict):
            user_id = auth_res.get("id") or (auth_res.get("user") and auth_res.get("user").get("id"))
    else:
        signup_payload = {
            "email": email,
            "password": password,
            "data": {
                "full_name": full_name,
                "role": selected_role
            }
        }
        auth_res, auth_err = supabase_request("/auth/v1/signup", method="POST", data=signup_payload)
        if auth_res and isinstance(auth_res, dict):
            user_id = auth_res.get("id") or (auth_res.get("user") and auth_res.get("user").get("id"))
            session = auth_res.get("session") or {}
            user_token = auth_res.get("access_token") or session.get("access_token")

    if not user_id and auth_err:
        print(f"{C_RED}Gagal mendaftarkan ke Supabase Auth: {auth_err}{C_RESET}")
        return

    # To insert into public.profiles without RLS rejection when service role is not present:
    # Attempt login to obtain JWT access token if user_token is not available yet
    if not SERVICE_ROLE_KEY and not user_token:
        login_res, _ = supabase_request("/auth/v1/token?grant_type=password", method="POST", data={"email": email, "password": password})
        if login_res and isinstance(login_res, dict):
            user_token = login_res.get("access_token")

    # Insert/Upsert into profiles table
    profile_payload = {
        "id": user_id,
        "full_name": full_name,
        "role": selected_role,
        "email": email,
        "avatar_url": f"https://api.dicebear.com/7.x/bottts/svg?seed={urllib.parse.quote(full_name)}"
    }

    extra_h = {}
    if user_token:
        extra_h = {"Authorization": f"Bearer {user_token}"}
    elif SERVICE_ROLE_KEY:
        extra_h = {"apikey": SERVICE_ROLE_KEY, "Authorization": f"Bearer {SERVICE_ROLE_KEY}"}

    p_res, p_err = supabase_request("/rest/v1/profiles", method="POST", data=profile_payload, extra_headers=extra_h)

    print(f"\n{C_BG_GREEN} BERHASIL MENAMBAHKAN USER {C_RESET}")
    print(f"Email        : {C_BOLD}{email}{C_RESET}")
    print(f"Nama Lengkap : {full_name}")
    print(f"Role         : {C_YELLOW}{selected_role.upper()}{C_RESET}")
    if p_err:
        print(f"{C_YELLOW}Catatan simpan profil: {p_err}{C_RESET}")
    else:
        print(f"{C_GREEN}✓ Profil berhasil disimpan ke database dan akan tampil di website.{C_RESET}")


# -------------------------------------------------------------
# FITUR 7: Lihat Semua User (Admin, Ustadz & Ustadzah)
# -------------------------------------------------------------
def list_users():
    print(f"\n{C_BOLD}{C_CYAN}=== DAFTAR USER SISTEM MADRASAH DARUL ISTIQOMAH ==={C_RESET}")
    
    # 1. Fetch profiles
    profiles, err = supabase_request("/rest/v1/profiles?select=*&order=created_at.desc")

    # 2. If service role is available, sync missing auth users into profiles automatically
    if SERVICE_ROLE_KEY:
        admin_headers = {"apikey": SERVICE_ROLE_KEY, "Authorization": f"Bearer {SERVICE_ROLE_KEY}"}
        auth_users, _ = supabase_request("/auth/v1/admin/users", extra_headers=admin_headers)
        if auth_users and isinstance(auth_users, dict) and "users" in auth_users:
            all_u = auth_users["users"]
            existing_ids = {p["id"] for p in (profiles or [])}
            for u in all_u:
                uid = u.get("id")
                if uid and uid not in existing_ids:
                    meta = u.get("user_metadata") or {}
                    fname = meta.get("full_name") or u.get("email", "").split("@")[0] or "User"
                    urole = meta.get("role") or ("admin" if "admin" in u.get("email", "") else "ustadz")
                    sync_payload = {
                        "id": uid,
                        "full_name": fname,
                        "role": urole,
                        "email": u.get("email"),
                        "avatar_url": f"https://api.dicebear.com/7.x/bottts/svg?seed={urllib.parse.quote(fname)}"
                    }
                    supabase_request("/rest/v1/profiles", method="POST", data=sync_payload, extra_headers=admin_headers)
            # Re-fetch profiles after auto-sync
            profiles, err = supabase_request("/rest/v1/profiles?select=*&order=created_at.desc")

    if err and not profiles:
        print(f"{C_RED}Gagal memuat profil user: {err}{C_RESET}")
        return

    if not profiles:
        print(f"{C_YELLOW}Belum ada data user di tabel profil.{C_RESET}")
        print("Penyebab: User yang sudah dibuat di Supabase Auth belum masuk ke tabel 'profiles'.")
        print("\nOpsi Penanganan:")
        print("1. Tambahkan `SUPABASE_SERVICE_ROLE_KEY` di file .env untuk auto-sync dari Supabase Auth.")
        print("2. Atau lakukan Sinkronisasi Manual untuk memasukkan data 2 user lama Anda ke tabel profil.\n")
        sync_choice = input("Apakah Anda ingin menyinkronkan user lama ke tabel profil sekarang? [y/n]: ").strip().lower()
        if sync_choice == "y":
            sync_manual_user()
        return

    print("-" * 88)
    print(f"{'NO':<4} {'NAMA LENGKAP':<30} {'ROLE':<14} {'EMAIL':<26} {'ID USER':<12}")
    print("-" * 88)
    for idx, p in enumerate(profiles, 1):
        fname = p.get("full_name") or "-"
        role = p.get("role") or "-"
        email = p.get("email") or "-"
        uid = p.get("id") or "-"
        
        r_color = C_YELLOW if role == "admin" else (C_CYAN if role == "ustadzah" else C_GREEN)
        print(f"{idx:<4} {fname[:28]:<30} {r_color}{role.upper():<14}{C_RESET} {email[:24]:<26} {uid[:10]}...")
    print("-" * 88)
    print(f"Total User: {C_BOLD}{len(profiles)}{C_RESET}\n")


def sync_manual_user():
    print(f"\n{C_BOLD}{C_GREEN}--- SINKRONISASI MANUAL USER LAMA KE PROFIL ---{C_RESET}")
    print("Masukkan informasi user yang sudah pernah dibuat di Supabase Auth:")
    email = input("Email user: ").strip().lower()
    if not email:
        return
    full_name = input("Nama Lengkap: ").strip() or email.split("@")[0]
    print("Pilih Role: 1. Admin, 2. Ustadz, 3. Ustadzah")
    r_in = input("Pilihan [1-3, default: 2]: ").strip()
    role_map = {"1": "admin", "2": "ustadz", "3": "ustadzah"}
    selected_role = role_map.get(r_in, "ustadz")

    # Prompt user password to log in and get JWT token, or service role
    password = input("Password user tersebut (untuk verifikasi token Supabase): ").strip()
    user_token = None
    user_id = None
    if password:
        login_res, _ = supabase_request("/auth/v1/token?grant_type=password", method="POST", data={"email": email, "password": password})
        if login_res and isinstance(login_res, dict):
            user_token = login_res.get("access_token")
            user_info = login_res.get("user") or {}
            user_id = user_info.get("id")

    if not user_id:
        user_id = input("ID User UUID (dari Dashboard Supabase Auth): ").strip()

    if not user_id:
        print(f"{C_RED}Gagal mendapatkan ID user.{C_RESET}")
        return

    profile_payload = {
        "id": user_id,
        "full_name": full_name,
        "role": selected_role,
        "email": email,
        "avatar_url": f"https://api.dicebear.com/7.x/bottts/svg?seed={urllib.parse.quote(full_name)}"
    }
    extra_h = {}
    if user_token:
        extra_h = {"Authorization": f"Bearer {user_token}"}
    elif SERVICE_ROLE_KEY:
        extra_h = {"apikey": SERVICE_ROLE_KEY, "Authorization": f"Bearer {SERVICE_ROLE_KEY}"}

    p_res, p_err = supabase_request("/rest/v1/profiles", method="POST", data=profile_payload, extra_headers=extra_h)
    if p_err:
        print(f"{C_RED}Gagal menyinkronkan profil: {p_err}{C_RESET}")
    else:
        print(f"{C_GREEN}{C_BOLD}✓ User '{full_name}' ({selected_role.upper()}) berhasil disinkronkan ke tabel profil!{C_RESET}\n")


# -------------------------------------------------------------
# FITUR 8: Hapus User
# -------------------------------------------------------------
def delete_user():
    print(f"\n{C_BOLD}{C_RED}=== HAPUS USER DARI DATABASE ==={C_RESET}")
    profiles, err = supabase_request("/rest/v1/profiles?select=*&order=created_at.desc")

    if err and not profiles:
        print(f"{C_RED}Gagal memuat profil: {err}{C_RESET}")
        return

    if not profiles:
        print(f"{C_YELLOW}Tidak ada user di tabel profil.{C_RESET}")
        print("Pilih opsi '7. Lihat Semua User' untuk menyinkronkan user lama Anda dari Supabase Auth terlebih dahulu.")
        return

    print("\nDaftar User yang Terdaftar:")
    print("-" * 75)
    print(f"{'NO':<4} {'NAMA LENGKAP':<30} {'ROLE':<14} {'EMAIL':<22}")
    print("-" * 75)
    for idx, p in enumerate(profiles, 1):
        name = p.get("full_name") or "-"
        role = p.get("role") or "-"
        email = p.get("email") or "-"
        print(f"{idx:<4} {name[:28]:<30} {role.upper():<14} {email[:20]:<22}")
    print("-" * 75)

    idx_in = input(f"\nMasukkan nomor user yang akan dihapus [1-{len(profiles)}] (0 untuk batal): ").strip()
    if not idx_in.isdigit() or int(idx_in) == 0 or not (1 <= int(idx_in) <= len(profiles)):
        print("Dibatalkan.")
        return

    target = profiles[int(idx_in) - 1]
    user_id = target["id"]
    name = target.get("full_name")

    confirm = input(f"{C_RED}{C_BOLD}Apakah Anda yakin ingin menghapus user '{name}'? (ketik 'YA' untuk konfirmasi): {C_RESET}").strip()
    if confirm != "YA":
        print("Dibatalkan.")
        return

    # If SERVICE_ROLE_KEY is present, delete from Supabase Auth as well
    if SERVICE_ROLE_KEY:
        admin_headers = {"apikey": SERVICE_ROLE_KEY, "Authorization": f"Bearer {SERVICE_ROLE_KEY}"}
        supabase_request(f"/auth/v1/admin/users/{user_id}", method="DELETE", extra_headers=admin_headers)

    # Delete profile
    res, err = supabase_request(f"/rest/v1/profiles?id=eq.{user_id}", method="DELETE")
    if err:
        print(f"{C_RED}Gagal menghapus profil user: {err}{C_RESET}")
    else:
        print(f"{C_GREEN}{C_BOLD}✓ User '{name}' berhasil dihapus dari database!{C_RESET}\n")


# -------------------------------------------------------------
# MAIN CLI MENU LOOP
# -------------------------------------------------------------
def main_menu():
    while True:
        print(f"""
{C_GREEN}{C_BOLD}╔═══════════════════════════════════════════════════════════════╗
║          PENGELOLA DATABASE MADRASAH DARUL ISTIQOMAH          ║
║             Sistem Administrasi Terminal & Supabase           ║
╚═══════════════════════════════════════════════════════════════╝{C_RESET}
  {C_BOLD}1.{C_RESET} Lihat Semua Santri & Status
  {C_BOLD}2.{C_RESET} Tambah & Edit Data Santri
  {C_BOLD}3.{C_RESET} Tambah Kelas Baru & Generate PIN (4 Digit)
  {C_BOLD}4.{C_RESET} Lihat Daftar Kelas
  {C_BOLD}5.{C_RESET} Backup Database ke File JSON
  {C_BOLD}6.{C_RESET} Tambah User (Admin / Ustadz / Ustadzah)
  {C_BOLD}7.{C_RESET} Lihat Semua User
  {C_BOLD}8.{C_RESET} Hapus User
  {C_BOLD}0.{C_RESET} Keluar
""")
        pilihan = input(f"{C_BOLD}Pilih menu [0-8]: {C_RESET}").strip()

        if pilihan == "1":
            list_santri()
        elif pilihan == "2":
            manage_santri()
        elif pilihan == "3":
            add_class()
        elif pilihan == "4":
            list_classes()
        elif pilihan == "5":
            backup_database()
        elif pilihan == "6":
            add_user()
        elif pilihan == "7":
            list_users()
        elif pilihan == "8":
            delete_user()
        elif pilihan == "0":
            print(f"\n{C_CYAN}Terima kasih! Sampai jumpa.{C_RESET}\n")
            sys.exit(0)
        else:
            print(f"{C_RED}Pilihan tidak dikenali. Silakan masukkan angka 0-8.{C_RESET}")

        input(f"\n{C_DIM}Tekan [Enter] untuk kembali ke menu utama...{C_RESET}")


if __name__ == "__main__":
    try:
        main_menu()
    except KeyboardInterrupt:
        print(f"\n\n{C_CYAN}Operasi dibatalkan. Keluar.{C_RESET}\n")
        sys.exit(0)
