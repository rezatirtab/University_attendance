/**
 * create_indexes.js
 *
 * Run with: mongosh mongodb/create_indexes.js
 *
 * Creates all indexes required for this benchmarking project:
 *  - 5 single field indexes
 *  - 3 compound indexes
 *  - 1 text index
 */

db = db.getSiblingDB('university_attendance');

print('Creating single field indexes...');

db.students.createIndex({ student_id: 1 }, { name: 'idx_students_student_id' });
db.students.createIndex({ email: 1 }, { name: 'idx_students_email' });
db.students.createIndex({ name: 1 }, { name: 'idx_students_name' });
db.attendance.createIndex({ student_id: 1 }, { name: 'idx_attendance_student_id' });
db.attendance.createIndex({ date: 1 }, { name: 'idx_attendance_date' });

print('Creating compound indexes...');

db.attendance.createIndex(
  { student_id: 1, date: 1 },
  { name: 'idx_attendance_student_date' }
);
db.attendance.createIndex(
  { course_id: 1, date: 1 },
  { name: 'idx_attendance_course_date' }
);
db.students.createIndex(
  { major: 1, semester: 1 },
  { name: 'idx_students_major_semester' }
);

print('Creating text index...');

db.students.createIndex({ name: 'text' }, { name: 'idx_students_name_text' });

print('\nAll indexes created. Current indexes:');

print('\n--- students indexes ---');
db.students.getIndexes().forEach(idx => print(JSON.stringify(idx)));

print('\n--- attendance indexes ---');
db.attendance.getIndexes().forEach(idx => print(JSON.stringify(idx)));

print('\n--- courses indexes ---');
db.courses.getIndexes().forEach(idx => print(JSON.stringify(idx)));
