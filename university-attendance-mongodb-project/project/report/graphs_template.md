# Visualisasi Hasil Benchmarking

Folder ini menjelaskan cara membuat 3 grafik perbandingan performa
query sebelum dan sesudah indexing, menggunakan Python + matplotlib.

## 1. Persiapan

Install dependency:

```bash
pip install matplotlib
```

## 2. Isi Data Hasil Pengujian

Edit file `generate_graphs.py` pada bagian `DATA` di bagian atas script,
isi dengan angka aktual hasil dari:

- `mongodb/queries_without_index.js` (kolom `before`)
- `mongodb/queries_after_index.js` (kolom `after`)

## 3. Jalankan Script

```bash
python generate_graphs.py
```

Script akan menghasilkan 3 file gambar di folder `screenshots/`:

1. `query_time_before_after.png` — Query Time Before vs After Index
2. `docs_examined_before_after.png` — Documents Examined Before vs After
3. `execution_time_per_query.png` — Execution Time Per Query (line chart)

## 4. Sertakan ke Laporan

Sisipkan ketiga gambar ini ke dalam `report/report_template.md` (bagian
Results) sebagai bukti visual dampak indexing.
