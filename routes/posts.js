const express = require("express");

const router = express.Router();


const postsRouteHandlers = require('../controllers/posts.js');
const { getPosts, createPost, deletePosts, deletePostById, updatePostById } =
  postsRouteHandlers;

router.delete("/all", deletePosts);
router
  .get("/", getPosts)
  .post("/", createPost)
  .delete("/:id", deletePostById)
  .patch("/:id", updatePostById);


module.exports = router;
