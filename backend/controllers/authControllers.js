import User from "../models/userModel.js"
import bcrypt from "bcryptjs"
//import genarateToken from "../utils/generateToken.js";

export const signup = async (req,res)=>{
    try{
        const {userName, fullName, email, password} = req.body;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if(!emailRegex.test(email)){
            return res.status(400).json({error : "Invalid Email Format"})
        }

        const existingEmail = await User.findOne({email}); /*check email is unique*/
        const existingUser = await User.findOne({userName});


        //validation Error
        if(existingEmail || existingUser || password.length < 6){
            let errorMsg = ""
            if(existingEmail){
                errorMsg = "Already Existing Email";
            }else if(existingUser){
                errorMsg = "Already Existing UserName";
            }else if(password.length < 6){
                errorMsg = "Password must have atleat 6 character";
            }
            return res.status(400).json({error : errorMsg})
        }

        //hashing password

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            userName,
            fullName,
            email,
            password : hashedPassword,
        })

        if(newUser){
            await newUser.save()
            res.status(200).json({
                _id        : newUser._id,
                userName   : newUser.userName,
                fullName   : newUser.fullName,
                email      : newUser.email,
                followers  : newUser.followers,
                following  : newUser.followers,
                profileImg : newUser.profileImg,
                coverImg   : newUser.coverImg,
                bio        : newUser.bio,
                link       : newUser.link
            })
        }else{
            res.status(400).json({error : "Invalid User Data"})
        }

    }catch(error){
        console.log(`Error in signup controller : ${error}`)
        res.status(400).json({error: 'Internal server Error'})
    }
}

export const login = (req,res)=>{
    res.send('login')
}

export const logout = (req,res)=>{
    res.send('logout')
}