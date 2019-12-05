const express = require('express')
require('./db/mongoose')

const taskRouter = require('./routers/task')
const userRouter = require('./routers/user')

const app = express()
const port = process.env.PORT || 3000

app.use((req, res, next) => {
    const maintenanceMethods = ['POST', 'PATCH', 'DELETE']
    if (maintenanceMethods.includes(req.method)) {
        res.status(503).send('The service is currently under maintenance.')
    } else {
        next()
    }
})

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

// Start server
app.listen(port, () => {
    console.log("Server started on port " + port)
})