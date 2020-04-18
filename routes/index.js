const Controllers = require('../controllers')

module.exports = (app, upload, io) => {
  app.use('/', Controllers(upload, io))
}