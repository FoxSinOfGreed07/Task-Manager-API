const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true,
        default : 'Anonymous'
    },
    age : {
        type : Number,
        default : 0,
        validate(value){
            if(value<0) {
                throw new Error('Age must be a positive number!');
            }
        }
    },
    email : {
        type : String,
        unique : true,
        required : true,
        trim : true,
        lowercase : true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error('Invalid Email!');
            }
        }
    },
    password : {
        type : String,
        required : true,
        trim : true,
        minlength : [7, 'Password too Small!'],
        validate(value) {
            if(value.toLowerCase().includes('password')){
                throw new Error('Password Must not contain the word "password"');
            }
        }
    },
    tokens : [{
        token : {
            type : String,
            required : true
        }
    }], 
    avatar : {
        type : Buffer
    }
}, {
    timestamps : true
})

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email});

    if(!user){
        throw new Error('Unable to Find User');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        throw new Error('Unable to Login');
    }
    return user;
}

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id : user._id.toString() }, process.env.JWT_CODE);
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
}

userSchema.methods.toJSON = function () {
    user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    
    return userObject;
}

userSchema.virtual('tasks', {
    ref : 'Task',
    localField : '_id',
    foreignField : 'Creator'    
})

userSchema.pre('remove', async function (next){
    const user = this;
    await Task.deleteMany({ Creator : user._id });
    next();
})

userSchema.pre('save', async function(next){
    const user = this;
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8);
    }
    next();
})
const User = mongoose.model('User', userSchema);

module.exports = User;