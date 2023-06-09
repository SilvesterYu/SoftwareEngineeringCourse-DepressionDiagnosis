/**
 * The function checks if a user is logged in and displays the user center if they are.
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

document.addEventListener(
  "DOMContentLoaded",
  function () {
    showUserCenter();
  },
  false
);
