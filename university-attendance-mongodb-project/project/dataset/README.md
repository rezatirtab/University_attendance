# Dataset Folder

File JSON di folder ini (`students.json`, `courses.json`, `attendance.json`)
**digenerate otomatis** menggunakan script di folder `generator/` dan
**tidak disertakan dalam Git repository** (lihat `.gitignore`) karena
ukurannya besar (95,000+ dokumen).

Untuk membuatnya, jalankan:

```bash
cd generator
npm install
npm run generate:all
```

File JSON akan muncul di folder ini secara otomatis.
