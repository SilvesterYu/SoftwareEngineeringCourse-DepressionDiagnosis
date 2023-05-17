var discussionPosts = document.querySelector("#discussionPosts");
var titleSearch = document.querySelector("#titleSearch");
var authorSearch = document.querySelector("#authorSearch");
var contentSearch = document.querySelector("#contentSearch");
var searchMessage = document.querySelector("#searchMessage");
var resetSearch = document.querySelector("#resetSearch");

/**
 * The function displays posts on a forum page, including the post title, author, content, and a reply
 * button.
 * @param posts - The parameter "posts" is an array of objects representing forum posts. Each object
 * contains properties such as "title", "createdAt", "account", and "content". The function
 * "displayPosts" takes this array as input and generates HTML elements to display each post on a web
 * page.
 */
function displayPosts(posts) {
  posts.forEach((post) => {
    let title = document.createElement("div");
    let author = document.createElement("div");
    let body = document.createElement("div");
    title.className = "forumViewTitle";
    author.className = "forumViewAuthor";
    body.className = "forumViewBody";
    title.innerHTML = post.title;
    datetimePost = new Date(post.createdAt);
    author.innerHTML =
      "Posted by: " +
      post.account.name +
      " on " +
      datetimePost.toISOString().split("T")[0] +
      " " +
      datetimePost.toLocaleTimeString();
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
  });
}

/**
 * This function retrieves and displays replies to a post using AJAX and dynamically created HTML
 * elements.
 * @param replySection - The HTML element where the replies will be displayed.
 * @param postId - postId is a parameter that is passed to the function `displayReplies`. It is used as
 * a query parameter in the AJAX request to retrieve replies for a specific post. The value of `postId`
 * is used to filter the replies and only return the ones that are associated with the specified post.
 */
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
          const datetimeReply = new Date(reply.createdAt);

          replyContent.innerHTML =
            datetimeReply.toISOString().split("T")[0] +
            " " +
            datetimeReply.toLocaleTimeString() +
            " " +
            reply.account.name +
            ": " +
            reply.content;
          replyContent.style.fontSize = "15px";
          replyContent.style.textAlign = "left";

          replyPost.appendChild(replyContent);
          replySection.prepend(replyPost);
        }
      }
    });
}

/**
 * The function creates a reply input field and buttons for posting or canceling a reply to a post,
 * after checking if the user is logged in.
 * @param evt - The evt parameter is an event object that represents the event that triggered the
 * function. It is used to access information about the event, such as the target element and any data
 * associated with it.
 * @param postId - The postId parameter is the unique identifier of the post to which the user is
 * replying. It is used to associate the reply with the correct post when it is posted.
 * @returns Nothing explicitly.
 */
function replyFunction(evt, postId) {
  const event = evt.currentTarget;
  jQuery
    .ajax({
      method: "GET",
      url: "/session",
    })
    .done(function (resp) {
      if (!resp) {
        window.location.href = "/login";
        return;
      }
      event.style.display = "none";
      const reply = document.createElement("input");
      reply.style.width = "70%";
      reply.placeholder = "Type your reply here";
      reply.id = "reply";
      const replyButton = event.parentNode.firstChild;
      event.parentNode.appendChild(reply);

      const cancelButton = document.createElement("button");
      const postReplyButton = document.createElement("button");
      cancelButton.className = "cancelButton";
      postReplyButton.className = "postReplyButton";
      postReplyButton.innerHTML = "Post";
      postReplyButton.postId = replyButton.postId;
      cancelButton.innerHTML = "Cancel";
      event.parentNode.appendChild(postReplyButton);
      event.parentNode.appendChild(cancelButton);
      cancelButton.addEventListener("click", cancelReply);
      postReplyButton.addEventListener("click", (evt) =>
        postReply(evt, postId)
      );
    });
}
/**
 * The function sends a POST request to the "/reply" URL with the content and post ID data, and reloads
 * the page upon completion.
 * @param evt - The evt parameter is an event object that is passed to the function when it is called.
 * @param postId - postId is a parameter that represents the ID of a post to which a reply is being
 * made. It is used in the AJAX request to send the reply content and post ID to the server for
 * processing.
 */
function postReply(evt, postId) {
  const myReply = document.getElementById("reply");
  const content = myReply.value;
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
      console.log("reloading");
      window.location.reload();
    });
}

/**
 * The function cancels a reply and removes any child elements added to the parent element.
 * @param evt - The `evt` parameter is an event object that represents the event that triggered the
 * function. 
 */
function cancelReply(evt) {
  const parent = evt.currentTarget.parentNode;
  const replyButton = parent.querySelector(".replyButton");
  replyButton.style.display = "inline-block";
  while (parent.lastChild.className !== "replyButton") {
    parent.removeChild(parent.lastChild);
  }
}

/**
 * The function clears the screen by removing all elements with the class "forumViewTitle".
 */
function clearScreen() {
  const elements = document.getElementsByClassName("forumViewTitle");
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }
}

/**
 * The function retrieves posts from a forum based on a search type and keyword, and displays them on
 * the screen.
 * @param searchType - The type of search to be performed (e.g. search by title, author, date, etc.).
 */
function getPosts(searchType) {
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

/**
 * This function is used to display the user center if user has an active session.
 */
function showUserCenter() {
  jQuery
    .ajax({
      method: "GET",
      url: "/session",
    })
    .done(function (resp) {
      if (!resp) {
        const replyButtons = document.getElementsByClassName("replyButton");
        for (const button of replyButtons) button.disabled = true;
        return;
      }
      const usercenter = document.getElementById("usercenter");
      usercenter.style.visibility = "visible";
    });
}

window.onload = getPosts.bind(this, "none");
titleSearch.onclick = getPosts.bind(this, "title");
authorSearch.onclick = getPosts.bind(this, "author");
contentSearch.onclick = getPosts.bind(this, "content");
resetSearch.onclick = getPosts.bind(this, "none");

document.addEventListener(
  "DOMContentLoaded",
  function () {
    showUserCenter();
  },
  false
);
