const express = require("express")
const path = require("path")
const cors = require("cors")
const userRoutes = require("./routes/user.routes")
const urlRoutes = require("./routes/urls.routes")
const cookieParser = require("cookie-parser")

const app = express()

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "..", "frontend", "dist")))

app.use("/api/auth", userRoutes)
app.use("/api/url", urlRoutes)

app.get(/.*/, (req, res) => {
    if (req.path.startsWith("/api/")) {
        return res.status(404).json({ message: "API route not found" })
    }
    res.sendFile(path.join(__dirname, "..", "frontend", "dist", "index.html"))
})

module.exports = app