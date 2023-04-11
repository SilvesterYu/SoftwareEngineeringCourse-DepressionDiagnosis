const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: String,
    description: String,
    content: String
});

const Post_article = mongoose.model('Post_article', PostSchema);

module.exports = Post_article;