const express = require('express')
require('./db/mongoose')

const taskRouter = require('./routers/task')
const userRouter = require('./routers/user')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

// Start server
app.listen(port, () => {
    console.log("Server started on port " + port)
})