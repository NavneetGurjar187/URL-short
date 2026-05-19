const userModel = require("../models/user.models")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

async function registerUser(req,res){
    try{

        const {name,email,password} = req.body

        if(!name || !email || !password){
            return res.status(400).json({
                message:"All fields are required"
            })
        }

        const existingUser = await userModel.findOne({email})

        if(existingUser){
            return res.status(400).json({
                message : "User with this email already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newuser = userModel.create({
            name,
            email,
            password: hashedPassword,

        })

        const token = jwt.sign(
            {
                userId : newuser._id
            },
            process.env.JWT_SECRET
        )

        res.cookie("token",token)

        res.status(201).json({
            message: "user registred successfully",
            user :{
                id : newuser._id,
                name : newuser.name,
                email : newuser.email
            },
            token
        })



    }catch(err){
        res.status(500).json({
            message: "Internal server error",
            error : err.message
        })
    }
}

async function loginUser(req,res){

    try{

        const {email,password} = req.body

        if(!email || !password){
            return res.status(400).json({
                message: "All fields are required"
            })
        }

        const user = await userModel.findOne({email}).select("+password")

        if(!user){
            return res.status(400).json({
                message: "Invalid email"
            })
        }

        const isPasswordValid = await bcrypt.compare(password,user.password)

        if(!password){
            return res.status(400).json({
                message: "Invalid password"
            })
        }

        const token = jwt.sign(
            {
                userId : user._id
            },
            process.env.JWT_SECRET
        )

        res.cookie("token",token)

        res.status(200).json({
            message: "Login successful",
            user : {
                id : user._id,
                name : user.name,
                email : user.email
            },
            token
        })

    }catch(err){
        res.status(500).json({
            message: "Internal server error",
            error : err.message
        })
    }

}

async function getMe(req,res){

    try{

        const user = await userModel.findById(req.user.userId)

        if(!user){
            return res.status(404).json({
                message:"User not found"
            })
        }

        res.status(200).json({
            message: "User details fetched successfully",
            user : {
                id : user._id,
                name : user.name,
                email : user.email
            }
        })

    }catch(err){
        res.status(500).json({
            message: "Internal server error",
            error : err.message
        })
    }

}

module.exports = {
    registerUser,
    loginUser,
    getMe
}
