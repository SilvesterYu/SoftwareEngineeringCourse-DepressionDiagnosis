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
