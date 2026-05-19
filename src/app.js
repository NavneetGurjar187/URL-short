const express = require("express")
const userRoutes = require("./routes/user.routes")
const urlRoutes = require("./routes/urls.routes")
const cookieParser = require("cookie-parser")

const app = express()

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth",userRoutes)
app.use("/api/url",urlRoutes)

module.exports = app