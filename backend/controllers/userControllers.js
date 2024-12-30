import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";

export const getProfile = async(req,res)=>{
    try{
        const {userName} = req.params;
        const user = await User.findOne({userName}) 

        if(!user){
            return res.status(400).json({error: "User Not Found"})
        }
        res.status(200).json({user})
    }catch(error){
        console.log(`Error in Get User Profile Controller : ${error}`)
        res.status(500).json({error: "Internal Server Error"})
    }
}

export const followUnFollowUser = async (req,res)=>{
    try{
        const {id} = req.params;
        const userToModify = await User.findById({_id:id})
        const currentUser = await User.findById({_id : req.user._id})

        console.log(currentUser)

        if(id === req.user._id){
            return res.status(400).json({error : "You Can't Unfollow or Follow Your Self"})
        }

        if(!userToModify || !currentUser){
            return res.status(400).json({error : "User not Found"})
        }

        const isFollowing = currentUser.following.includes(id);

        if(isFollowing){
            await User.findByIdAndUpdate({_id:id},{$pull:{followers:req.user._id}})
            await User.findByIdAndUpdate({_id:req.user._id},{$pull:{following:id}}) 
            const newNotification =  new Notification({
                type: "follow",
                from : req.user._id,
                to : userToModify.id
            })
            await newNotification.save();
            res.status(200).json({message:"Unfollow Successfully!"})
        }else{
            await User.findByIdAndUpdate({_id:id},{$push:{followers:req.user._id}})
            await User.findByIdAndUpdate({_id:req.user._id},{$push:{following:id}})
            res.status(200).json({message:"Follow Successfully!"})
        }
    }catch(error){
        console.log(`Error in Follow and UnFollow Controller : ${error}`)
        res.status(500).json({error: "Internal Server Error"})
    }
}