const StudentDB = require('./StudentDB');
const ClassroomDB = require('../classroom/ClassroomDB');
const SchoolDB = require('../school/SchoolDB');
module.exports = class Student {

    constructor({ utils, cache, config, cortex, managers, validators, mongomodels } = {}) {
        this.config = config;
        this.cortex = cortex;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.tokenManager = managers.token;
        this.studentCollection = "students";
        this.userExposed = ['createStudent'];
        this.httpExposed = ['post=createStudent', 'get=getStudents', 'put=updateStudent', 'delete=deleteStudent'];
        this.cache = cache;
        this.dataBase = new StudentDB(this.mongomodels.Student);
        this.schoolDB = new SchoolDB(this.mongomodels.School);
        this.classroomDB = new ClassroomDB(this.mongomodels.Classroom);
    }
    
    async createStudent({ name, schoolName, classroomName }) {
        console.log('-------------------createStudent-------------------');
        
        try {
            // Find the school by name
            const school = await this.schoolDB.findSchools({ name: schoolName });
            if (!school || school.length === 0) {
                throw new Error(`School '${schoolName}' not found`);
            }
            
            // Get the school ID
            const schoolId = school[0]._id;
            
            // Find the classroom by name within the school
            const classrooms = await this.classroomDB.findClassrooms({ school: schoolId, name: classroomName });
            if (!classrooms || classrooms.length === 0) {
                throw new Error(`Classroom '${classroomName}' not found in school '${schoolName}'`);
            }
            
            // Get the classroom ID
            const classroomId = classrooms[0]._id;
            
            // Create student data
            const studentData = { name, school: schoolId, classroom: classroomId };
            
            // Insert student into the database
            const newStudent = await this.dataBase.insertStudentInDb(studentData);
            
            // Add student's ID to classroom's list of students
            await this.classroomDB.addStudentToClassroom(classroomId, newStudent._id);
            
            // Add student's ID to school's list of students
            await this.schoolDB.addStudentToSchool(schoolId, newStudent._id);
            
            return newStudent;
        } catch (error) {
            console.error('Error creating student:', error);
            throw error;
        }
    }
    

    async getStudents({ __query }) {
        try {

            console.log(__query.name);
            const StudentName = __query.name;
            // limited to get by name ( not id or classroom or school )
            const students = await this.dataBase.findStudents({name: StudentName});
            return students;
        } catch (error) {
            console.error('Error getting students:', error);
            throw error;
        }
    }

    async updateStudent(query, update) {
        try {
            // Find the student to be updated
            const student = await this.dataBase.findStudents(query);
            if (!student || student.length === 0) {
                throw new Error(`Student not found with query: ${JSON.stringify(query)}`);
            }
            
            const updatedStudent = await this.dataBase.updateStudent(query, update);
            
            // If the student's classroom or school information has changed, update the lists in the corresponding classroom and school
            if (update.classroom || update.school) {
                const { classroom, school } = updatedStudent;
                
                // Remove student's ID from the old classroom's list of students
                if (student[0].classroom.toString() !== classroom) {
                    await this.classroomDB.removeStudentFromClassroom(student[0].classroom, student[0]._id);
                }
                
                // Remove student's ID from the old school's list of students
                if (student[0].school.toString() !== school) {
                    await this.schoolDB.removeStudentFromSchool(student[0].school, student[0]._id);
                }
                
                // Add student's ID to the new classroom's list of students
                await this.classroomDB.addStudentToClassroom(classroom, student[0]._id);
                
                // Add student's ID to the new school's list of students
                await this.schoolDB.addStudentToSchool(school, student[0]._id);
            }
            
            return updatedStudent;
        } catch (error) {
            console.error('Error updating student:', error);
            throw error;
        }
    }
    
    async deleteStudent(query) {
        try {
            // Find the student to be deleted
            const student = await this.dataBase.findStudents(query);
            if (!student || student.length === 0) {
                throw new Error(`Student not found with query: ${JSON.stringify(query)}`);
            }
            
            const result = await this.dataBase.deleteStudent(query);
            
            // Remove student's ID from the classroom's list of students
            await this.classroomDB.removeStudentFromClassroom(student[0].classroom, student[0]._id);
            
            // Remove student's ID from the school's list of students
            await this.schoolDB.removeStudentFromSchool(student[0].school, student[0]._id);
            
            return result;
        } catch (error) {
            console.error('Error deleting student:', error);
            throw error;
        }
    }
    
}
