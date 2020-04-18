const Controllers = require('../controllers')

module.exports = app => {
  app.use('/', Controllers())
}