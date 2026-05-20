const express = require("express")
const authMiddleware = require("../middleware/auth.middleware")
const urlController = require("../controller/urls.controller")
const router = express.Router()

router.post("/shorten",authMiddleware,urlController.shortenUrl)

router.get("/getMyUrls",authMiddleware,urlController.getMyUrls)

router.delete("/delete/:id",authMiddleware,urlController.deleteUrl)

router.get("/analytics/:id",authMiddleware,urlController.getUrlAnalytics)

router.get("/:shortCode",urlController.redirectUrl)


module.exports = router