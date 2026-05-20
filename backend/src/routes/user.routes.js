const express = require("express")
const router = express.Router()
const userController = require("../controller/user.controller")
const authMiddleware = require("../middleware/auth.middleware")

router.post("/register", userController.registerUser)

router.post('/login',userController.loginUser)

router.post('/logout', userController.logoutUser)

router.get("/getMe", authMiddleware, userController.getMe)

module.exports = router