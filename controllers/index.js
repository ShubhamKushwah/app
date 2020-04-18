const Router = require('express').Router();

module.exports = () => {
  // Authentication usually would be a separate set of routes, and services
  Router.post('/signup', (req, res) => {
    console.log('SB:', req.body);
    res.status(200).json({ status: 200, message: 'Works!' })
  });

  return Router;
}