const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const sharedToiletRoute = require('./routes/sharedToiletRoute');
const toiletRoute = require('./routes/toiletRoute'); 
const reviewRoute = require('./routes/reviewRoute'); 
const path = require('path');


const app = express();
const PORT = process.env.PORT || 5007;

app.use(cors());
app.use(express.json());

// Set up routes
app.use('/routes/toiletRoute', toiletRoute); 
app.use('/routes/sharedToiletRoute', sharedToiletRoute);
app.use('/routes/reviewRoute', reviewRoute);

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/graduate-project')
// 如果 MongoDB 容器名为 'mongodb'
//mongoose.connect('mongodb://172.17.0.2:27017/graduate-project')
.then(() => console.log('MongoDB connected succesfully'))
.catch(err => console.error('MongoDB connection error:', err));

app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
