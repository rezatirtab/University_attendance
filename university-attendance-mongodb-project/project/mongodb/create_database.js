/**
 * create_database.js
 *
 * Run with: mongosh mongodb/create_database.js
 *
 * Creates the "university_attendance" database and the three
 * collections used in this benchmarking project, with basic
 * schema validation to keep the dataset consistent.
 */

const dbName = 'university_attendance';

db = db.getSiblingDB(dbName);

// Drop existing collections if re-running this script for a clean slate
db.students.drop();
db.courses.drop();
db.attendance.drop();

db.createCollection('students', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['student_id', 'name', 'email', 'major', 'semester'],
      properties: {
        student_id: { bsonType: 'string' },
        name: { bsonType: 'string' },
        email: { bsonType: 'string' },
        major: { bsonType: 'string' },
        semester: { bsonType: 'int' }
      }
    }
  }
});

db.createCollection('courses', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['course_id', 'course_name', 'lecturer', 'credits'],
      properties: {
        course_id: { bsonType: 'string' },
        course_name: { bsonType: 'string' },
        lecturer: { bsonType: 'string' },
        credits: { bsonType: 'int' }
      }
    }
  }
});

db.createCollection('attendance', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['attendance_id', 'student_id', 'course_id', 'date', 'status'],
      properties: {
        attendance_id: { bsonType: 'string' },
        student_id: { bsonType: 'string' },
        course_id: { bsonType: 'string' },
        date: { bsonType: 'date' },
        status: { enum: ['Present', 'Absent', 'Late'] }
      }
    }
  }
});

print(`Database "${dbName}" and collections created successfully.`);
print('Collections: students, courses, attendance');
