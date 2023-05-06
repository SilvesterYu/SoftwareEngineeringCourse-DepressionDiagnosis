function returnQueryValue(match) {
  var query = location.search.substr(1);
  var pairs = query.split("&");
  for (i = 0; i < pairs.length; i++) {
    var name = pairs[i].split("=")[0];
    var val = pairs[i].split("=")[1];
    if (name == match) {
      val = unescape(val.replace(/\+/g, " "));
      return val;
    }
  }
}

function writeCustomHeader(match, id) {
  var newHeader = returnQueryValue(match);
  if (!newHeader) return;
  var id = document.getElementById(id);
  var id2 = document.getElementById("loginSection");
  if (newHeader.length > 0 && id && id != "undefined") {
    id.style.display = "none";
    const newSpan = document.createElement("span");
    id2.appendChild(newSpan);
    newSpan.innerHTML = "Hi, " + newHeader + "!";
    newSpan.id = "nickname";
    var usercenter = document.getElementById("usercenter");
    usercenter.style.visibility = "visible";
  }
}

document.addEventListener(
  "DOMContentLoaded",
  function () {
    writeCustomHeader("user", "loginButton");
  },
  false
);
