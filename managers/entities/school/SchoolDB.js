module.exports = class SchoolDB {
    constructor(schoolModel) {
        this.schoolModel = schoolModel;
    }

    async insertSchoolInDb(school) {
        try {
            const newSchool = new this.schoolModel(school);
            const savedSchool = await newSchool.save();
            return savedSchool;
        } catch (error) {
            console.error('Error saving school:', error);
            throw error;
        }
    }

    async findSchools(query) {
        try {
            const schools = await this.schoolModel.find(query);
            return schools;
        } catch (error) {
            console.error('Error finding schools:', error);
            throw error;
        }
    }

    async updateSchool(query, update) {
        try {
            const result = await this.schoolModel.updateOne(query, update);
            return result;
        } catch (error) {
            console.error('Error updating school:', error);
            throw error;
        }
    }

    async deleteSchool(query) {
        try {
            const result = await this.schoolModel.deleteOne(query);
            return result;
        } catch (error) {
            console.error('Error deleting school:', error);
            throw error;
        }
    }

    async addClassroomToSchool(schoolId, classroomId) {
        try {
            const result = await this.schoolModel.updateOne({ _id: schoolId }, { $addToSet: { classrooms: classroomId } });
            return result;
        } catch (error) {
            console.error('Error adding classroom to school:', error);
            throw error;
        }
    }

    async addStudentToSchool(schoolId, studentId) {
        try {
            const result = await this.schoolModel.updateOne({ _id: schoolId }, { $addToSet: { students: studentId } });
            return result;
        } catch (error) {
            console.error('Error adding student to school:', error);
            throw error;
        }
    }

    async deleteClassroomFromSchool(schoolId, classroomId) {
        try {
            const result = await this.schoolModel.updateOne({ _id: schoolId }, { $pull: { classrooms: classroomId } });
            return result;
        } catch (error) {
            console.error('Error deleting classroom from school:', error);
            throw error;
        }
    }
    
    async deleteStudentFromSchool(schoolId, studentId) {
        try {
            const result = await this.schoolModel.updateOne({ _id: schoolId }, { $pull: { students: studentId } });
            return result;
        } catch (error) {
            console.error('Error deleting student from school:', error);
            throw error;
        }
    }
    
}