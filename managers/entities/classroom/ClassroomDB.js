module.exports = class ClassroomDB {
    constructor(classroomModel) {
        this.classroomModel = classroomModel;
    }

    async insertClassroomInDb(classroom) {
        try {
            const newClassroom = new this.classroomModel(classroom);
            const savedClassroom = await newClassroom.save();
            return savedClassroom;
        } catch (error) {
            console.error('Error saving classroom:', error);
            throw error;
        }
    }

    async findClassrooms(query) {
        try {
            const classrooms = await this.classroomModel.find(query);
            return classrooms;
        } catch (error) {
            console.error('Error finding classrooms:', error);
            throw error;
        }
    }

    async updateClassroom(query, update) {
        try {
            const result = await this.classroomModel.updateOne(query, update);
            return result;
        } catch (error) {
            console.error('Error updating classroom:', error);
            throw error;
        }
    }

    async deleteClassroom(query) {
        try {
            const result = await this.classroomModel.deleteOne(query);
            return result;
        } catch (error) {
            console.error('Error deleting classroom:', error);
            throw error;
        }
    }

    async addStudentToClassroom(classroomId, studentId) {
        try {
            const result = await this.classroomModel.updateOne({ _id: classroomId }, { $addToSet: { students: studentId } });
            return result;
        } catch (error) {
            console.error('Error adding student to classroom:', error);
            throw error;
        }
    }
}