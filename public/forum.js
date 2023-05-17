// the post editing and publishing functions
var forumForm = document.querySelector("#forumForm");
var publishbutton = document.querySelector("#publishbutton");
var forumMessage = document.getElementById("forumMessage");

/**
 * The function publishes a post by sending the post content and title to a server using AJAX and
 * displays a success message if the post is saved and published successfully.
 */
function publishPost() {
  var fName = document.getElementById("myTitle").value;
  var x = "\r\n" + document.getElementById("myPost").value;
  jQuery
    .ajax({
      method: "POST",
      url: "/post-public",
      data: {
        content: x,
        fname: fName,
      },
    })
    .done(function (resp) {
      if (resp === "TEXTRECEIVED1") {
        forumMessage.innerHTML = "Text saved and published successfully";
        forumMessage.classList.remove("hide");
        document.getElementById("myTitle").value = "";
        document.getElementById("myPost").value = "";
        window.history.back();
      }
    });
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
      if (!resp) return;
      const usercenter = document.getElementById("usercenter");
      usercenter.style.visibility = "visible";
    });
}

publishbutton.onclick = publishPost;

document.addEventListener(
  "DOMContentLoaded",
  function () {
    showUserCenter();
  },
  false
);