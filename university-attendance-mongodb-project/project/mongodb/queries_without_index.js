/**
 * queries_without_index.js
 *
 * Run with: mongosh mongodb/queries_without_index.js
 *
 * Executes the 10 benchmark queries BEFORE any index (other than the
 * default _id index) is created. Each query prints its
 * executionTimeMillis, totalDocsExamined, and the stage of the
 * winningPlan so you can compare against the post-index results.
 *
 * IMPORTANT: Run mongodb/create_indexes.js LATER, not before this file,
 * to get a true "before indexing" baseline.
 */

db = db.getSiblingDB('university_attendance');

function runExplain(label, collection, query, options = {}) {
  print('\n=================================================');
  print('QUERY: ' + label);
  print('=================================================');
  print('Filter: ' + JSON.stringify(query));

  let cursor = db[collection].find(query);
  if (options.sort) cursor = cursor.sort(options.sort);
  if (options.limit) cursor = cursor.limit(options.limit);

  const explain = cursor.explain('executionStats');
  const stats = explain.executionStats;
  const winningPlan = explain.queryPlanner.winningPlan;

  print('executionTimeMillis : ' + stats.executionTimeMillis);
  print('totalDocsExamined   : ' + stats.totalDocsExamined);
  print('totalKeysExamined   : ' + stats.totalKeysExamined);
  print('nReturned           : ' + stats.nReturned);
  print('winningPlan.stage   : ' + winningPlan.stage);
  print('winningPlan (raw)   : ' + JSON.stringify(winningPlan));

  return stats;
}

// 1. Cari mahasiswa berdasarkan student_id
runExplain('1. Find student by student_id', 'students', { student_id: 'STU02500' });

// 2. Cari mahasiswa berdasarkan email
runExplain('2. Find student by email', 'students', { email: 'jane.doe.123@university.ac.id' });

// 3. Cari mahasiswa berdasarkan nama
runExplain('3. Find student by name', 'students', { name: /John/ });

// 4. Cari absensi berdasarkan student_id
runExplain('4. Find attendance by student_id', 'attendance', { student_id: 'STU02500' });

// 5. Cari absensi berdasarkan course_id
runExplain('5. Find attendance by course_id', 'attendance', { course_id: 'CRS0050' });

// 6. Cari absensi berdasarkan tanggal
runExplain('6. Find attendance by exact date', 'attendance', {
  date: new Date('2024-06-15T00:00:00.000Z')
});

// 7. Cari absensi dalam rentang tanggal
runExplain('7. Find attendance within date range', 'attendance', {
  date: {
    $gte: new Date('2024-06-01T00:00:00.000Z'),
    $lte: new Date('2024-06-30T23:59:59.000Z')
  }
});

// 8. Hitung jumlah mahasiswa per jurusan (aggregation)
print('\n=================================================');
print('QUERY: 8. Count students per major (aggregation)');
print('=================================================');
const agg8 = db.students.aggregate([
  { $group: { _id: '$major', total: { $sum: 1 } } },
  { $sort: { total: -1 } }
], { explain: false });
print(JSON.stringify(agg8.toArray(), null, 2));
const agg8explain = db.students.explain('executionStats').aggregate([
  { $group: { _id: '$major', total: { $sum: 1 } } },
  { $sort: { total: -1 } }
]);
print('executionTimeMillisEstimate: ' + JSON.stringify(agg8explain.stages ? agg8explain.stages[0] : agg8explain));

// 9. Hitung jumlah kehadiran (status = Present)
runExplain('9. Count attendance with status Present', 'attendance', { status: 'Present' });

// 10. Top 10 mata kuliah dengan absensi terbanyak
print('\n=================================================');
print('QUERY: 10. Top 10 courses by attendance count');
print('=================================================');
const top10 = db.attendance.aggregate([
  { $group: { _id: '$course_id', total: { $sum: 1 } } },
  { $sort: { total: -1 } },
  { $limit: 10 }
]);
print(JSON.stringify(top10.toArray(), null, 2));

print('\nDone. Record all the metrics above into report/report_template.md (BEFORE INDEX section).');
