const express = require('express');
const router = express.Router();
const postsControllers = require('../controllers/posts.js');
const handleErrorAsync = require('../statusHandle/handleErrorAsync');
const { isAuth } = require('../statusHandle/auth');

router
  .get('/', isAuth, handleErrorAsync(postsControllers.getPosts))
  .post('/', isAuth, handleErrorAsync(postsControllers.createPost))
  .delete('/', isAuth, handleErrorAsync(postsControllers.deletePosts))
  .delete('/:id', isAuth, handleErrorAsync(postsControllers.deletePostById))
  .patch('/:id', isAuth, handleErrorAsync(postsControllers.updatePostById));

module.exports = router;
