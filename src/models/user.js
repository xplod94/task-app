const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const validator = require('validator')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true        
    },
    email: {
        type: String,
        unique: true,
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
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})


// Methods property allows us to create custom methods on
// a model instance. This method will be available to each
// instance of the model. Also, this is the reason it is
// not an arrow function, i.e. since it is defined on each
// individual instance, it exposes that instance through
// the 'this' object, which is not binded by arrow functions.
userSchema.methods.generateAuthToken = async function() {
    const user = this

    // Generate the token
    const token = jwt.sign({ _id: user._id.toString() }, 'mynodecourse', { expiresIn: '7 days' })

    // Save the token to the db (for multiple device logins, multiple tokens need to be saved)
    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

// Statics property allows us to define custom methods on a
// model. Here, we create a method to find a user by their
// email and password. These are also known as model methods.
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('Unable to login!')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error('Unable to login!')
    }

    return user
}

// This is known as middleware in mongoose. Provides us with hooks
// to run before and after mongoose operations. We need to create
// schemas to define middleware functions. The function below will
// run before (pre) the save function of instances of User model.
// *Imp: It needs non-arrow function as callback since it exposes
// the model instance in "this" and arrow functions don't bind to
// this scope.
userSchema.pre('save', async function(next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User