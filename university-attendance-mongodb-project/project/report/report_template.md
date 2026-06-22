# Report: Benchmarking dan Optimasi Performa MongoDB Menggunakan Indexing

**Nama Mahasiswa:** _(isi nama Anda)_
**NIM:** _(isi NIM Anda)_
**Mata Kuliah:** Basis Data Lanjut / Sistem Basis Data NoSQL
**Tanggal:** _(isi tanggal)_

## 1. Pendahuluan

Proyek ini bertujuan untuk menganalisis dampak indexing terhadap performa
query pada MongoDB, menggunakan studi kasus Sistem Absensi Mahasiswa
(`university_attendance`). Total dataset yang digunakan berjumlah
**100.100 dokumen**, terdiri dari:

| Koleksi    | Jumlah Dokumen |
|------------|---------------:|
| students   | 5,000          |
| courses    | 100            |
| attendance | 95,000         |
| **Total**  | **100,100**    |

## 2. Lingkungan Pengujian

| Komponen        | Spesifikasi |
|-----------------|-------------|
| MongoDB Version | _(isi, contoh: 7.0.x)_ |
| OS              | _(isi, contoh: Ubuntu 22.04 / Windows 11)_ |
| RAM             | _(isi)_ |
| CPU             | _(isi)_ |
| Storage         | _(isi, SSD/HDD)_ |

## 3. Hasil Pengujian SEBELUM Indexing

> Jalankan `mongodb/queries_without_index.js` lalu salin hasilnya ke tabel
> di bawah ini.

| No | Query                                    | executionTimeMillis | totalDocsExamined | totalKeysExamined | winningPlan.stage |
|----|-------------------------------------------|---------------------:|-------------------:|--------------------:|--------------------|
| 1  | Find student by student_id               |                       |                     |                      |                    |
| 2  | Find student by email                     |                       |                     |                      |                    |
| 3  | Find student by name (regex)              |                       |                     |                      |                    |
| 4  | Find attendance by student_id             |                       |                     |                      |                    |
| 5  | Find attendance by course_id              |                       |                     |                      |                    |
| 6  | Find attendance by exact date             |                       |                     |                      |                    |
| 7  | Find attendance within date range         |                       |                     |                      |                    |
| 8  | Count students per major (aggregation)    |                       |                     |                      |                    |
| 9  | Count attendance with status = Present    |                       |                     |                      |                    |
| 10 | Top 10 courses by attendance count        |                       |                     |                      |                    |

## 4. Index yang Dibuat

### 4.1 Single Field Index (5)

1. `students.student_id`
2. `students.email`
3. `students.name`
4. `attendance.student_id`
5. `attendance.date`

### 4.2 Compound Index (3)

1. `attendance.student_id + date`
2. `attendance.course_id + date`
3. `students.major + semester`

### 4.3 Text Index (1)

1. `students.name` (text index)

> Lihat `mongodb/create_indexes.js` untuk implementasi lengkap.

## 5. Hasil Pengujian SETELAH Indexing

> Jalankan `mongodb/queries_after_index.js` lalu salin hasilnya ke tabel
> di bawah ini.

| No | Query                                    | executionTimeMillis | totalDocsExamined | totalKeysExamined | winningPlan.stage |
|----|-------------------------------------------|---------------------:|-------------------:|--------------------:|--------------------|
| 1  | Find student by student_id               |                       |                     |                      |                    |
| 2  | Find student by email                     |                       |                     |                      |                    |
| 3  | Find student by name ($text)              |                       |                     |                      |                    |
| 4  | Find attendance by student_id             |                       |                     |                      |                    |
| 5  | Find attendance by course_id              |                       |                     |                      |                    |
| 6  | Find attendance by exact date             |                       |                     |                      |                    |
| 7  | Find attendance within date range         |                       |                     |                      |                    |
| 8  | Count students per major (aggregation)    |                       |                     |                      |                    |
| 9  | Count attendance with status = Present    |                       |                     |                      |                    |
| 10 | Top 10 courses by attendance count        |                       |                     |                      |                    |

## 6. Perbandingan Singkat

> Hitung persentase peningkatan performa untuk setiap query, contoh:
> `(before - after) / before * 100%`

| No | Query | Peningkatan Execution Time | Penurunan Docs Examined |
|----|-------|----------------------------:|--------------------------:|
| 1  |       |                              |                            |
| ...|       |                              |                            |

## 7. Kesimpulan

_(Tuliskan kesimpulan umum: index mana yang paling berdampak, query mana
yang tidak banyak terbantu, dan rekomendasi indexing untuk sistem
produksi serupa.)_

## 8. Lampiran

- Lihat `report/analysis_template.md` untuk analisis teknis mendalam.
- Lihat `report/graphs_template.md` dan folder `screenshots/` untuk
  visualisasi hasil benchmarking.
