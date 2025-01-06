import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import cloudinary from "cloudinary"

export const getProfile = async(req,res)=>{
    try{
        const {userName} = req.params;
        const user = await User.findOne({userName}) 

        if(!user){
            return res.status(404).json({error: "User Not Found"})
        }
        res.status(200).json(user)
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
            return res.status(404).json({error : "User not Found"})
        }

        const isFollowing = currentUser.following.includes(id);

        if(isFollowing){
            await User.findByIdAndUpdate({_id:id},{$pull:{followers:req.user._id}})
            await User.findByIdAndUpdate({_id:req.user._id},{$pull:{following:id}}) 
            res.status(200).json({message:"Unfollow Successfully!"})
        }else{
            await User.findByIdAndUpdate({_id:id},{$push:{followers:req.user._id}})
            await User.findByIdAndUpdate({_id:req.user._id},{$push:{following:id}})

            const newNotification =  new Notification({
                type: "follow",
                from : req.user._id,
                to : userToModify.id
            })
            await newNotification.save();
            res.status(200).json({message:"Follow Successfully!"})
        }
    }catch(error){
        console.log(`Error in Follow and UnFollow Controller : ${error}`)
        res.status(500).json({error: "Internal Server Error"})
    }
}

export const getSuggestedUsers = async (req,res)=>{
    try{
        const userId = req.user._id;
        const userFollowedByMe = await User.findById({_id:userId}).select("-password");

         let suggestedUsers = [];
         let attempts = 0;
 
         while (suggestedUsers.length < 4 && attempts < 3) {
             const users = await User.aggregate([
                 {
                     $match: {
                         _id: { $ne: userId } 
                     }
                 },
                 {
                     $sample: {
                         size: 10
                     }
                 }
             ]);
 
             const filteredUsers = users.filter((user) => !userFollowedByMe.following.includes(user._id));
             suggestedUsers = [...suggestedUsers, ...filteredUsers.slice(0, 4 - suggestedUsers.length)];
             attempts++;
         }
 
         suggestedUsers.forEach(user => user.password = null);

        res.status(200).json(suggestedUsers)

    }catch(error){
        console.log(`Error in Get Suggested Users Controller : ${error}`)
        res.status(500).json({error: "Internal Server Error"})
    }
}

export const updateUser = async (req,res)=>{
    try{
        const userId = req.user._id;
        let user = await User.findById({_id:userId})
        if(!user){
            return res.status(404).json({error : "User Not Found"})
        }
        const {userName, fullName, email, currentPassword, newPassword, bio, link} = req.body;

        let {profileImg, coverImg} = req.body;

        if((!currentPassword && newPassword)||(!newPassword && currentPassword)){
            return res.status(400).json({error : "Please Provide Bith new password and current password"})
        }

        if(currentPassword && newPassword){

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            
            if(!isMatch){
                return res.status(400).json({error : "Current Password is Incorrect"}) 
            }
            if(newPassword.length < 6){
                return res.status(400).json({error : "Password must have atleat 6 character"}) 
            }
    
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword,salt)
        }




        // if(profileImg){

        //     if(user.profileImg){
        //         await cloudinary.uploader.destory(user.profileImg.split("/").pop().split(".")[0]);
        //     }
        //     const uploadedResponse = await cloudinary.uploader.upload(profileImg)
        //     profileImg = uploadedResponse.secure_url;
        // }

        // if(coverImg){
        //     if(user.coverImg){
        //         await cloudinary.uploader.destory(user.coverImg.split("/").pop().split(".")[0]);
        //     }
        //     const uploadedResponse = await cloudinary.uploader.upload(coverImg)
        //     coverImg = uploadedResponse.secure_url;
        // }

        if(userName !== user.userName){
            const isExistUserName = await User.findOne({userName, _id:{$ne:req.user_id}})
            if(isExistUserName){
                return res.status(400).json({error: "Username Already Taken!"})
            }
        }

        if(email !== user.email){
            const isExistEmail = await User.findOne({email, _id:{$ne:req.user_id}})
            if(isExistEmail){
                return res.status(400).json({error: "Email Already Used!"})
            }
        }

        user.fillName = fullName || user.fullName;
        user.userName = userName || user.userName;
        user.email = email || user.email;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        user = await user.save();

        user.password = null;

        return res.status(200).json(user)

    }catch(error){
        console.log(`Error in Updateuser Controller : ${error}`)
        res.status(500).json({error: "Internal Server Error"})    
    }

}