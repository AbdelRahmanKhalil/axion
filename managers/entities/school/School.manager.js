const SchoolDB = require('./SchoolDB');
const ClassroomDB = require('../classroom/ClassroomDB');

module.exports = class School {

    constructor({ cache, config, cortex, managers, validators, mongomodels } = {}) {
        this.config = config;
        this.cortex = cortex;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.tokenManager = managers.token;
        this.schoolCollection = "schools";
        this.schoolExposed = ['createUser'];
        this.httpExposed = ['post=createSchool', 'get=getSchools', /*'put=updateSchool',*/ 'delete=deleteSchool'];

        this.cache = cache;
        this.dataBase = new SchoolDB(this.mongomodels.School);
        this.classroomDB = new ClassroomDB(this.mongomodels.Classroom);
    }
    async isUserAuthorized(decoded) {
        try {
            console.log("decoded=", decoded);
            let privilege = decoded.privilege;
            console.log("privilege=", privilege);
            if (privilege == 'schooladmin') {
                return false;
            }

        } catch (error) {
            console.log("error validating token");
            return false;
        }
        return true;
    }
    async createSchool(__longToken) {
        let schoolData = {};
        if (__longToken.name) { schoolData = { name: __longToken.name } } else return { error: "name is required" };
        // Chech user privilege
        if (! await this.isUserAuthorized(__longToken.__longToken)) return { error: "schooladmin is unauthorized" };
        // Data validation
        let result = await this.validators.school.createSchool(schoolData);
        console.log("validation result:", result);
        if (result) return { error: result[0].message };
        try {
            const newSchool = await this.dataBase.insertSchoolInDb(schoolData);
            return newSchool;
        } catch (error) {
            if (error.code == '11000') {
                return { error: 'School Already Exists' };
            }
            return {
                error: 'Error saving school'
            };
        }
    }

    async getSchools({ __query }) {
        try {
            let query = {};
            if (__query.name) {
                console.log(__query.name);
                query = { name: __query.name };
            } else if (__query.id) {
                query = { _id: __query.id }
            }
            //if (query == {}) return {error: 'Empty query'};

            const schools = await this.dataBase.findSchools(query);
            if (schools.length == 0) {
                return { error: 'School not found' };
            }
            return schools;
        } catch (error) {
            console.error('Error getting schools:', error);
            return { error: 'Failed to retrieve school data' };;
        }
    }

    // async updateSchool(query, update) {
    //     try {


    //         const result = await this.dataBase.updateSchool(query, update);
    //         return result;
    //     } catch (error) {
    //         console.error('Error updating school:', error);
    //         throw error;
    //     }
    // }

    async deleteSchool(__longToken) {

        let todeleteSchool = {};
        let name = null;
        let id = null;
        if (__longToken.name) {
            todeleteSchool = { name: __longToken.name };
            name = __longToken.name;
        }
        else if (__longToken.id) {
            todeleteSchool = { id: __longToken.id}
            id =  __longToken.id;

        }
        // Chech user privilege
        if (! await this.isUserAuthorized(__longToken.__longToken)) return { error: "schooladmin is unauthorized" };


        // Data validation
        let result = await this.validators.school.deleteSchool(todeleteSchool);
        console.log("validation result:", result);
        if (result) return { error: result[0].message };

        try {
            let query = {};
            if (id) {
                query = { _id: id };
            } else if (name) {
                query = { name: name };
            }
            const result = await this.dataBase.deleteSchool(query);
            if (result.deletedCount == 1) {
                return;
            }
            else {
                return { error: 'School not found' };
            }
        } catch (error) {
            console.error('Error deleting school:', error);
            return { error: 'Failed to delete school' };
        }
    }
}
