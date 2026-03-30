const express   = require("express")
const cors      = require("cors")
const dotenv    = require("dotenv")
const connectDB = require("./config/db")

dotenv.config()
connectDB()

const app = express()

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }))
app.use(express.json({ limit: "5mb" }))

app.get("/", (req, res) => res.json({ message: "NeoTrek API running" }))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))