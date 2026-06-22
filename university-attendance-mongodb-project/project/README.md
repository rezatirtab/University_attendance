# Benchmarking dan Optimasi Performa MongoDB Menggunakan Indexing

## Studi Kasus: Sistem Absensi Mahasiswa (University Attendance System)

Proyek ini dibuat untuk memenuhi tugas kuliah **"Benchmarking dan
Optimasi Performa MongoDB Menggunakan Indexing"**. Proyek ini
mendemonstrasikan dampak nyata dari indexing pada MongoDB melalui studi
kasus Sistem Absensi Mahasiswa, dengan dataset berskala lebih dari
100.000 dokumen.

## 1. Project Description

Sistem Absensi Mahasiswa menyimpan data mahasiswa, mata kuliah, dan
catatan kehadiran (absensi) harian. Proyek ini membandingkan performa
10 query nyata **sebelum** dan **sesudah** pembuatan index, menggunakan
`explain("executionStats")` sebagai alat ukur, lalu menyajikan hasilnya
dalam bentuk laporan dan visualisasi grafik.

## 2. Database Design

**Nama Database:** `university_attendance`

```
students  ──┐
            ├──< attendance >──┐
courses   ──┘                  │
                          (student_id, course_id sebagai foreign key logis)
```

Relasi antar koleksi bersifat logis (tidak ada foreign key constraint
bawaan di MongoDB) — `attendance.student_id` mengacu ke
`students.student_id`, dan `attendance.course_id` mengacu ke
`courses.course_id`.

## 3. Collections

### `students`

| Field      | Type   | Keterangan                  |
|------------|--------|------------------------------|
| student_id | String | Identifier unik mahasiswa    |
| name       | String | Nama lengkap                 |
| email      | String | Email unik                   |
| major      | String | Jurusan                      |
| semester   | Number | Semester berjalan (1-8)      |

### `courses`

| Field        | Type   | Keterangan              |
|--------------|--------|---------------------------|
| course_id    | String | Identifier unik mata kuliah |
| course_name  | String | Nama mata kuliah          |
| lecturer     | String | Nama dosen pengajar       |
| credits      | Number | Jumlah SKS (2-4)          |

### `attendance`

| Field          | Type   | Keterangan                              |
|----------------|--------|--------------------------------------------|
| attendance_id  | String | Identifier unik record absensi            |
| student_id     | String | Referensi ke `students.student_id`        |
| course_id      | String | Referensi ke `courses.course_id`          |
| date           | Date   | Tanggal absensi                           |
| status         | String | `Present`, `Absent`, atau `Late`          |

## 4. Dataset Information

| Koleksi    | Jumlah Dokumen |
|------------|---------------:|
| students   | 5,000          |
| courses    | 100            |
| attendance | 95,000         |
| **Total**  | **100,100**    |

Dataset dihasilkan secara otomatis menggunakan **Node.js + Faker**
(`@faker-js/faker`), dengan relasi `student_id` dan `course_id` pada
koleksi `attendance` dijamin valid karena diambil langsung dari data
`students.json` dan `courses.json` yang telah digenerate sebelumnya.

## 5. Folder Structure

```
project/
│
├── dataset/                     # Output JSON dataset (digenerate, lihat .gitignore)
│   ├── students.json
│   ├── courses.json
│   └── attendance.json
│
├── generator/                   # Script Node.js + Faker untuk generate dataset
│   ├── generate_students.js
│   ├── generate_courses.js
│   ├── generate_attendance.js
│   └── package.json
│
├── mongodb/                      # Script MongoDB untuk setup, query, dan index
│   ├── create_database.js
│   ├── import_data.md
│   ├── queries_without_index.js
│   ├── create_indexes.js
│   ├── queries_after_index.js
│   └── explain_examples.js
│
├── report/                       # Template laporan, analisis, dan visualisasi
│   ├── report_template.md
│   ├── analysis_template.md
│   ├── graphs_template.md
│   └── generate_graphs.py
│
├── screenshots/                  # Tempat menyimpan hasil grafik & screenshot explain()
│
├── README.md
└── .gitignore
```

## 6. Installation

### Prasyarat

- [Node.js](https://nodejs.org/) v18+ dan npm
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) (lokal atau Atlas)
- [MongoDB Database Tools](https://www.mongodb.com/try/download/database-tools) (`mongoimport`, `mongosh`)
- [Python](https://www.python.org/) 3.8+ dengan `matplotlib` (untuk visualisasi)

### Clone & Install Dependencies

```bash
git clone <repo-url>
cd project/generator
npm install
```

## 7. MongoDB Setup

Pastikan `mongod` berjalan secara lokal (default `mongodb://localhost:27017`),
lalu buat database dan koleksi beserta validasi schema:

```bash
mongosh mongodb/create_database.js
```

## 8. Data Generation

Dari dalam folder `generator/`, jalankan generator secara berurutan
(courses dan students harus dibuat terlebih dahulu karena attendance
bergantung pada keduanya):

```bash
cd generator
npm run generate:courses
npm run generate:students
npm run generate:attendance

# atau jalankan ketiganya sekaligus:
npm run generate:all
```

File hasil generate akan tersimpan otomatis di folder `dataset/`.

## 9. Import Dataset

Lihat instruksi lengkap di [`mongodb/import_data.md`](mongodb/import_data.md).
Ringkasan:

```bash
mongoimport --db university_attendance --collection students  --file dataset/students.json   --jsonArray
mongoimport --db university_attendance --collection courses   --file dataset/courses.json    --jsonArray
mongoimport --db university_attendance --collection attendance --file dataset/attendance.json --jsonArray
```

Verifikasi jumlah dokumen:

```bash
mongosh university_attendance --eval "
  print('students: ' + db.students.countDocuments());
  print('courses: ' + db.courses.countDocuments());
  print('attendance: ' + db.attendance.countDocuments());
"
```

## 10. Query Benchmarking

### Langkah 1 — Baseline (sebelum index)

```bash
mongosh mongodb/queries_without_index.js
```

Catat seluruh `executionTimeMillis`, `totalDocsExamined`,
`totalKeysExamined`, dan `winningPlan.stage` ke
[`report/report_template.md`](report/report_template.md).

### Langkah 2 — Buat Index

```bash
mongosh mongodb/create_indexes.js
```

### Langkah 3 — Uji Ulang (setelah index)

```bash
mongosh mongodb/queries_after_index.js
```

Catat kembali metriknya, lalu bandingkan dengan hasil sebelumnya.

> Lihat [`mongodb/explain_examples.js`](mongodb/explain_examples.js) untuk
> contoh format output `explain()` sebelum dan sesudah indexing.

## 11. Indexing

Total 9 index dibuat melalui `mongodb/create_indexes.js`:

**5 Single Field Index**
- `students.student_id`
- `students.email`
- `students.name`
- `attendance.student_id`
- `attendance.date`

**3 Compound Index**
- `attendance.student_id + date`
- `attendance.course_id + date`
- `students.major + semester`

**1 Text Index**
- `students.name` (text search)

## 12. Results

Setelah menjalankan kedua skrip query (sebelum & sesudah index), buat
visualisasi grafik dengan Python:

```bash
cd report
pip install matplotlib
python generate_graphs.py
```

Grafik berikut akan dihasilkan di folder `screenshots/`:

1. **Query Time Before vs After Index** — `query_time_before_after.png`
2. **Documents Examined Before vs After** — `docs_examined_before_after.png`
3. **Execution Time Per Query** — `execution_time_per_query.png`

Lengkapi analisis teknis pada
[`report/analysis_template.md`](report/analysis_template.md), yang
mencakup pembahasan COLLSCAN vs IXSCAN, Documents/Keys Examined,
Execution Time, Dampak Index, dan Trade-Off Index.

## 13. Ringkasan Query yang Diuji

| No | Query                                              |
|----|------------------------------------------------------|
| 1  | Cari mahasiswa berdasarkan `student_id`               |
| 2  | Cari mahasiswa berdasarkan `email`                    |
| 3  | Cari mahasiswa berdasarkan `name`                     |
| 4  | Cari absensi berdasarkan `student_id`                 |
| 5  | Cari absensi berdasarkan `course_id`                  |
| 6  | Cari absensi berdasarkan tanggal tertentu              |
| 7  | Cari absensi dalam rentang tanggal                     |
| 8  | Hitung jumlah mahasiswa per jurusan                    |
| 9  | Hitung jumlah kehadiran berdasarkan status              |
| 10 | Top 10 mata kuliah dengan absensi terbanyak            |

## 14. Lisensi

Proyek ini dibuat untuk keperluan akademik/tugas kuliah dan dapat
digunakan secara bebas untuk tujuan pembelajaran.
