/**
 * For the sake of time, I've not organized the code structure.
 */

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const MountAPI = require('./routes')

const PORT = 8080;

// DB - Usually would be separated
mongoose.connection.on("error", (err) => {
  console.log('ERR.MONGOOSE:', err);
  process.exit(-1);
})

try {
  mongoose.connect(`mongodb://shubham:pass123@ds119736.mlab.com:19736/dating-app-db`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
} catch(err) {
  console.log('ERR.MONGOOSE.CONNECT:', err);
  process.exit(-1);
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

MountAPI(app);

app.listen(PORT, () => console.log('Listening at: localhost:', PORT))