var discussionPosts = document.querySelector("#discussionPosts");
var titleSearch = document.querySelector("#titleSearch");
var authorSearch = document.querySelector("#authorSearch");
var contentSearch = document.querySelector("#contentSearch");
var searchMessage = document.querySelector("#searchMessage");
var resetSearch = document.querySelector("#resetSearch");

function displayPosts(posts) {
  posts.forEach((post) => {
    //console.log(post);
    let title = document.createElement("div");
    let author = document.createElement("div");
    let body = document.createElement("div");
    title.className = "forumViewTitle";
    author.className = "forumViewAuthor";
    body.className = "forumViewBody";
    title.innerHTML = post.title;
    author.innerHTML =
      "Posted by: " +
      post.account.name +
      " on " +
      post.createdAt.substring(0, post.createdAt.indexOf("T"));
    body.innerHTML = post.content;
    title.appendChild(author);
    author.appendChild(body);
    discussionPosts.appendChild(title);

    // add reply button
    let replySection = document.createElement("div");
    replySection.className = "replySection";
    title.appendChild(replySection);

    displayReplies(replySection, post._id);

    let replyButton = document.createElement("button");
    replyButton.innerHTML = "Reply";
    replyButton.className = "replyButton";
    replySection.appendChild(replyButton);
    replyButton.addEventListener("click", (evt) => {
      replyFunction(evt, post._id);
    });

    jQuery
      .ajax({
        method: "GET",
        url: "/session",
      })
      .done(function (resp) {
        if (resp == "no") replyButton.disabled = true;
      });
  });
}

async function displayReplies(replySection, postId) {
  jQuery
    .ajax({
      method: "GET",
      url: "/replies",
      data: {
        postId: postId,
      },
    })
    .done(function (replies) {
      if (replies) {
        for (const reply of replies) {
          let replyPost = document.createElement("div");
          let replyContent = document.createElement("div");
          replyContent.innerHTML = reply.account.name + ": " + reply.content;
          replyContent.style.fontSize = "15px";
          replyContent.style.textAlign = "left";

          replyPost.appendChild(replyContent);
          replySection.prepend(replyPost);
        }
      }
    });
}

function replyFunction(evt, postId) {
  evt.currentTarget.style.display = "none";
  const reply = document.createElement("input");
  reply.style.width = "70%";
  reply.placeholder = "Type your reply here";
  reply.id = "reply";
  const replyButton = evt.currentTarget.parentNode.firstChild;
  evt.currentTarget.parentNode.appendChild(reply);

  const cancelButton = document.createElement("button");
  const postReplyButton = document.createElement("button");
  cancelButton.className = "cancelButton";
  postReplyButton.className = "postReplyButton";
  postReplyButton.innerHTML = "Post";
  postReplyButton.postId = replyButton.postId;
  cancelButton.innerHTML = "Cancel";
  evt.currentTarget.parentNode.appendChild(postReplyButton);
  evt.currentTarget.parentNode.appendChild(cancelButton);
  cancelButton.addEventListener("click", cancelReply);
  postReplyButton.addEventListener("click", (evt) => postReply(evt, postId));
}

function postReply(evt, postId) {
  const myReply = document.getElementById("reply");
  const content = myReply.value;
  console.log(postId);
  jQuery
    .ajax({
      method: "POST",
      url: "/reply",
      data: {
        content: content,
        post: postId,
      },
    })
    .done(function (resp) {
      location.reload();
    });
}

function cancelReply(evt) {
  const parent = evt.currentTarget.parentNode;
  const replyButton = parent.querySelector(".replyButton");
  replyButton.style.display = "inline-block";
  while (parent.lastChild.className !== "replyButton") {
    parent.removeChild(parent.lastChild);
  }
}

function clearScreen() {
  const elements = document.getElementsByClassName("forumViewTitle");
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }
}

function getPosts(searchType, event) {
  clearScreen();
  if (searchType == "none") {
    document.getElementById("mySearch").value = "";
  }
  var x = document.getElementById("mySearch").value;
  jQuery
    .ajax({
      method: "POST",
      url: "/forum",
      data: {
        searchBy: searchType,
        keyWord: x,
      },
    })
    .done(function (resp) {
      const posts = resp.posts;
      if (posts.length > 0) {
        displayPosts(posts);
      } else {
        searchMessage.innerHTML = "No results found";
        searchMessage.classList.remove("hide");
      }
    });
  searchMessage.classList.add("hide");
}

window.onload = getPosts.bind(this, "none");
titleSearch.onclick = getPosts.bind(this, "title");
authorSearch.onclick = getPosts.bind(this, "author");
contentSearch.onclick = getPosts.bind(this, "content");
resetSearch.onclick = getPosts.bind(this, "none");
