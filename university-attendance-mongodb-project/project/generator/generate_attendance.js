/**
 * generate_attendance.js
 * Generates 95000 attendance documents for the "attendance" collection.
 * Reads students.json and courses.json to keep foreign keys valid.
 * Output: ../dataset/attendance.json
 *
 * Dates are written using MongoDB Extended JSON ($date) so that
 * mongoimport stores the "date" field as a real BSON Date type.
 */

const fs = require('fs');
const path = require('path');
const { faker } = require('@faker-js/faker');

const TOTAL_ATTENDANCE = 95000;
const STATUS_OPTIONS = ['Present', 'Absent', 'Late'];

// Weighted status so data looks realistic (mostly present)
const STATUS_WEIGHTS = [
  { value: 'Present', weight: 0.75 },
  { value: 'Absent', weight: 0.15 },
  { value: 'Late', weight: 0.10 }
];

function weightedStatus() {
  return faker.helpers.weightedArrayElement(STATUS_WEIGHTS);
}

function loadJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function randomDateWithinRange(start, end) {
  return faker.date.between({ from: start, to: end });
}

function generateAttendance(total, students, courses) {
  const attendance = [];
  const rangeStart = new Date('2024-01-01T00:00:00.000Z');
  const rangeEnd = new Date('2024-12-31T23:59:59.000Z');

  for (let i = 1; i <= total; i++) {
    const attendanceId = `ATT${String(i).padStart(6, '0')}`;
    const student = faker.helpers.arrayElement(students);
    const course = faker.helpers.arrayElement(courses);
    const date = randomDateWithinRange(rangeStart, rangeEnd);

    attendance.push({
      attendance_id: attendanceId,
      student_id: student.student_id,
      course_id: course.course_id,
      date: { $date: date.toISOString() },
      status: weightedStatus()
    });

    if (i % 10000 === 0) {
      console.log(`  ...generated ${i}/${total} attendance records`);
    }
  }
  return attendance;
}

function main() {
  const datasetDir = path.join(__dirname, '..', 'dataset');
  const studentsPath = path.join(datasetDir, 'students.json');
  const coursesPath = path.join(datasetDir, 'courses.json');

  if (!fs.existsSync(studentsPath) || !fs.existsSync(coursesPath)) {
    console.error(
      'students.json or courses.json not found. Run generate_students.js and generate_courses.js first.'
    );
    process.exit(1);
  }

  const students = loadJson(studentsPath);
  const courses = loadJson(coursesPath);

  console.log(`Loaded ${students.length} students and ${courses.length} courses.`);
  console.log(`Generating ${TOTAL_ATTENDANCE} attendance records...`);

  const attendance = generateAttendance(TOTAL_ATTENDANCE, students, courses);

  const outputPath = path.join(datasetDir, 'attendance.json');
  fs.writeFileSync(outputPath, JSON.stringify(attendance, null, 2));

  console.log(`Generated ${attendance.length} attendance records -> ${outputPath}`);
}

main();
