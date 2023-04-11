const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const app = new express();
const appPort = process.env.PORT || 3000;
const mongoose = require("mongoose");
const db = require("./db.js");
const path = require('path');
const expressEdge = require("express-edge");

const Account = mongoose.model("Account");
const Report = mongoose.model("Report");
const Post = mongoose.model("Post");
const Reply = mongoose.model("Reply");

const { spawn } = require('child_process');

const cors = require("cors");
const cookieSession = require("cookie-session");



app.use("/libs", express.static("bower_components"));
app.use(express.static("public"));



app.use(
  bodyParser({
    limit: "1mb",
  })
);
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.set('view engine','ejs')
app.set('views','./views')

//引入UI路由器
const UIRouter = require('./router/UIRouter')
//引入登录注册路由器
const loginRegisterRouter = require('./router/loginRegisterRouter')


//如下代码是配置express中操作session
//引入express-session，用于在express中简化操作session
const session = require('express-session');
//引入connect-mongo，用于做session持久化
const MongoStore = require('connect-mongo')(session);

app.use(session({
  name: 'peiqi',   //返回给客户端cookie的key。
  secret: 'atguigu', //参与加密的字符串（又称签名）
  saveUninitialized: false, //是否在存储内容之前创建session会话
  resave: false ,//是否在每次请求时，强制重新保存session，即使他们没有变化（比较保险）
  store: new MongoStore({
    url: 'mongodb://localhost:27017/sessions_container',
    touchAfter: 24 * 3600 //修改频率（例：//在24小时之内只更新一次）
  }),
  cookie: {
    httpOnly: true, // 开启后前端无法通过 JS 操作cookie
    maxAge: 1000*30 // 设置cookie的过期时间,cookie的key，cookie的value，均不在此处配置。
  },
}));


app.use(UIRouter())
  //使用loginRegisterRouter
  app.use(loginRegisterRouter())


// image upload
app.post("/upload", (req, res) => {
  console.log("upload...");
  if (req.body.theFile !== "") {
    console.log("received uploaded image!!");
    let theFileString = req.body.theFile;
    let theFileName = req.body.name;
    theFileString = theFileString.replace(/data:image\/(png|jpeg);base64,/, "");
    // console.log('the file string ' + theFileString);
    fs.writeFileSync("images/" + theFileName, theFileString, {
      encoding: "base64",
    });
    // here you would calculate the depression score and store the depression score in the database
  }
  res.send("UPLOADED");
});

// image upload instant removal
app.post("/img-instant-removal", (req, res) => {
  if (req.body.content !== "") {
    console.log("received image instant removal request!!");

    var filePath = "images/" + req.body.name;
    fs.unlinkSync(filePath);
  }
  res.send("IMAGEREMOVED1");
});

app.post("/diagnosis", (req, res) => {
  if (req.body.content !== "") {
    console.log("received diagnosis request!!");
    var filePath = "images/" + req.body.name;
    console.log("the file for diganosis: " + filePath);
  }
  if (fs.existsSync(filePath)) {
    var dataToSend;
    // spawn new child process to call the python script
    // !! IMPORTANT !! To run Python script with arguments
    // refer to https://stackoverflow.com/questions/62450826/run-python-script-from-node-js-child-process-with-named-arguments
    const python = spawn('python', ['script1.py']);
    // collect data from script
    python.stdout.on('data', function (data) {
      console.log('Pipe data from python script ...');
      dataToSend = data.toString();
    });
    // in close event we are sure that stream from child process is closed
    python.on('close', (code) => {
      console.log(`child process close all stdio with code ${code}`);
      console.log(typeof (dataToSend));
      // send data to browser
      res.send(dataToSend);
    });
  } else {
    res.send("NOSCORE");
  }
});
// end of image upload

// forum view
app.post("/forum", async (req, res) => {
  let searchBy = req.body.searchBy;
  let keyWord = req.body.keyWord;
  console.log(searchBy + " " + keyWord);
  // const posts = await Post.find({}).sort("-updatedAt");
  if (searchBy == "title") {
    const posts = await Post.find({ title: { $regex: keyWord } }).sort("-updatedAt");
    res.json({
      posts: posts,
    });
  } else if (searchBy == "author") {
    const posts = await Post.find({ author: { $regex: keyWord } }).sort("-updatedAt");
    res.json({
      posts: posts,
    });
  } else if (searchBy == "content") {
    const posts = await Post.find({ content: { $regex: keyWord } }).sort("-updatedAt");
    res.json({
      posts: posts,
    });
  } else {
    const posts = await Post.find().sort("-updatedAt");
    res.json({
      posts: posts,
    });
  }
});
// end of forum view

// forum
app.post("/post-public", async (req, res) => {
  console.log("taking text...");
  if (req.body.content !== "") {
    console.log("received text!!");

    let textContent = req.body.content;
    console.log(textContent);

    // we need to get the current user first through the request body
    const post = new Post({
      account: null,
      title: req.body.fname,
      content: req.body.content.trim(),
    });
    const savedPost = await post.save();
    // here save the post to the database
  }
  res.send("TEXTRECEIVED1");
});
// end of forum

//education section

app.get('/education', (req, res) => {
  //res.render('index_education');
  res.sendFile(path.resolve(__dirname, 'pages_education\\index_education.html'));
});





app.get('/education/contact', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'pages_education\\contact_education.html'));
});

app.get('/education/articles', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'pages_education\\articles_education.html'));
});

app.get('/education/articles/new', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'pages_education\\post_article_education.html'));
  
});



app.listen(process.env.PORT || 3000, () => {
  console.log(`The server is up and running on ${appPort} port.`);
});

