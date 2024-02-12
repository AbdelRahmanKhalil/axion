module.exports = class User { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.tokenManager        = managers.token;
        this.usersCollection     = "users";
        this.userExposed         = ['createUser'];
        this.httpExposed         = ['createUser'];
        this.cache               = cache;
    }

    insertUserInDb(user){
        // Insert created user in DB (will not insert)
        const userKey = `user:${user.username}`;
        this.cache.hash.set({
            key: userKey,
            //data: userData
            data: user
        }).then(result => {
            if(result > 0){
                console.log('User data stored successfully:', result);
            }
            else if(result == 0){
                console.log('User already exists:', result);
            }
            return result;
            
        }).catch(error => {
            console.error('Error storing user data:', error);
            return -1;
        });

        
   }

    

    async createUser({username, email, password}){
        console.log('-------------------UserManager createUser-------------------');
        const user = {username, email, password};
        console.log('username:'+user.username+' email:'+ user.email+' password:'+ user.password);
        // Data validation
        let result = await this.validators.user.createUser(user);
        if(result) return result;
        
        // Creation Logic
        let createdUser     = {username, email, password}
        let longToken       = this.tokenManager.genLongToken({userId: createdUser._id, userKey: createdUser.key });
        
        // Insert user in database
        let res = this.insertUserInDb(createdUser);
        console.log('res='+res);

        // Retrieve user data from DB
        const userKey = `user:${username}`;
        this.cache.hash.get({ key: userKey }).then(userData => {
            console.log('User data retrieved successfully:', userData);
        }).catch(error => {
            console.error('Error retrieving user data:', error);
        });

        // Response
        return {
            user: createdUser, 
            longToken 
        };
    }

    

}
