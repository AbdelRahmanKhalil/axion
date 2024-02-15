

module.exports = {
    createSchool: [
        {
            model: 'name',
            required: true,
        }
    ],
    deleteSchool: [
        {
            model: 'id',
            required: false,
        },
        {
            model: 'name',
            required: false,
        }
        
    ]
}


