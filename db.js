const fs = require("fs");
const path = require("path");
const url = require("url");
const mongoose = require("mongoose");
const mongooseSlugPlugin = require("mongoose-slug-plugin");

//mongoose.set('useCreateIndex',true) //使用一个新的索引创建器

const DB_NAME = 'atguigu' //数据库名
const PORT = 27017 //端口号
const IP = 'localhost' //主机名(ip地址)



//mongoose.set('useCreateIndex',true) //使用一个新的索引创建器


//const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const AccountSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true },
    password: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    role: {
      type: String,
      required: true,
      default: "user",
      enum: ["user", "admin"],
    },
    reports: [{ type: mongoose.Schema.Types.ObjectId, ref: "Report" }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  },
  { timestamps: true }
);

const ReportSchema = new mongoose.Schema(
  {
    account: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    score: { type: Number },
    description: { type: String },
    starred: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const PostSchema = new mongoose.Schema(
  {
    account: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    title: { type: String, required: true },
    content: { type: String },
    type: {
      type: String,
      default: "regular",
      enum: ["regular", "announcement"],
    },
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reply" }],
  },
  { timestamps: true }
);

const ReplySchema = new mongoose.Schema(
  {
    account: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    content: { type: String, required: true },
  },
  { timstamps: true }
);

AccountSchema.plugin(mongooseSlugPlugin, { tmpl: "<%=username%>" });

mongoose.model("Account", AccountSchema);
mongoose.model("Report", ReportSchema);
mongoose.model("Post", PostSchema);
mongoose.model("Reply", ReplySchema);

let dbconf;
if (process.env.NODE_ENV === "PRODUCTION") {
  // if we're in PRODUCTION mode, then read the configration from a file
  // use blocking file io to do this...
  const fn = path.join(__dirname, "config.json");
  const data = fs.readFileSync(fn);

  // our configuration file will be in json, so parse it and set the
  // conenction string appropriately!
  const conf = JSON.parse(data);
  dbconf = conf.dbconf;
} else {
  // if we're not in PRODUCTION mode, then use
  // dbconf = "mongodb://localhost/depression-diagnosis-js";
  //dbconf = "mongodb://127.0.0.1:27017/depression-diagnosis-js"
  //dbconf = 'mongodb://localhost:27017/sessions_container'
  dbconf = `mongodb://${IP}:${PORT}/${DB_NAME}`
}



//mongoose.connect(dbconf);



  function connectMongo(success,failed) {
    //1.连接数据库
    mongoose.connect(dbconf,{
      useNewUrlParser: true, //使用一个新的URL解析器，用于解决一些安全性问题。
      useUnifiedTopology: true, //使用一个统一的新的拓扑结构。
      createIndexes: true
    })
  
    //2.绑定数据库连接的监听
    mongoose.connection.on('open',function (err) {
      if(err){
        console.log('数据库连接失败',err)
        failed('connect failed')
      }else{
        console.log('数据库连接成功')
        success()
      }
    })
  }
  
  module.exports = connectMongo
  
  
