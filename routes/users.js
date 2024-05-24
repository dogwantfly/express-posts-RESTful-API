const express = require('express');
const router = express.Router();
const handleErrorAsync = require('../statusHandle/handleErrorAsync');
const { isAuth } = require('../statusHandle/auth');
const UserControllers = require('../controllers/users.js');

router.post('/sign_up', handleErrorAsync(UserControllers.signUp));

router.post('/sign_in', handleErrorAsync(UserControllers.signIn));

router.post(
  '/updatePassword',
  isAuth,
  handleErrorAsync(UserControllers.updatePassword)
);

router.get('/profile', isAuth, handleErrorAsync(UserControllers.getProfile));

router.patch(
  '/profile',
  isAuth,
  handleErrorAsync(UserControllers.updateProfile)
);

router.post(
  '/:userId/follow',
  isAuth,
  handleErrorAsync(UserControllers.followUser)
);

router.delete('/:userId/unfollow', isAuth, UserControllers.unfollowUser);

router.get('/getLikeList', isAuth, UserControllers.getLikeList);

router.get('/following', isAuth, UserControllers.getFollowingList);

module.exports = router;
