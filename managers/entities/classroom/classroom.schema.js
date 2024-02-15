

module.exports = {
    createClassroom: [
        {
            model: 'name',
            required: true,
        },
        {
            model: 'school',
            required: true,
        }
    ],
    deleteClassroom: [
        {
            model: 'id',
            required: true,
        }
        
    ]
}


