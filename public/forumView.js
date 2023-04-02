var discussionPosts = document.querySelector("#discussionPosts");
var titleSearch = document.querySelector('#titleSearch');
var authorSearch = document.querySelector('#authorSearch');
var contentSearch = document.querySelector('#contentSearch');
var searchMessage = document.querySelector('#searchMessage');
var resetSearch = document.querySelector('#resetSearch');

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
    author.innerHTML = post.account;
    body.innerHTML = post.content;
    title.appendChild(author);
    author.appendChild(body);
    discussionPosts.appendChild(title);
  });
}

function clearScreen() {
    const elements = document.getElementsByClassName("forumViewTitle");
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
}

// function getPosts() {
//   jQuery
//     .ajax({
//       method: "GET",
//       url: "/forum",
//     })
//     .done(function (resp) {
//       const posts = resp.posts;
//       // console.log(posts);
//       displayPosts(posts);
//     });
// }

function getPosts(searchType, event) {
  clearScreen();
  if (searchType == "none") {
    document.getElementById("mySearch").value = "";
  }
  var x = document.getElementById("mySearch").value;
  jQuery.ajax({
        method: 'POST',
        url: '/forum',
        data: {
            searchBy: searchType,
            keyWord: x
        }
    }).done(function (resp) {
      const posts = resp.posts;
      if (posts.length > 0) {
        displayPosts(posts);
      } else {
        searchMessage.innerHTML = "No results found";
        searchMessage.classList.remove('hide');
      }
    });
    searchMessage.classList.add('hide');
}

window.onload = getPosts.bind(this, "none");
titleSearch.onclick = getPosts.bind(this, "title");
authorSearch.onclick = getPosts.bind(this, "author");
contentSearch.onclick = getPosts.bind(this, "content");
resetSearch.onclick = getPosts.bind(this, "none");

