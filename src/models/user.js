const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const validator = require('validator')

const Task = require('./task')

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
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

// It is used to create a virtual path in the schema, one
// which does not exist in the database but we can populate
// it in our queries. It also sets the relationship between
// Task schema owner and User schema id just like a foreign
// key.
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
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

// This is the js prototype toJSON method which we are
// overriding to return the user without sensitive data
// like password and tokens. Whenever user is sent back
// to the client via res.send(), it internally calls
// JSON.stringify() on the user object which in turn
// calls the prototype toJSON() method to make sure the
// object is JSON before stringifying it.
userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
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

// Removes all tasks associated to a user when the user deletes
// their profile.
userSchema.pre('remove', async function(next) {
    const user = this

    await Task.deleteMany({ owner: user._id })
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User