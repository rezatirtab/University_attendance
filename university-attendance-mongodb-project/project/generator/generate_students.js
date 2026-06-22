/**
 * generate_students.js
 * Generates 5000 student documents for the "students" collection.
 * Output: ../dataset/students.json
 */

const fs = require('fs');
const path = require('path');
const { faker } = require('@faker-js/faker');

const TOTAL_STUDENTS = 5000;

const majors = [
  'Computer Science', 'Information Systems', 'Software Engineering',
  'Information Technology', 'Data Science', 'Computer Engineering',
  'Electrical Engineering', 'Business Administration', 'Accounting',
  'Mathematics'
];

function generateStudents(total) {
  const students = [];
  const usedEmails = new Set();

  for (let i = 1; i <= total; i++) {
    const studentId = `STU${String(i).padStart(5, '0')}`;
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const name = `${firstName} ${lastName}`;

    // Ensure unique email by appending the student index
    let email = faker.internet
      .email({ firstName, lastName, provider: 'university.ac.id' })
      .toLowerCase();
    if (usedEmails.has(email)) {
      email = `${firstName}.${lastName}.${i}@university.ac.id`.toLowerCase();
    }
    usedEmails.add(email);

    students.push({
      student_id: studentId,
      name,
      email,
      major: faker.helpers.arrayElement(majors),
      semester: faker.number.int({ min: 1, max: 8 })
    });
  }
  return students;
}

function main() {
  const students = generateStudents(TOTAL_STUDENTS);
  const outputDir = path.join(__dirname, '..', 'dataset');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, 'students.json');
  fs.writeFileSync(outputPath, JSON.stringify(students, null, 2));

  console.log(`Generated ${students.length} students -> ${outputPath}`);
}

main();
