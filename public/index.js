/**
 * The function retrieves the session username using AJAX and displays a greeting message with the
 * username if it exists.
 * @param id - The parameter "id" is a string that represents the ID of an HTML element. This function
 * uses the ID to find and manipulate the element in the HTML document.
 */
function writeSessionUserName(id) {
  jQuery
    .ajax({
      method: "GET",
      url: "/session",
    })
    .done(function (resp) {
      if (!resp) return;
      const id1 = document.getElementById(id);
      const id2 = document.getElementById("loginSection");
      if (resp.length > 0 && id1 && id1 != "undefined") {
        id1.style.display = "none";
        const newSpan = document.createElement("span");
        id2.appendChild(newSpan);
        newSpan.innerHTML = "Hi, " + resp + "!";
        newSpan.id = "nickname";
        const usercenter = document.getElementById("usercenter");
        usercenter.style.visibility = "visible";
        const logoutButton = document.getElementById("logoutButton");
        logoutButton.style.visibility = "visible";
      }
    });
}

document.addEventListener(
  "DOMContentLoaded",
  function () {
    writeSessionUserName("loginButton");
  },
  false
);
