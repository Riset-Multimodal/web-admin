import os
import json
import hashlib
import psycopg2
from psycopg2 import Error

# --- KONFIGURASI ---
# Ganti dengan detail koneksi database PostgreSQL Anda
DB_CONFIG = {
    'dbname': 'riset_db',
    'user': 'postgres',
    'password': '123',
    'host': 'proxy.bccdev.id',
    'port': '11015'  # Port default PostgreSQL
}

ROOT_DATA_PATH = './data_keylog'
# --- AKHIR KONFIGURASI ---


def create_db_connection():
    # Fungsi ini tetap sama
    connection = None
    try:
        connection = psycopg2.connect(**DB_CONFIG)
        print("Koneksi ke database PostgreSQL berhasil")
    except Error as e:
        print(f"Error saat koneksi ke PostgreSQL: {e}")
    return connection

def insert_user(cursor, user_email):
    # Fungsi ini sudah benar, tidak perlu diubah
    try:
        query = "INSERT INTO public.users (user_email) VALUES (%s) ON CONFLICT (user_email) DO NOTHING;"
        cursor.execute(query, (user_email,))
        return True
    except Error as e:
        print(f"Error saat memasukkan user {user_email}: {e}")
        return False

def insert_keylog_entry(cursor, user_email, data_dict):
    """
    Memasukkan satu baris data keylog dari struktur JSON yang nested.
    """
    try:
        # --- PERBAIKAN UTAMA ADA DI SINI ---
        # Kita sekarang mengakses dictionary yang ada di dalam kunci 'features'.
        features_data = data_dict['features']

        query = """
            INSERT INTO public.keylog (
                created_at, user_email, keystroke_count, left_click_count, right_click_count,
                scroll_up, scroll_down, space_count, error_rate,
                mean_dwell_time_ms, std_dev_dwell_time_ms,
                mean_flight_time_ms, std_dev_flight_time_ms,
                mean_digraph_time_ms, std_dev_digraph_time_ms,
                pause_count, mean_pause_duration_ms, mean_burst_length, type
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s
            );
        """
        
        # Sekarang kita mengambil nilai dari 'features_data' bukan 'data_dict'
        values = (
            features_data.get('timestamp', None),
            user_email,
            features_data.get('keystroke_count', 0),
            features_data.get('left_click_count', 0),
            features_data.get('right_click_count', 0),
            features_data.get('scroll_up', 0),
            features_data.get('scroll_down', 0),
            features_data.get('space_count', 0),
            features_data.get('error_rate', 0),
            features_data.get('mean_dwell_time_ms', 0),
            features_data.get('std_dev_dwell_time_ms', 0),
            features_data.get('mean_flight_time_ms', 0),
            features_data.get('std_dev_flight_time_ms', 0),
            features_data.get('mean_digraph_time_ms', 0),
            features_data.get('std_dev_digraph_time_ms', 0),
            features_data.get('pause_count', 0),
            features_data.get('mean_pause_duration_ms', 0),
            features_data.get('mean_burst_length', 0),
            features_data.get('type', None)
        )
        cursor.execute(query, values)
        return True
        
    except KeyError:
        # Error ini akan muncul jika struktur JSON tidak memiliki kunci 'features'
        print(f"[ERROR] Struktur data tidak valid. Kunci 'features' tidak ditemukan di: {data_dict}")
        return False
    except Error as e:
        print(f"Error database saat INSERT: {e}")
        return False


def process_files():
    """Fungsi utama untuk memproses semua folder dan file."""
    connection = create_db_connection()
    if connection is None:
        return

    try:
        with connection.cursor() as cursor:
            for dir_name in os.listdir(ROOT_DATA_PATH):
                if not dir_name.endswith('_keylogger'):
                    continue

                user_email = dir_name.replace('_keylogger', '')
                print(f"\n--- Memproses Pengguna: {user_email} ---")
                
                insert_user(cursor, user_email)
                
                user_dir_path = os.path.join(ROOT_DATA_PATH, dir_name)
                keylog_inserted_count = 0

                for filename in os.listdir(user_dir_path):
                    if not filename.endswith('.jsonl'):
                        continue
                    
                    file_path = os.path.join(user_dir_path, filename)
                    print(f"  Membaca file: {filename}")
                    
                    with open(file_path, 'r', encoding='utf-8') as f:
                        for line_num, line in enumerate(f, 1):
                            try:
                                log_entry = json.loads(line)
                                if insert_keylog_entry(cursor, user_email, log_entry):
                                    keylog_inserted_count += 1
                                
                            except json.JSONDecodeError:
                                print(f"    [PERINGATAN] Melewati baris {line_num} karena bukan format JSON yang valid.")
                
                print(f"  Berhasil memasukkan {keylog_inserted_count} data keylog.")

        connection.commit()
        print("\nSemua data berhasil diproses dan dimasukkan ke database.")

    except (Exception, Error) as e:
        print(f"Terjadi kesalahan: {e}")
        connection.rollback()
    finally:
        if connection:
            connection.close()
            print("Koneksi database ditutup.")


if __name__ == '__main__':
    process_files()