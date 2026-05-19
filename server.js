require("dotenv").config()
const app = require("./src/app")
const connectToDB = require("./src/config/databse")

connectToDB()

app.get("/", (req,res)=>{
    res.status(200).json({
        message : "URL Shortener Backend Running 🚀"
    })
})

app.listen(3000,()=>{
    console.log("server is running on port 3000")
})