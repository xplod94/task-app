const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const request = require('supertest')

const app = require('../src/app')
const User = require('../src/models/user')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: "Tony Stark",
    age: 45,
    email: "tony@starkindustries.us",
    password: "ilovepepper",
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
}

beforeEach(async () => {
    await User.deleteMany()
    await new User(userOne).save()
})

test('Should sign-up user', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: "Pranav",
            age: 25,
            email: "pranavpande94@yahoo.in",
            password: "pranav@94"
        })
        .expect(201)

    const user = await User.findById(response.body.user._id)

    // Assertion to test response structure
    expect(response.body).toMatchObject({
        user: {
            name: "Pranav",
            email: "pranavpande94@yahoo.in"
        },
        token: user.tokens[0].token
    })

    // Assertion to test if user is stored in database
    expect(user).not.toBeNull()

    // Assertion to check password encryption
    expect(user.password).not.toBe("pranav@94")
})

test('Should login existing user', async () => {
    const response = await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: userOne.password
        })
        .expect(200)

    const user = await User.findById(userOneId)

    // Assertion to test if new token is saved in db
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login nonexistant user', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: "captainamericasucks"
        })
        .expect(400)
})

test('Should get profile for user', async () => {
    const response = await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    // Creating the user profile response from the input user
    const userOneProfile = JSON.parse(JSON.stringify(userOne))
    userOneProfile._id = userOneProfile._id.toString()
    delete userOneProfile.tokens
    delete userOneProfile.password

    // Assertion to test if the user profile returned is same
    expect(response.body).toMatchObject(userOneProfile)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOneId)

    // Assertion to check if user is really deleted
    expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})