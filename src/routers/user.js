const auth = require('../middleware/auth')
const express = require('express')
const multer = require('multer')
const User = require('../models/user')

const router = new express.Router()
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            callback(new Error('Please upload an image file.'))
        }

        callback(undefined, true)
    }
})

// 1 Create user (sign up)
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

// 2 Login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch(e) {
        res.status(400).send()
    }
})

// 3 Logout
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)
        await req.user.save()
        res.send()
    } catch(e) {
        res.status(500).send()
    }
})

// 4 Logout from all sessions
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch(e) {
        res.status(500).send()
    }
})

// 5 Get user profile
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

// 6 Update a user
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = Object.keys(User.schema.paths)
    const isUpdateAllowed = updates.every(update => allowedUpdates.includes(update))

    if (!isUpdateAllowed) {
        return res.status(400).send({
            error: "Invalid field!"
        })
    }

    try {
        updates.forEach(update => req.user[update] = req.body[update])
        await req.user.save()

        res.send(req.user)
    } catch(e) {
        res.status(400).send(e)
    }
})

// 7 Delete a user
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    } catch(e) {
        res.status(500).send()
    }
})

// 8 Upload user profile picture
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    req.user.avatar = req.file.buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

// 9 Delete user profile picture
router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send()
    } catch(e) {
        res.status(500).send()
    }
})

// 10 Read user image (by Id)
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        // Setting header to tell type
        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    } catch(e) {
        res.status(404).send()
    }    
})

module.exports = router