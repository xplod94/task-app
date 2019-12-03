const express = require('express')
const User = require('../models/users.js')

const router = new express.Router()

// Create user (sign up)
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch(e) {
        res.status(400).send(e)
    }
})

// Login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch(e) {
        res.status(400).send()
    }
})

// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({})
        res.send(users)
    } catch(e) {
        res.status(500).send(users)
    }
})

// Get one user (by ID)
router.get('/users/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const user = await User.findById(_id)

        if (!user) {
            return res.status(404).send()
        }

        res.send(user)
    } catch(e) {
        res.status(500).send(e)
    }
})

// Update a user (by ID)
router.patch('/users/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = Object.keys(User.schema.paths)
    const isUpdateAllowed = updates.every(update => allowedUpdates.includes(update))

    if (!isUpdateAllowed) {
        return res.status(400).send({
            error: "Invalid field!"
        })
    }

    try {
        // Here we could have used findByIdAndUpdate() but it does not
        // trigger the "save()" function on the model instance, rather
        // does a db operation directly. This will cause our middleware
        // function (to hash passwords) to not run since save is never
        // triggered. (Similar thing is present in tasks update)
        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).send()
        }
        
        updates.forEach(update => user[update] = req.body[update])
        await user.save()

        res.send(user)
    } catch(e) {
        res.status(400).send(e)
    }
})

// delete a user (by ID)
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)

        if (!user) {
            return res.status(404).send()
        }

        res.send(user)
    } catch(e) {
        res.status(500).send()
    }
})

module.exports = router