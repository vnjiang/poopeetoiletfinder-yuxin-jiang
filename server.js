const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const sharedToiletRoute = require('./routes/sharedToiletRoute'); // 确保路径正确
const toiletRoute = require('./routes/toiletRoute'); 
const reviewRoute = require('./routes/reviewRoute'); 
const path = require('path');
const Toilet = require('./models/toilet');


const app = express();
const PORT = process.env.PORT || 5007;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// 提供构建后的静态文件
app.use(express.static(path.join(__dirname, 'build')));

//新加的
app.use('/models/toilets', toiletRoute); // 确保 API 路由配置正确

// 使用 sharedToiletRoute 路由，添加前缀
app.use('/routes/sharedToiletRoute', sharedToiletRoute);
//app.use('/~yj5/graduate-project/routes/toiletRoute', toiletRoute);
app.use('/routes/reviewRoute', reviewRoute);


mongoose.connect('mongodb://127.0.0.1:27017/graduate-project', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));


app.get('/models/toilets', async (req, res) => {
  try {
    console.log('Fetching toilets...');
    const toilets = await Toilet.find();
    res.json(toilets); // 返回厕所数据的 JSON 数组
  } catch (error) {
    console.error('Error fetching toilets:', error);
    res.status(500).json({ message: error.message });
  }
});


// 在所有其他路由之后添加这一部分，用于处理单页面应用 (SPA) 的所有请求
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
