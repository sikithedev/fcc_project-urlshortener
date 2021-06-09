require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const url = require('url');
const app = express();


// Basic Configuration
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

const urlSchema = new mongoose.Schema({ url: String, short_url: Number });
const Url = mongoose.model('Url', urlSchema);

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async (req, res) => {
  const originalUrl = req.body.url;
  const numUrls = await Url.estimatedDocumentCount() || 0;

  dns.lookup(url.parse(originalUrl).hostname, (err, address) => {
    if (!address) {
      res.json({ error: 'Invalid URL' })
    } else {
      const url = new Url({ url: originalUrl, short_url: numUrls + 1 });

      url.save((err, data) => {
        res.json({ original_url: data.url, short_url: data.short_url });
      });
    }
  });
});

app.get('/api/shorturl/:id', async (req, res) => {
  await Url.findOne({ short_url: req.params.id }, (err, data) => {
    if (!data) {
      res.json({ error: "No short URL found for the given input" });
    } else {
      res.redirect(data.url);
    }
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
