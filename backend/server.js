require('dotenv').config();
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
mongoose.connect(process.env.MONGO_URI)

.then(() => console.log('MongoDB connected succesfully'))
.catch(err => console.error('MongoDB connection error:', err));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}



app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, ts: Date.now() });
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
