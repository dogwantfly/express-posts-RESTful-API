const express = require("express");
const router = express.Router();
const postsControllers = require('../controllers/posts.js');

router
  .get("/", postsControllers.getPosts)
  .post("/", postsControllers.createPost)
  .delete("/all", postsControllers.deletePosts)
  .delete("/:id", postsControllers.deletePostById)
  .patch("/:id", postsControllers.updatePostById);


module.exports = router;
