const express = require('express');
const router = express.Router();
const postsControllers = require('../controllers/posts.js');
const handleErrorAsync = require('../statusHandle/handleErrorAsync');
const { isAuth } = require('../statusHandle/auth');

router
  .get('/', isAuth, handleErrorAsync(postsControllers.getPosts))
  .get('/:postId', isAuth, handleErrorAsync(postsControllers.getPostById))
  .post('/', isAuth, handleErrorAsync(postsControllers.createPost))
  .delete('/', isAuth, handleErrorAsync(postsControllers.deletePosts))
  .delete('/:id', isAuth, handleErrorAsync(postsControllers.deletePostById))
  .patch('/:id', isAuth, handleErrorAsync(postsControllers.updatePostById))
  .post('/:postId/like', isAuth, postsControllers.likePost)
  .delete('/:postId/unlike', isAuth, postsControllers.unlikePost)
  .post('/:postId/comment', isAuth, postsControllers.addComment)
  .get('/user/:userId', isAuth, postsControllers.getUserPosts);

module.exports = router;
