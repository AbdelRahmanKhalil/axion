const ClassroomDB = require('./ClassroomDB');
const SchoolDB = require('../school/SchoolDB');
module.exports = class Classroom {

    constructor({ cache, config, cortex, managers, validators, mongomodels } = {}) {
        this.config = config;
        this.cortex = cortex;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.tokenManager = managers.token;
        this.classroomCollection = "classrooms";
        this.classroomExposed = ['createUser'];
        this.httpExposed = ['post=createClassroom', 'get=getClassrooms', 'put=updateClassroom', 'delete=deleteClassroom'];
        this.cache = cache;
        this.dataBase = new ClassroomDB(this.mongomodels.Classroom);
        this.schoolDB = new SchoolDB(this.mongomodels.School);
    }

    async createClassroom(classroomData) {
        // Data validation
        let result = await this.validators.classroom.createClassroom(classroomData);
        console.log("validation result:", result);
        if (result) return { error: result[0].message };
        
        try {
            // check if school exists
            let schoolRes = await this.schoolDB.findSchools({_id: classroomData.school});
            console.log("schoolRes=",schoolRes);
            if(!schoolRes[0]._id){
                console.log("school id entered is not valid");
                return {error: "school id entered is not valid"};
            }
            
            const newClassroom = await this.dataBase.insertClassroomInDb(classroomData);
            result = await this.schoolDB.addClassroomToSchool(classroomData.school,newClassroom._id);
            console.log("addclassroomtoschool result=", result);
            /*if (result.modifiedCount == 1){
                return newClassroom;
            }
            else{
                //delete classroom
                const newClassroom = await this.dataBase.deleteClassroom({_id: newClassroom._id});
                return {error: "classroom could not be added to school"};
            }*/
            return newClassroom;
        } catch (error) {
            console.error('Error creating classroom:', error);
            if (error.code == '11000') {
                return { error: 'Classroom Already Exists' }
            }
            return {
                error: 'Error saving Classroom'
            }
        }
    }

    async getClassrooms({ __query }) {
        try {
            const classrooms = await this.dataBase.findClassrooms(query);
            return classrooms;
        } catch (error) {
            console.error('Error getting classrooms:', error);
            throw error;
        }
    }

    async updateClassroom(query, update) {
        try {
            const result = await this.dataBase.updateClassroom(query, update);
            return result;
        } catch (error) {
            console.error('Error updating classroom:', error);
            throw error;
        }
    }

    async deleteClassroom(query) {
        try {
            const result = await this.dataBase.deleteClassroom(query);
            return result;
        } catch (error) {
            console.error('Error deleting classroom:', error);
            throw error;
        }
    }
}
