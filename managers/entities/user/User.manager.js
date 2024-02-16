const { privilege } = require('../../_common/schema.models');
const UserDb = require('./UserDB');

module.exports = class User {

    constructor({ utils, cache, config, cortex, managers, validators, mongomodels } = {}) {
        this.config = config;
        this.cortex = cortex;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.tokenManager = managers.token;
        this.usersCollection = "users";
        this.userExposed = ['createUser'];
        this.httpExposed = ['post=createUser', 'get=getUserData', 'put=updateUser', 'delete=deleteUser'];
        //,'get=getUserData','put=updateUser','delete=deleteUser'];
        this.cache = cache;
        this.dataBase = new UserDb(this.mongomodels.User);
        //insert initial superuser if not already in db
        /*let superUser = {
            username: 'superUser',
            privilege: 'superuser',
            email: 'superuser@gmail.com',
            password: 'superuser123'
        };
        try{
            this.dataBase.insertUserInDb(superUser);
        }catch(error){console.log(error.code == '11000'?"superUser already in db":"error inserting superUser"); }
        */
    }


    async createUser({ username, privilege, email, password }) {
        console.log('-------------------UserManager createUser-------------------');
        const user = { username, privilege, email, password };
        console.log('username:' + user.username + 'privilege' + privilege + ' email:' + user.email + ' password:' + user.password);
        // Data validation
        let result = await this.validators.user.createUser(user);
        if (result) return result;

        // Creation Logic
        let createdUser = { username, privilege, email, password }
        let longToken = this.tokenManager.genLongToken({ userId: createdUser._id, privilege: createdUser.privilege, userKey: createdUser.key });

        try {
            // Insert user in database
            result = await this.dataBase.insertUserInDb(createdUser);
            console.log('insert res=' + result);
        } catch (error) {
            return {
                error: 'Error saving user'
            }
        }

        return {
            user: createdUser,
            longToken
        }

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

    async deleteUser(__longToken) {

        const username = __longToken.username;
        // Chech user privilege
        if (! await this.isUserAuthorized(__longToken.__longToken)) return { error: "schooladmin is unauthorized" };

        console.log('-------------------UserManager deleteUser-------------------');
        let result = await this.validators.user.deleteUser({ username });
        if (result) return result;
        try {

            // Delete user from database
            result = await this.dataBase.deleteUser({ username });
            console.log('delete res=', result);
            if (result.deletedCount == 1) {
                return;
            }
            else {
                return { error: 'User not found' };
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            return { error: 'Failed to delete user' };
        }
    }

    async updateUser(__longToken) {
        console.log('-------------------UserManager updateUser-------------------');
        const username = __longToken.username;
        const email = __longToken.email;
        const password = __longToken.password;
        // Chech user privilege
        if (! await this.isUserAuthorized(__longToken.__longToken)) return { error: "schooladmin is unauthorized" };


        const updatedUser = { username, email, password };

        // Data validation
        let result = await this.validators.user.updateUser(updatedUser);
        if (result) return result;

        try {
            // Update user in database
            result = await this.dataBase.updateUser({ username: updatedUser.username }, { email: updatedUser.email, password: updatedUser.password });
            console.log('update res=', result);
            if (result.matchedCount == 0) {
                return { error: 'User not found' };
            }
            else if (result.matchedCount == 1 && result.modifiedCount == 0) {
                return { error: 'Nothing to update' };
            }
            return {
                user: updatedUser
            }
        } catch (error) {
            console.error('Error updating user:', error);
            return { error: 'Failed to update user' };
        }
    }

    async getUserData({__longToken, __query }) {
        console.log('-------------------getUserData-------------------');

        // Chech user privilege
        if (! await this.isUserAuthorized(__longToken.__longToken)) return { error: "schooladmin is unauthorized" };


        try {

            console.log(__query.username);
            const username = __query.username;

            let result = await this.validators.user.getUserData({ username });
            if (result) return result;
            // Retrieve user data from database
            result = await this.dataBase.findUsers({ username: username })
            console.log('get res=', result);
            if (result.length == 0) {
                return { error: 'User not found' };
            }

            return result
        } catch (error) {
            console.error('Error retrieving user data:', error);
            return { error: 'Failed to retrieve user data' };
        }
    }







}
