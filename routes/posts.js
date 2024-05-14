const express = require("express");
const router = express.Router();
const postsControllers = require('../controllers/posts.js');
const handleErrorAsync = require("../statusHandle/handleErrorAsync");

router
  .get("/", handleErrorAsync(postsControllers.getPosts))
  .post("/", handleErrorAsync(postsControllers.createPost))
  .delete("/", handleErrorAsync(postsControllers.deletePosts))
  .delete("/:id", handleErrorAsync(postsControllers.deletePostById))
  .patch("/:id", handleErrorAsync(postsControllers.updatePostById));


module.exports = router;
