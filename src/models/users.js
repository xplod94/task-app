const validator = require('validator')
const mongoose = require('mongoose')

const User = mongoose.model('User', {
    name: {
        type: String,
        required: true,
        trim: true        
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email!')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be positive!')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if (value.toLowerCase().search("password") !== -1) {
                throw new Error('Password cannot contains the string "Password"!')
            }
        }
    }
})

module.exports = User