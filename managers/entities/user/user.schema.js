

module.exports = {
    createUser: [
        {
            model: 'username',
            required: true,
        },
        {
            model: 'email',
            required: true,
        },
        {
            model: 'password',
            required: true,
        }
    ],
    updateUser: [
        {
            model: 'username',
            required: true,
        },
        {
            model: 'email',
            required: true,
        },
        {
            model: 'password',
            required: true,
        }
    ],
    deleteUser: [
        {
            model: 'username',
            required: true,
        }
    ],
    getUserData: [
        {
            model: 'username',
            required: true,
        }
    ]
}


