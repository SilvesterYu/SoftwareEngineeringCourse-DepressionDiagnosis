var discussionPosts = document.querySelector("#discussionPosts");

function getPosts() {
  jQuery
    .ajax({
      method: "GET",
      url: "/forum",
    })
    .done(function (resp) {
      const posts = resp.posts;
      console.log(posts);
      posts.forEach((post) => {
        console.log(post);
        let title = document.createElement("div");
        let author = document.createElement("div");
        let body = document.createElement("div");
        title.innerHTML = post.title;
        author.innerHTML = post.account;
        body.innerHTML = post.content;
        title.className = "forumViewTitle";
        author.className = "forumViewAuthor";
        body.className = "forumViewBody";
        title.appendChild(author);
        author.appendChild(body);
        discussionPosts.appendChild(title);
      });
    });
}

window.onload = getPosts();
