import express from "express"
import dotenv from "dotenv"
import connectDB from "./db/connectDB.js"
import authRoute from "./routes/authRoute.js"
import userRoute from "./routes/userRoute.js"
import postRoute from "./routes/postRoute.js"
import notificationRoute from "./routes/notificationRoute.js"
import cookieParser from "cookie-parser"
import cloudniary from "cloudinary"
import cors from "cors"

dotenv.config()

cloudniary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET_KEY
})

const app = express()
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin : "http://localhost:3000",
    credentials : true
}))

app.use(express.json(
    {
        limit : "5mb"
    }
))
app.use(cookieParser())
app.use(express.urlencoded({
    extended:true
}))

app.use('/api/auth', authRoute)
app.use('/api/users', userRoute)
app.use('/api/posts', postRoute)
app.use('/api/notifications', notificationRoute)

app.listen(PORT,()=>{
    console.log(`Server is Running on PORT : ${PORT}`);
    connectDB()
})