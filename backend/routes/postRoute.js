import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  createPost,
  deletePost,
  createComment,
  likeUnlikePost,
  getAllPost,
  getLikedPosts,
  getFollowingPosts,
  getUserPosts,
} from "../controllers/postControllers.js";

const router = express.Router();

router.get("/all", protectRoute, getAllPost);
router.get("/likes/:id", protectRoute, getLikedPosts);
router.get("/following", protectRoute, getFollowingPosts);
router.get("/user/:userName", protectRoute, getUserPosts);
router.post("/create", protectRoute, createPost);
router.post("/likes/:id", protectRoute, likeUnlikePost);
router.post("/comment/:id", protectRoute, createComment);
router.delete("/:id", protectRoute, deletePost);

export default router;
