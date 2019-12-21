const request = require('supertest')

const app = require('../src/app')
const Task = require('../src/models/task')

const { userOneId, userOne, userTwo, taskOne, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: "Create mark 52"
        })
        .expect(201)

    const task = await Task.findById(response.body._id)

    // Assertion to check if the task was indeed saved in the db
    expect(task).not.toBeNull()

    // Assertion to check if task is completed
    expect(task.completed).toBe(false)

    // Assertion to check if the given user is indeed the task's owner
    expect(task.owner.toString()).toBe(userOneId.toString())
})

test('Should get all tasks for a user', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    // Assertion to check if correct number of tasks are returned
    expect(response.body.length).toBe(2)
})

test("Should update user task", async () => {
    await request(app)
        .patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: "Fight captain america"
        })
        .expect(200)

    const task = await Task.findById(taskOne._id)

    // Assertion to check if the task got updated
    expect(task.description).toEqual("Fight captain america")
})

test("should not be able to delete another user's tasks", async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)

    const task = await Task.findById(taskOne._id)

    // Assertion to check if task still exists in the db
    expect(task).not.toBeNull()
})

test("Should delete user task", async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const task = await Task.findById(taskOne._id)

    // Assertion to check if task still exists in the db
    expect(task).toBeNull()
})