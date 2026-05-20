const urlModel = require("../models/urls.model")
const {nanoid} = require("nanoid")

async function shortenUrl(req,res){

    const {originalUrl} = req.body

    if(!originalUrl){
        return res.status(400).json({
            message :"Original url is required"
        })
    }

    try{

        const shortCode = nanoid(6)

        const existingUrl = await urlModel.findOne({shortCode})

        if(existingUrl){
            return res.status(400).json({
                message : "Short code already exists"
            })
        }


        const newUrl = await urlModel.create({
            originalUrl,
            shortCode,
            user : req.user.userId
        })


        res.status(201).json({
            message: "URL shortened successfully",
            url: newUrl
        })

    }catch(err){
        res.status(500).json({
            message: "Internal server error",
            error : err.message
        })
    }

}

async function redirectUrl(req,res){

    const {shortCode} = req.params

    try{

        const url = await urlModel.findOne({shortCode})

        if(!url){
            return res.status(404).json({
                message : "Invalid short code"
            })
        }

        url.clicks += 1
        await url.save()

        res.redirect(url.originalUrl)

    }catch(err){
        res.status(500).json({
            message:"Internal server error",
            error : err.message
        })
    }

}

async function getMyUrls(req,res){
    try{

        const urls = await urlModel.find({user : req.user.userId})

        res.status(200).json({
            message : "Urls retrieved successfully",
            urls
        })

    }catch(err){
        res.status(500).json({
            message : "Internal server error",
            error : err.message
        })
    }
}

async function deleteUrl(req,res){

    const {id} = req.params

    try{

        const url = await urlModel.findById(id)

        if(!url){
            return res.status(404).json({
                message : "Url not found"
            })
        }

        await urlModel.findByIdAndDelete(id)

        res.status(200).json({
            message : "Url deleted successfully"
        })

    }catch(err){
        res.status(500).json({
            message : "Internal server error",
            error : err.message
        })
    }

}

async function getUrlAnalytics(req,res){
    const {id} = req.params

    try{

        const url = await urlModel.findById(id)

        if(!url){
            return res.status(404).json({
                message : "Url not found"
            })
        }

        res.status(200).json({
            message : "Url analytics retrieved successfully",
            analytics : url
        })

    }catch(err){
        res.status(500).json({
            message: "Internal server error",
            error : err.message
        })
    }
}

module.exports = {
    shortenUrl,
    redirectUrl,
    getMyUrls,
    deleteUrl,
    getUrlAnalytics
}