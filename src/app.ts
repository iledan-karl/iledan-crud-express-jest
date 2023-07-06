import express, { json } from 'express'
import usersRouter from './routes/user.routes'

export const app = express()

app.use(json())
app.use(`/users`, usersRouter)

// Catch-all route
app.use(`*`, (req, res) => {
  res.status(404).send(`Endpoint not found`)
})