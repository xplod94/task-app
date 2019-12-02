const validator = require('validator')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
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

// This is known as middleware in mongoose. Provides us with hooks
// to run before and after mongoose operations. We need to create
// schemas to define middleware functions. The function below will
// run before (pre) the save function of instances of User model.
// *Imp: It needs non-arrow function as callback since it exposes
// the model instance in "this" and arrow functions don't bind to
// this scope.
userSchema.pre('save', async function(next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User