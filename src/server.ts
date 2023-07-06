import { app } from './app'

const PORT = 3000

// Start server
app.listen(PORT, () => {
  console.info(`Started server on port ${PORT}`)
})