/**
 * For the sake of time, I've not organized the code structure.
 */

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const multer = require('multer');
const app = express();
const MountAPI = require('./routes');
const cors = require('cors');
const path = require('path');

const PORT = 8080;

app.use(morgan('dev'));

// DB - Usually would be separated
mongoose.connection.on("error", (err) => {
  console.log('ERR.MONGOOSE:', err);
  process.exit(-1);
})

try {
  mongoose.connect(`mongodb://shubham:pass123@ds119736.mlab.com:19736/dating-app-db`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }, () => {
    console.log('DB Connected!')
  })
} catch (err) {
  console.log('ERR.MONGOOSE.CONNECT:', err);
  process.exit(-1);
}

const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 3145728 },
}).any();

app.use(express.static('./public'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const server = app.listen(PORT, () => console.log('Listening at: localhost:', PORT))
const io = require('socket.io')(server);

io.on('connection', socket => {
  console.log('A User Connected!');
})

MountAPI(app, upload, io);