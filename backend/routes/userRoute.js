import express from "express"
const router = express.Router()
import protectRoute from "../middleware/protectRoute.js"
import { getProfile, followUnFollowUser, getSuggestedUsers, updateUser } from "../controllers/userControllers.js"

router.get("/profile/:userName", protectRoute, getProfile)
router.post("/follow/:id", protectRoute, followUnFollowUser)
router.get("/suggested", protectRoute, getSuggestedUsers)
router.post("/update", protectRoute, updateUser)

export default router