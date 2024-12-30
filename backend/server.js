import express from "express"
import dotenv from "dotenv"
import connectDB from "./db/connectDB.js"
import authRoute from "./routes/authRoute.js"
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000;

app.use(express.json())

app.use('/api/auth', authRoute)

app.listen(PORT,()=>{
    console.log(`Server is Running on PORT : ${PORT}`);
    connectDB()
})