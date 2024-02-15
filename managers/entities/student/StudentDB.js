module.exports = class StudentDB {
    constructor(studentModel) {
        this.studentModel = studentModel;
    }

    async insertStudentInDb(student) {
        try {
            const newStudent = new this.studentModel(student);
            const savedStudent = await newStudent.save();
            return savedStudent;
        } catch (error) {
            console.error('Error saving student:', error);
            throw error;
        }
    }

    async findStudents(query) {
        try {
            const students = await this.studentModel.find(query);
            return students;
        } catch (error) {
            console.error('Error finding students:', error);
            throw error;
        }
    }

    async updateStudent(query, update) {
        try {
            const result = await this.studentModel.updateOne(query, update);
            return result;
        } catch (error) {
            console.error('Error updating student:', error);
            throw error;
        }
    }

    async deleteStudent(query) {
        try {
            const result = await this.studentModel.deleteOne(query);
            return result;
        } catch (error) {
            console.error('Error deleting student:', error);
            throw error;
        }
    }
}