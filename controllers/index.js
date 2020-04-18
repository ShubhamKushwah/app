const Router = require('express').Router();
const AuthSchema = require('../schemas/auth');
const Bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

// This should be in the config file
const JWT_SECRET = 'mac_is_better_than_windows_#$^&%F';

const CheckLogin = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token || token == undefined) return res.status(401).json({ status: 401, message: 'Unauthorized!' });
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log(err, decoded);
        return res.status(401).json({
          status: 401, message: 'Unauthorized Access Denied! Please login!'
        })
      }
      req.user = decoded;
      next();
    })
  } catch (err) {
    console.log(err);
  }
}

module.exports = (upload, io) => {
  // Authentication usually would be a separate set of routes, and services
  Router.post('/signup', (req, res) => {
    const { email, password } = req.body;
    Bcrypt.hash(password, 11, (err, password_hash) => {
      if (err) {
        console.log(err);
        return res.status(500);
      }
      const auth = new AuthSchema({
        email,
        password_hash
      });
      auth.save().then(result => {
        return res.status(200).json({ status: 200, message: 'Account Successfully created!' })
      }).catch(err => {
        console.log('Auth Err:', err);
        return res.status(500).json({ status: 500, message: 'Something went wrong!' })
      })
    })
  });

  Router.post('/login', (req, res) => {
    const { email, password } = req.body;
    AuthSchema.find({ email }).then(auth_res => {
      console.log('Login Auth:', auth_res[0])
      if (!auth_res.length) {
        return res.status(404).json({ status: 404, message: 'No Account exists with that email. Please signup!' });
      }
      Bcrypt.compare(password, auth_res[0].password_hash, (err, is_same) => {
        if (err) {
          console.log(err);
          return res.status(500);
        }
        if (!is_same) {
          return res.status(400).json({ status: 400, message: 'Wrong password, please try again!' })
        }
        jwt.sign({
          email,
          _id: auth_res[0]._id
        }, JWT_SECRET, (err2, token) => {
          if (err2) {
            return res.status(500);
          }
          return res.status(200).json({ status: 200, message: 'Success!', result: { _id: auth_res[0]._id, token, profile_image: auth_res[0].profile_image } });
        })
      })
    }).catch(err => {
      console.log(err);
      return res.status(500);
    })
  });

  Router.post('/upload', CheckLogin, (req, res) => {
    console.log('Uploading...');
    upload(req, res, (err) => {
      if (err) return res.status(500);
      let profile_image = req.files[0].path;
      profile_image = profile_image.slice(7);
      profile_image = `http://localhost:8080/${profile_image}`;
      AuthSchema.findOneAndUpdate({ email: req.user.email }, { $set: { profile_image } }).then(result => {
        console.log('Successfully updated profile image!');
        return res.status(200).json({ status: 200, message: 'Successfully uploaded!', result: { profile_image } });
      }).catch(err => {
        console.log(err);
        return res.status(500)
      })
    })
  })

  Router.get('/feed', CheckLogin, (req, res) => {
    // _id: { $nin: currentUser.blocks }
    AuthSchema.findById(req.user._id).then(currentUser => {
      AuthSchema.find({ blocks: { $ne: req.user._id }, email: { $not: { $eq: req.user.email } }, profile_image: { $not: { $eq: null } } }).select('profile_image').then(result => {
        return res.status(200).json({ status: 200, message: 'Success!', result })
      }).catch(err => {
        console.log(err);
        return res.status(500);
      })
    }).catch(err => {
      console.log(err);
      return res.status(500)
    })
  })

  Router.get('/like/:account', CheckLogin, (req, res) => {
    const { account } = req.params;
    AuthSchema.findById(req.user._id).then(currentUser => {
      io.emit(account, { email: currentUser.email })
      let likes = [];
      if (currentUser.likes) {
        likes = [...currentUser.likes, account];
      } else {
        likes.push(account)
      }
      AuthSchema.updateOne({ _id: req.user._id }, { $set: { likes } }).then(result => {
        return res.status(200).json({ status: 200, message: 'Success!' })
      }).catch(err => {
        console.log(err)
      })
    }).catch(err => {
      console.log(err);
    })
  })

  Router.get('/superlike/:account', CheckLogin, (req, res) => {
    const { account } = req.params;
    AuthSchema.findById(req.user._id).then(currentUser => {
      io.emit(account, { email: currentUser.email, profile_image: currentUser.profile_image })
      let superlikes = [];
      if (currentUser.superlikes) {
        superlikes = [...currentUser.superlikes, account];
      } else {
        superlikes.push(account)
      }
      console.log(superlikes)
      AuthSchema.updateOne({ _id: req.user._id }, { $set: { superlikes } }).then(result => {
        console.log('UR Super!')
      }).catch(err => {
        console.log(err)
      })
    }).catch(err => {
      console.log(err);
    })
    return res.status(200).json({ status: 200, message: 'Success!' })
  })

  Router.get('/block/:account', CheckLogin, (req, res) => {
    const { account } = req.params;
    console.log(req.params, req.user._id);
    AuthSchema.findById(req.user._id).then(currentUser => {
      let blocks = [];
      if (currentUser.blocks) {
        blocks = [...currentUser.blocks, account];
      } else {
        blocks.push(account)
      }
      console.log(blocks)
      AuthSchema.updateOne({ _id: req.user._id }, { $set: { blocks } }).then(result => {
        console.log('UR Super!')
      }).catch(err => {
        console.log(err)
      })
    }).catch(err => {
      console.log(err);
    })
    return res.status(200).json({ status: 200, message: 'Success!' })
  })

  return Router;
}