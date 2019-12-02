const express = require('express')
const Task = require('../models/tasks.js')

const router = new express.Router()

// Create a task
router.post('/tasks', async (req, res) => {
    const task = new Task(req.body)

    try {
        await task.save()
        res.status(201).send(task)
    } catch(e) {
        res.status(400).send(e)
    }
})

// Get all tasks
router.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find({})
        res.send(tasks)
    } catch(e) {
        res.status(500).send(e)
    }
})

// Get one task (by ID)
router.get('/tasks/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findById(_id)

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch(e) {
        res.status(500).send(e)
    }
})

// Update a task (by ID)
router.patch('/tasks/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = Object.keys(Task.schema.paths)
    const isUpdateAllowed = updates.every(update => allowedUpdates.includes(update))

    if (!isUpdateAllowed) {
        res.status(400).send({
            error: "Invalid field!"
        })
    }

    try {
        const task = await Task.findById(req.params.id)
        if (!task) {
            res.status(404).send()
        }

        updates.forEach(update => task[update] = req.body[update])
        task.save()

        res.send(task)
    } catch(e) {
        res.status(400).send(e)
    }
})

// Delete a task (by ID)
router.delete('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id)

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch(e) {
        res.status(500).send(e)
    }
})

module.exports = router