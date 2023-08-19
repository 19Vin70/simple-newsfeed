const express = require('express');
const multer = require('multer');
const fs = require('fs');
const app = express();
const port = 3000;

app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(express.static('public'));
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

const dataFilePath = 'data.json';

function readDataFromFile() {
  try {
    const data = fs.readFileSync(dataFilePath);
    return JSON.parse(data);
  } catch (error) {
    return { posts: [] };
  }
}

function writeDataToFile() {
  fs.writeFileSync(dataFilePath, JSON.stringify(postsData, null, 2));
}

const postsData = readDataFromFile();

app.post('/post', upload.single('image'), (req, res) => {
  const { content, userName } = req.body;
  const imageUrl = req.file ? req.file.filename : null;
  const post = { content, imageUrl, comments: [], reactions: { heart: 0 }, userName };
  postsData.push(post);

  writeDataToFile();

  res.json({ success: true });
});

app.get('/posts', (req, res) => {
  res.json(postsData);
});

app.post('/comment/:postId', (req, res) => {
  const { postId } = req.params;
  const { comment } = req.body;
  postsData[postId].comments.push(comment);

  writeDataToFile();

  res.json({ success: true });
});

app.post('/react/:postId', (req, res) => {
  const { postId } = req.params;
  const { reactionType } = req.body;
  postsData[postId].reactions[reactionType]++;

  writeDataToFile();

  res.json({ success: true });
});

app.delete('/delete/:postId', (req, res) => {
  const { postId } = req.params;
  postsData.splice(postId, 1);

  writeDataToFile();

  res.json({ success: true });
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
