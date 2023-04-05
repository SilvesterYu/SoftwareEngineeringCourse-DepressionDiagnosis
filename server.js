const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const app = express();
const appPort = process.env.PORT || 3000;
const mongoose = require("mongoose");
const db = require("./db.js");
const path = require('path');

const Account = mongoose.model("Account");
const Report = mongoose.model("Report");
const Post = mongoose.model("Post");
const Reply = mongoose.model("Reply");

app.use("/libs", express.static("bower_components"));
app.use(express.static("public"));

app.use(
  bodyParser({
    limit: "1mb",
  })
);
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

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
  } else {
    console.log("!!!!!");
  }

  res.send("UPLOADED");
});

// image upload instant removal
app.post("/img-instant-removal", (req, res) => {
  if (req.body.content !== "") {
    console.log("received image instant removal request!!");

    var filePath = "images/" + req.body.name;
    fs.unlinkSync(filePath);
  } else {
    console.log("!!!!!imageInstantRemoval");
  }

  res.send("IMAGEREMOVED1");
});

app.get("/forum", async (req, res) => {
  const posts = await Post.find({}).sort("-updatedAt");
  res.json({
    posts: posts,
  });
});

// forum
app.post("/post-public", async (req, res) => {
  console.log("taking text...");
  if (req.body.content !== "") {
    console.log("received text!!");

    let textContent = req.body.content;
    console.log(textContent);

    /*
    fs.writeFileSync("forum/" + req.body.fname + ".txt", textContent, {
      encoding: "utf8",
      flag: "a+",
      mode: 0o666,
    });*/
    // we need to get the current user first through the request body
    const post = new Post({
      account: null,
      title: req.body.fname,
      content: req.body.content.trim(),
    });
    const savedPost = await post.save();
    // here save the post to the database
  } else {
    console.log("!!!!!text");
  }

  res.send("TEXTRECEIVED1");
});
// end of forum

//education section

app.get('/education', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'pages_education\\index_education.html'));
});



app.get('/education/contact', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'pages_education\\contact_education.html'));
});

app.get('/education/articles', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'pages_education\\articles_education.html'));
});


app.listen(process.env.PORT || 3000, () => {
  console.log(`The server is up and running on ${appPort} port.`);
});

// "scripts": {
//     /*"start": "nodemon server",*/
//     "start": "node server.js",
