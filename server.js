const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const app = express();
const appPort = process.env.PORT || 3000;
const mongoose = require("mongoose");
const db = require("./db.js");
const session = require("express-session");
const auth = require("./auth.js");
const ejs = require("ejs");

const Account = mongoose.model("Account");
const Report = mongoose.model("Report");
const Post = mongoose.model("Post");
const Reply = mongoose.model("Reply");

const { spawn } = require("child_process");

app.disable("x-powered-by");

/**
 * The following are middlewares.
 */
app.use(express.static("views"));
app.set("view engine", "ejs");
app.set("views", "./views");

app.use("/libs", express.static("bower_components"));
app.use(express.static("public"));
app.use(
  bodyParser({
    limit: "1mb",
  })
);
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(
  session({
    secret: "this is top secret",
    resave: true,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 60 * 1000,
    },
    rolling: true,
  })
);

app.use(auth.authRequired(["/post-public"]));

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

/**
 * The following are routes to render the html files
 */
app.get("/index", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/client", function (req, res) {
  res.sendFile(__dirname + "/public/client.html");
});

app.get("/education", function (req, res) {
  res.sendFile(__dirname + "/public/education.html");
});

app.get("/forum-view", function (req, res) {
  res.sendFile(__dirname + "/public/forumView.html");
});

app.get("/forum", function (req, res) {
  if (req.session.user) res.sendFile(__dirname + "/public/forum.html");
  else {
    res.redirect("/login");
  }
});

/**
 * The following are routes for depression diagnosis feature.
 */
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
    const python = spawn("python", ["getScore.py"]);
    // collect data from script
    python.stdout.on("data", function (data) {
      console.log("Pipe data from python script ...");
      dataToSend = data.toString().trim();
    });
    // in close event we are sure that stream from child process is closed
    python.on("close", async (code) => {
      console.log(`child process close all stdio with code ${code}`);
      console.log(typeof dataToSend);
      // send data to browser

      // save to database if session exists
      if (req.session.user) {
        // save to database
        try {
          const report = new Report({
            account: req.session.user._id,
            score: parseInt(dataToSend),
          });
          const savedReport = await report.save();
        } catch (err) {
          console.log("Could not save to database");
        }
      }
      res.send(JSON.stringify(dataToSend));
    });
  } else {
    res.send("NOSCORE");
  }
});
// end of image upload

/**
 * The following are routes for communication platform.
 */
// forum view
app.post("/forum", async (req, res) => {
  let searchBy = req.body.searchBy;
  let keyWord = req.body.keyWord;
  console.log(searchBy + " " + keyWord);
  // const posts = await Post.find({}).sort("-updatedAt");
  if (searchBy == "title") {
    const posts = await Post.find({ title: { $regex: keyWord } })
      .populate("account")
      .sort("-updatedAt");
    res.json({
      posts: posts,
    });
  } else if (searchBy == "author") {
    const posts = await Post.find({ name: { $regex: keyWord } })
      .populate("account")
      .sort("-updatedAt");
    res.json({
      posts: posts,
    });
  } else if (searchBy == "content") {
    const posts = await Post.find({ content: { $regex: keyWord } })
      .populate("account")
      .sort("-updatedAt");
    res.json({
      posts: posts,
    });
  } else {
    const posts = await Post.find().populate("account").sort("-updatedAt");
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

    try {
      const post = new Post({
        account: req.session.user._id,
        title: req.body.fname,
        content: req.body.content.trim(),
      });
      await post.save();
    } catch (err) {
      console.log("could not save to database ", err);
    }
    // here save the post to the database
    res.send("TEXTRECEIVED1");
  }
});

app.get("/replies", async (req, res) => {
  const replies = await Reply.find({ post: req.query.postId })
    .populate("account")
    .sort("-createdAt");
  res.send(replies);
});

app.post("/reply", async (req, res) => {
  if (req.body.content !== "") {
    let replyContent = req.body.content;
    console.log(replyContent);
    try {
      const reply = new Reply({
        account: req.session.user._id,
        post: req.body.post,
        content: req.body.content.trim(),
      });
      await reply.save();
    } catch (err) {
      console.log("could not save to database ", err);
    }
    res.send("Received reply!");
  }
});
// end of forum

/**
 * The following are routes for login and register.
 */
app.get("/register", (req, res) => {
  res.render("register", { errMsg: {} });
});

app.post("/register", (req, res) => {
  const { email, name, password, re_password } = req.body;
  const nameReg = /^[a-zA-Z0-9\u4E00-\u9FA5\uF900-\uFA2D]*$/;
  const passwordReg = /^[a-zA-Z0-9_@#.+&]{6,20}$/;

  const errMsg = {};
  if (!nameReg.test(name)) {
    errMsg.nickErr = "Invalid nickname";
  }
  if (!passwordReg.test(password)) {
    errMsg.passwordErr = "Invalid password format (6-20 chars)";
  }
  if (password !== re_password) {
    errMsg.rePasswordErr = "Passwords don't match";
  }
  if (JSON.stringify(errMsg) !== "{}") {
    res.render("register", { errMsg });
    return;
  }

  function success(newUser) {
    auth.startAuthenticatedSession(req, newUser, (err) => {
      if (!err) {
        var email = encodeURIComponent(newUser.email);
        res.redirect("/login?email=" + email);
      } else {
        console.log("session error");
      }
    });
  }

  function error(err) {
    errMsg.emailErr = err.message ?? "Registration error";
    res.render("register", { errMsg });
  }

  // attempt to register new user
  auth.register(
    req.body.name,
    req.body.password,
    req.body.email,
    error,
    success
  );
});

app.get("/login", (req, res) => {
  const { email } = req.query;
  res.render("login", { errMsg: { email } });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const passwordReg = /^[a-zA-Z0-9_@#.+&]{6,20}$/;
  const errMsg = {};
  if (!passwordReg.test(password)) {
    errMsg.passwordErr = "Password format invalid";
  }
  if (JSON.stringify(errMsg) !== "{}") {
    res.render("login", { errMsg });
    return;
  }

  function success(user) {
    auth.startAuthenticatedSession(req, user, (err) => {
      if (err) {
        console.log("error starting auth sess: " + err);
      } else {
        req.session._id = user._id.toString();
        req.session.email = user.email;
        res.redirect("./index");
      }
    });
  }

  function error(err) {
    console.log(err);
    errMsg.loginErr = err.message || "Login unsuccessful";
    res.render("login", { errMsg });
  }

  // attempt to login
  auth.login(req.body.email, req.body.password, error, success);
});

app.post("/logout", (req, res) => {
  auth.endAuthenticatedSession(req, (err) => {
    if (err) {
      res.json({ message: "error ending auth sess: " + err });
    } else {
      res.redirect("/");
    }
  });
});

/**
 * The following is the route for the user center.
 */
app.get("/user-center", async (req, res) => {
  const { _id } = req.session;
  if (_id) {
    try {
      const user = await Account.findOne({ _id });
      if (user) {
        const reports = await Report.find({ account: _id }).sort("-createdAt");
        console.log(reports);
        res.render("userCenter", {
          name: user.name,
          email: user.email,
          reports: reports,
        });
      }
    } catch (error) {
      res.redirect("/login");
    }
  } else {
    res.redirect("/login");
  }
});

/**
 * The following is the route to check the current session user.
 */
app.get("/session", (req, res) => {
  if (req.session.user) {
    res.send(req.session.user.name);
  } else res.send(null);
});

app.listen(appPort, () => {
  console.log(`The server is up and running on ${appPort} port.`);
});
