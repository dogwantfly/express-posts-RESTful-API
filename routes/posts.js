const express = require("express");

const router = express.Router();


const postsRouteHandlers = require('../controllers/posts.js');
const { getPosts, createPost, deletePosts, deletePostById, updatePostById } =
  postsRouteHandlers;


router
  .get("/", getPosts)
  .post("/", createPost)
  .delete("/all", deletePosts)
  .delete("/:id", deletePostById)
  .patch("/:id", updatePostById);


module.exports = router;
