const mongoose = require('mongoose');

taskSchema = new mongoose.Schema({
    Description : {
        type : String,
        required : true,
        trim : true
    },
    Completed : {
        type : Boolean,
        default : false
    },
    Deadline : {
        type : Date,
        required : true,
    },
    Creator : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'User'
    }
}, {
    timestamps : true
});

const Task = mongoose.model('Task',taskSchema);

module.exports = Task; 