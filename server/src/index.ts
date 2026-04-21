import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { employeeRouter } from './routes/employees'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/employees', employeeRouter)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
