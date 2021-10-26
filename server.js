require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns')
const fs = require('fs')
const validUrl = require('valid-url')
const shortid = require('shortid')

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req, res) {
  const { url } = req.body;
  const error = 'invalid url';
  console.log(url.split("/"))

  if (!validUrl.isUri(url)) {
    res.json({error});
  }

  const sp = url.split("/");

  let checker = (allURL) => {
    dns.lookup(sp[2], function(err, result) {
      if(err) res.json({error})
      else {
        allURL.push({
          original_url: [sp[0], "//", sp[2]].join(""),
          short_url: allURL.length + 1
        })

        fs.writeFileSync(path,JSON.stringify(allURL), {encoding: 'utf-8'})
        res.json(allURL[allURL.length - 1])
      }
    });
  }

  const path = __dirname + "/urls.json";
  if (fs.existsSync(path)){
    let urls = fs.readFileSync(path, {encoding: "utf-8"});
    urls = JSON.parse(urls);
    let checkURL = urls.filter(u => u["original_url"] === [sp[0], "//", sp[2]].join(""));
    if (checkURL.length){
      res.json(checkURL[0])
    } else {
      checker(urls);
    }
  } else {
    let urls = []
    checker(urls);
  }
});

app.get('/api/shorturl/:id', function(req, res) {
  const { id } = req.params;
  console.log(id)
  const error = 'invalid short url';
  const path = __dirname + "/urls.json";
  if (fs.existsSync(path)){
    let urls = fs.readFileSync(path, {encoding: "utf-8"});
    urls = JSON.parse(urls);
    let checkURL = urls.filter(u => u["short_url"] === +id)
    if (checkURL.length){
      res.redirect(checkURL[0]["original_url"]);
    } else {
      res.json({error});
    }
  } else {
    res.json({error});
  }
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
