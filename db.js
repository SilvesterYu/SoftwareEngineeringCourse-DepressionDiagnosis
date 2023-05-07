const fs = require("fs");
const path = require("path");
const url = require("url");
const mongoose = require("mongoose");
const mongooseSlugPlugin = require("mongoose-slug-plugin");

//const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const AccountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    password: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    role: {
      type: String,
      required: true,
      default: "user",
      enum: ["user", "admin"],
    },
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
  },
  { timestamps: true }
);

const ReplySchema = new mongoose.Schema(
  {
    account: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    content: { type: String },
  },
  { timestamps: true }
);

AccountSchema.plugin(mongooseSlugPlugin, { tmpl: "<%=name%>" });

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
  dbconf = "mongodb://localhost:27017/depression-diagnosis-js";
  //dbconf = "mongodb://127.0.0.1:27017/depression-diagnosis-js";
}

mongoose.connect(dbconf);
