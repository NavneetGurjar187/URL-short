const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name : {
        type:String,
        required : [true,"Name is required"]
    },
    email :{
        type : String,
        required: [true,"Email is required"],
        unique : [true,"Email already exists"],
        match : [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,"Please provide a valid email"]
    },
    password : {
        type : String,
        required : [true,"Password is required"],
        minlength : [6,"Password must be at least 6 characters long"],
        select : false
    }
},{
    timestamps : true
})

const userModel = mongoose.model("user",userSchema)

module.exports = userModel