// the post editing and publishing functions
var forumForm = document.querySelector("#forumForm");
var publishbutton = document.querySelector("#publishbutton");
var forumMessage = document.getElementById("forumMessage");

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

publishbutton.onclick = publishPost;
