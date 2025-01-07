import cloudinary from "cloudinary"
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";

export const createPost = async (req, res)=>{
    try{
        const {text} = req.body;
        let {img} = req.body;

        const userId = req.user._id.toString();

        const user = await User.findOne({_id : userId})

        if(!user){
            return res.status(404).json({error : "User Not Found"})
        }

        if(!text && !img){
            return res.status(400).json({error : "Post must Have Text or Image"})
        }

        if(img){
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }

        const newPost = new Post({
            user : userId,
            text,
            img
        })

        await newPost.save()
        res.status(201).json(newPost)

    }catch(error){
        console.log(`Error in Create Post Controller ${error}`)
        res.status(500).json({error : "Internal Server Error"})
    }
}

export const deletePost = async (req, res)=>{
    try{
        const {id} = req.params;
        const post = await Post.findOne({_id:id})
        if(!post){
            return res.status(404).json({error:"Post Not Found"})
        }
        if(post.user.toString() !== req.user._id.toString()){
            return res.status(401).json({error:"You are Not authorized to Delete Post"})
        }
        if(post.img){
            const imgId = post.img.split("/").pop().split(".")[0]
            await cloudinary.uploader.destroy(imgId)
        }

        await Post.findByIdAndDelete({_id:id})
        res.status(200).json({message : "Post Deleted Successfully!"})

    }catch(error){
        console.log(`Error in Deleting Post Controller ${error}`)
        res.status(500).json({error : "Internal Server Error"})
    }
}

export const createComment = async (req, res)=>{
    try{
        const {text} = req.body
        const {id} = req.params;
        const userId = req.user._id

        if(!text){
            return res.status(400).json({error : "Comment Text is Required"})
        }

        const post = await Post.findOne({_id: id});

        if(!post){
            return res.status(404).json({erroe : "Post Not Found"})
        }
        const comment = {
            user : userId,
            text,
        }

        post.comments.push(comment);

        await post.save()

        const updatedComment = post.comments

        const newNotification =  new Notification({
            type: "comment",
            from : userId,
            to : post.user
        })
        await newNotification.save();

        res.status(200).json(updatedComment);

    }catch(error){
        console.log(`Error in Comment Post Controller ${error}`)
        res.status(500).json({error : "Internal Server Error"})
    }
}

export const likeUnlikePost = async (req, res)=>{
    try{
        const userId = req.user._id;
        const { id } = req.params;

        const post = await Post.findOne({_id: id})

        if(!post){
            return res.status(404).json({error : "Post Not Found"})
        }

        const userLikePost = post.likes.includes(userId)

        if(userLikePost){
            await Post.updateOne({_id : id},{$pull : {likes : userId}})
            await User.updateOne({_id : userId},{$pull : {likedPosts : id}})

            const updatedLikes = post.likes.filter((id)=>id.toString() !== userId.toString())
            res.status(200).json(updatedLikes)
        }else{
            post.likes.push(userId)
            await Post.updateOne({_id : id},{$push : {likes : userId}})
            await User.updateOne({_id : userId},{$push : {likedPosts : id}})

            const notification = new Notification({
                from : userId,
                to : post.user,
                type : "like"
            })

            await notification.save();
            const updatedLikes = post.likes;
            res.status(200).json(updatedLikes)
        }


    }catch(error){
        console.log(`Error in Like and Unlike Controller ${error}`)
        res.status(500).json({error : "Internal Server Error"})
    }
}

export const getAllPost = async (req, res)=>{
    try{
        const posts = await Post.find().sort({createdAt : -1}).populate({
            path : "user",
            select : ["-password","-email","-following","-link","-follower","-bio"]
        })
        .populate({
            path : "comments.user",
            select : ["-password","-email","-following","-link","-follower","-bio"]
        })
        if(posts.length === 0){
            return res.status(200).json([])
        }
        res.status(200).json(posts)
    }catch(error){
        console.log(`Error in Get All Post Controller ${error}`)
        res.status(500).json({error : "Internal Server Error"})  
    }
}

export const getLikedPosts = async (req, res)=>{
    try{

        const {id} = req.params
        const user = await User.findOne({_id : id})

        if(!user){
            return res.status(404).json({error : "User Not Found"})
        }

        const likedPosts = await Post.find({_id: {$in : user.likedPosts}}).populate({
            path : 'user',
            select : ["-password","-email","-following","-link","-follower","-bio"]
        })
        .populate({
            path : "comments.user",
            select : ["-password","-email","-following","-link","-follower","-bio"]
        })

        res.status(200).json(likedPosts)
    }catch(error){
        console.log("Error in Get Liked Posts Controller");
        res.status(500).json({error : "Internal Server Error"})
    }
}

export const getFollowingPosts = async (req, res)=>{
    try{
        const userId = req.user._id;

        const user = await User.findById(userId)

        if(!user){
            res.status(404).json({error : "User Not Found"})
        }

        const following = await user.following;
        
        const feedPosts = await Post.find({user : {$in : following}}).sort({createdAt : -1}).populate({
            path : "user",
            select : "-password"
        })
        .populate({
            path : "comments.user",
            select : "-password"
        })

        res.status(200).json(feedPosts);

    }catch(error){
        console.log("Error in Get Following Posts Controller");
        res.status(500).json({error : "Internal Server Error"})
    }
}

export const getUserPosts = async(req, res)=>{
    try{

        const {userName} = req.params;

        const user = await User.findOne({userName});

        if(!user){
           return res.status(404).json({error : "User Not Found"})
        }

        const usersPost = await Post.find({user : user._id}).sort({craetedAt : -1}).populate({
            path : "user",
            select : "-password"
        })
        .populate({
            path : "comments.user",
            select : "-password"
        })

        res.status(200).json(usersPost)
    }catch(error){
        console.log("Error in Get Users Posts Controller");
        res.status(500).json({error : "Internal Server Error"})
    }
}