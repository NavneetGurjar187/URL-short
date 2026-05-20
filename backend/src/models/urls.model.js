const mongoose = require("mongoose")

const urlSchema = new mongoose.Schema({
    originalUrl :{
        type : String,
        required : [true, "Original url is required"],       
    },
    shortCode :{
        type : String,
        required : [true, "Short code is required"],
        unique : true
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    clicks : {
        type : Number,
        default : 0
    }
},{
    timestamps : true
})

const urlModel = mongoose.model("Url",urlSchema)

module.exports = urlModel
