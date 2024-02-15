const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    classrooms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const School = mongoose.model('School', schoolSchema);

module.exports = School ;