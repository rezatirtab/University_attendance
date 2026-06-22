# Analisis Teknis: Dampak Indexing pada MongoDB

Dokumen ini menjadi panduan untuk menjelaskan secara teknis konsep-konsep
kunci yang muncul pada hasil `explain("executionStats")`, serta sebagai
template untuk analisis Anda sendiri.

## 1. COLLSCAN vs IXSCAN

### COLLSCAN (Collection Scan)

- Terjadi ketika MongoDB **tidak menemukan index yang sesuai** dengan
  query, sehingga harus memeriksa **setiap dokumen** dalam koleksi satu
  per satu.
- Ditandai dengan `winningPlan.stage = "COLLSCAN"`.
- Biaya meningkat linear terhadap jumlah dokumen dalam koleksi — semakin
  besar koleksi, semakin lambat.

### IXSCAN (Index Scan)

- Terjadi ketika MongoDB **menggunakan index B-tree** untuk menemukan
  dokumen yang relevan tanpa memeriksa seluruh koleksi.
- Ditandai dengan `winningPlan.stage = "FETCH"` dan
  `winningPlan.inputStage.stage = "IXSCAN"`.
- Biaya mendekati logaritmik terhadap jumlah dokumen, jauh lebih efisien
  untuk koleksi besar.

> _(Isi dengan contoh nyata dari hasil pengujian Anda: query mana yang
> COLLSCAN sebelum index, dan menjadi IXSCAN setelah index dibuat.)_

## 2. Documents Examined vs Keys Examined

- **totalDocsExamined**: jumlah dokumen aktual yang dibuka/dibaca oleh
  MongoDB selama eksekusi query.
- **totalKeysExamined**: jumlah entri index yang diperiksa.
- Pada COLLSCAN, `totalKeysExamined = 0` karena tidak ada index yang
  digunakan, sedangkan `totalDocsExamined` sama dengan jumlah total
  dokumen pada koleksi (atau mendekatinya).
- Pada IXSCAN yang ideal (index selektif), `totalKeysExamined` mendekati
  atau sama dengan `nReturned`, dan `totalDocsExamined` juga mendekati
  `nReturned` — artinya MongoDB hanya membuka dokumen yang benar-benar
  relevan.

> _(Isi dengan perbandingan angka aktual sebelum/sesudah index dari
> proyek Anda.)_

## 3. Execution Time

- `executionTimeMillis` adalah waktu nyata yang dibutuhkan MongoDB untuk
  menjalankan query dan mengumpulkan execution stats.
- Perlu diingat bahwa angka ini dapat dipengaruhi oleh **cache** —
  jalankan setiap query 2-3 kali dan ambil rata-rata atau nilai
  terendah yang konsisten untuk hasil yang lebih representatif.

## 4. Dampak Index (Impact of Indexing)

Jelaskan secara umum:

- Index mempercepat operasi **read** (find, sort, range query) secara
  signifikan dengan mengurangi jumlah dokumen yang harus diperiksa.
- Index sangat berguna untuk field yang sering digunakan dalam filter
  (`find`), pengurutan (`sort`), atau join logis (`$lookup`).
- Compound index efektif ketika query menyaring berdasarkan **lebih
  dari satu field** sekaligus (contoh: `student_id` + `date`), karena
  index dapat membatasi rentang pencarian pada kedua field tersebut
  sekaligus, bukan hanya satu.
- Text index memungkinkan pencarian teks yang lebih natural
  (`$text: { $search: ... }`) dibanding regex tanpa anchor, yang selalu
  memicu COLLSCAN.

## 5. Trade-Off Index (Index Trade-Offs)

Index bukan tanpa biaya. Diskusikan trade-off berikut:

- **Write Overhead**: setiap operasi `insert`, `update`, atau `delete`
  harus memperbarui seluruh index terkait, sehingga menambah index akan
  memperlambat operasi tulis.
- **Storage Overhead**: setiap index membutuhkan ruang disk tambahan
  untuk menyimpan struktur B-tree-nya sendiri.
- **Index Selectivity**: index pada field dengan kardinalitas rendah
  (sedikit nilai unik), seperti `status` (`Present`/`Absent`/`Late`),
  cenderung tidak banyak membantu karena query masih akan mengembalikan
  sebagian besar dari koleksi — query optimizer MongoDB bahkan bisa
  memilih untuk tetap melakukan COLLSCAN jika dianggap lebih efisien.
- **Index Maintenance**: terlalu banyak index pada satu koleksi dapat
  membuat query planner lebih lambat dalam memilih winning plan, dan
  meningkatkan beban memori (index harus di-load ke RAM untuk performa
  optimal).

> _(Tambahkan diskusi spesifik untuk query #9 pada proyek ini — pencarian
> berdasarkan `status` — yang sengaja tidak diberi index sebagai contoh
> low-selectivity field.)_

## 6. Rekomendasi

_(Tuliskan rekomendasi indexing untuk sistem Sistem Absensi Mahasiswa
yang sesungguhnya, berdasarkan pola query yang paling sering
digunakan dalam skenario nyata.)_
