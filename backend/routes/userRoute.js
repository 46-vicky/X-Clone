import express from "express"
const router = express.Router()
import protectRoute from "../middleware/protectRoute.js"
import { getProfile,followUnFollowUser } from "../controllers/userControllers.js"

router.get("/profile/:userName", protectRoute, getProfile)
router.post("/follow/:id", protectRoute, followUnFollowUser)

export default router