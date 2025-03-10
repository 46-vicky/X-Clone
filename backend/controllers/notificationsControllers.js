import Notification from "../models/notificationModel.js";

export const getNotifications = async (req, res)=>{
    try{
        const userId = req.user._id;

        const notifications = await Notification.find({to : userId}).populate({
            path : "from",
            select : ["userName","profileImg"]
        })

        await Notification.updateMany({to :userId},{read : true})

        res.status(200).json(notifications)

    }catch(error){
        console.log(`Error in Get Notification Controllers : ${error}`)
        res.status(500).json({error : "Internal Server Error"})
    }
}

export const deleteNotifications = async (req, res)=>{
    try{
        const userId = req.user._id;
        await Notification.deleteMany({to : userId})
        res.status(200).json({message : "Notification Deleted Successfully!"})
    }catch(error){
        console.log(`Error in Delete Notification Controllers : ${error}`)
        res.status(500).json({error : "Internal Server Error"})
    }
}