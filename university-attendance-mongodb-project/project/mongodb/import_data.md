# Import Dataset to MongoDB

This document explains how to load the generated JSON dataset into the
`university_attendance` database using `mongoimport`.

## Prerequisites

- MongoDB Server (Community Edition) installed and running locally on `mongodb://localhost:27017`
- MongoDB Database Tools installed (`mongoimport` must be available in your PATH)
- Dataset files already generated inside the `dataset/` folder:
  - `dataset/students.json`
  - `dataset/courses.json`
  - `dataset/attendance.json`

Check that `mongoimport` is installed:

```bash
mongoimport --version
```

If it is missing, install **MongoDB Database Tools** from:
https://www.mongodb.com/try/download/database-tools

## Step 1: Create the Database and Collections

Run the schema/validation setup script first:

```bash
mongosh mongodb/create_database.js
```

This creates the `university_attendance` database with the `students`,
`courses`, and `attendance` collections (with schema validation).

## Step 2: Import Each Collection

Run the following commands from the project root folder.

### Import students (5,000 documents)

```bash
mongoimport --db university_attendance --collection students \
  --file dataset/students.json --jsonArray
```

### Import courses (100 documents)

```bash
mongoimport --db university_attendance --collection courses \
  --file dataset/courses.json --jsonArray
```

### Import attendance (95,000 documents)

The `attendance.json` file uses MongoDB Extended JSON (`{"$date": ...}`)
so that the `date` field is imported as a real BSON `Date` type. Use the
`--legacy` flag is NOT needed; default `mongoimport` understands `$date`.

```bash
mongoimport --db university_attendance --collection attendance \
  --file dataset/attendance.json --jsonArray
```

## Step 3: Verify the Import

```bash
mongosh university_attendance --eval "
  print('students: ' + db.students.countDocuments());
  print('courses: ' + db.courses.countDocuments());
  print('attendance: ' + db.attendance.countDocuments());
"
```

Expected output:

```
students: 5000
courses: 100
attendance: 95000
```

Total documents: **100,100** — satisfying the minimum 100,000 document
requirement for this benchmarking project.

## Step 4: Verify Date Type (Important for Benchmarking)

```bash
mongosh university_attendance --eval "
  const doc = db.attendance.findOne();
  print(typeof doc.date);
  print(doc.date instanceof Date);
"
```

If `date` was imported as a string instead of a `Date`, range queries in
`mongodb/queries_without_index.js` will not behave correctly. Re-import
using the `--jsonArray` flag and confirm the `$date` wrapper is present
in `attendance.json`.
