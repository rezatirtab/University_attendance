/**
 * explain_examples.js
 *
 * This file does NOT need to be executed as-is (though it can be loaded
 * with mongosh). It documents, query by query, how to run explain(),
 * what to look for, and what example output looks like BEFORE and AFTER
 * indexing. Use this as a reference while filling in
 * report/report_template.md and report/analysis_template.md.
 */

/* ===================================================================
   HOW TO RUN explain("executionStats")
=================================================================== */

// General pattern for any find() query:
//
//   db.<collection>.find(<filter>).explain("executionStats")
//
// General pattern for aggregation pipelines:
//
//   db.<collection>.explain("executionStats").aggregate([ ... ])
//
// Example:
db = db.getSiblingDB('university_attendance');

const explainResult = db.attendance.find({ student_id: 'STU02500' }).explain('executionStats');
print(JSON.stringify(explainResult.executionStats, null, 2));

/* ===================================================================
   FIELDS TO RECORD FOR EVERY QUERY
=================================================================== */
//
// From explainResult.executionStats:
//   - executionTimeMillis   -> total time taken by the query
//   - totalDocsExamined     -> number of documents scanned
//   - totalKeysExamined     -> number of index keys scanned
//   - nReturned             -> number of documents actually returned
//
// From explainResult.queryPlanner.winningPlan:
//   - stage                 -> "COLLSCAN" (full scan) or "IXSCAN" (index scan)
//   - inputStage.indexName  -> which index was used (if IXSCAN)

/* ===================================================================
   EXAMPLE OUTPUT - BEFORE INDEXING (query: find by student_id)
=================================================================== */
//
// {
//   "executionSuccess": true,
//   "nReturned": 19,
//   "executionTimeMillis": 42,
//   "totalKeysExamined": 0,
//   "totalDocsExamined": 95000,
//   "executionStages": {
//     "stage": "COLLSCAN",
//     "filter": { "student_id": { "$eq": "STU02500" } },
//     "nReturned": 19,
//     "docsExamined": 95000
//   }
// }
//
// winningPlan.stage = "COLLSCAN"
// Interpretation: MongoDB scanned ALL 95,000 attendance documents just to
// find 19 matching records. This is highly inefficient at scale.

/* ===================================================================
   EXAMPLE OUTPUT - AFTER INDEXING (same query, with idx_attendance_student_id)
=================================================================== */
//
// {
//   "executionSuccess": true,
//   "nReturned": 19,
//   "executionTimeMillis": 1,
//   "totalKeysExamined": 19,
//   "totalDocsExamined": 19,
//   "executionStages": {
//     "stage": "FETCH",
//     "inputStage": {
//       "stage": "IXSCAN",
//       "indexName": "idx_attendance_student_id",
//       "nReturned": 19,
//       "keysExamined": 19
//     }
//   }
// }
//
// winningPlan.stage = "FETCH" with inputStage.stage = "IXSCAN"
// Interpretation: MongoDB used the index to jump directly to the 19
// matching keys, then fetched only those 19 documents. totalDocsExamined
// dropped from 95,000 to 19 — a dramatic improvement.

/* ===================================================================
   EXAMPLE OUTPUT - COMPOUND INDEX (student_id + date range)
=================================================================== */
//
// db.attendance.find({
//   student_id: "STU02500",
//   date: { $gte: ISODate("2024-06-01"), $lte: ISODate("2024-06-30") }
// }).explain("executionStats")
//
// AFTER creating idx_attendance_student_date ({ student_id: 1, date: 1 }):
//
// winningPlan.stage        = "FETCH"
// winningPlan.inputStage   = "IXSCAN"
// indexName                = "idx_attendance_student_date"
// totalKeysExamined        = totalDocsExamined = nReturned (tight index bounds)
//
// This demonstrates why compound indexes matter: a single-field index on
// student_id alone would still need to scan all of that student's records
// to filter by date, while the compound index narrows down both
// conditions directly using index bounds.

/* ===================================================================
   EXAMPLE OUTPUT - TEXT INDEX (name search)
=================================================================== */
//
// db.students.find({ $text: { $search: "John" } }).explain("executionStats")
//
// winningPlan.stage      = "TEXT"
// winningPlan.indexName  = "idx_students_name_text"
//
// Compare against the regex-based query used before indexing:
// db.students.find({ name: /John/ }) -> always COLLSCAN, because regex
// queries without a leading anchor (^) cannot use a standard B-tree index
// efficiently. This is a key discussion point for analysis.md.

/* ===================================================================
   QUERY WITHOUT A SUPPORTING INDEX (status field)
=================================================================== */
//
// db.attendance.find({ status: "Present" }).explain("executionStats")
//
// Even AFTER running create_indexes.js, this remains a COLLSCAN because
// no index was created on "status". This is intentional: "status" has
// only 3 possible values (Present/Absent/Late), so it has low
// selectivity (cardinality) and indexing it would scan a large fraction
// of the index anyway. Use this as a discussion point for "Trade Off
// Index" in analysis_template.md.
