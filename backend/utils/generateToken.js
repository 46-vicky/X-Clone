import jwt from "jsonwebtoken"

const generateToken = (userId, res)=>{
    const token = jwt.sign({userId},)
}