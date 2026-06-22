/**
 * generate_courses.js
 * Generates 100 course documents for the "courses" collection.
 * Output: ../dataset/courses.json
 */

const fs = require('fs');
const path = require('path');
const { faker } = require('@faker-js/faker');

const TOTAL_COURSES = 100;

const subjects = [
  'Algorithms', 'Data Structures', 'Database Systems', 'Operating Systems',
  'Computer Networks', 'Software Engineering', 'Artificial Intelligence',
  'Machine Learning', 'Web Development', 'Mobile Programming',
  'Computer Architecture', 'Discrete Mathematics', 'Linear Algebra',
  'Statistics', 'Calculus', 'Information Systems', 'Cyber Security',
  'Cloud Computing', 'Distributed Systems', 'Human Computer Interaction',
  'Compiler Design', 'Theory of Computation', 'Data Mining', 'Big Data',
  'Computer Graphics', 'Digital Image Processing', 'Embedded Systems',
  'Internet of Things', 'Parallel Computing', 'Cryptography'
];

function generateCourses(total) {
  const courses = [];
  for (let i = 1; i <= total; i++) {
    const courseId = `CRS${String(i).padStart(4, '0')}`;
    const subject = subjects[i % subjects.length];
    const section = String.fromCharCode(65 + (i % 4)); // A-D
    courses.push({
      course_id: courseId,
      course_name: `${subject} ${section}`,
      lecturer: faker.person.fullName(),
      credits: faker.number.int({ min: 2, max: 4 })
    });
  }
  return courses;
}

function main() {
  const courses = generateCourses(TOTAL_COURSES);
  const outputDir = path.join(__dirname, '..', 'dataset');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, 'courses.json');
  fs.writeFileSync(outputPath, JSON.stringify(courses, null, 2));

  console.log(`Generated ${courses.length} courses -> ${outputPath}`);
}

main();
