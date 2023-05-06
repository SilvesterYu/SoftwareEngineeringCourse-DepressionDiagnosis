var theImageForm = document.querySelector("#theImageForm");
var theImageField = document.querySelector("#theImageField");
var theImageContainer = document.querySelector("#theImageContainer");
var theErrorMessage = document.querySelector("#errorMessage");
var theSuccessMessage = document.querySelector("#successMessage");
var theClearImageLink = document.querySelector("#clearImage");
var removalMessage = document.querySelector("#removalMessage");
var diagnosisButton = document.querySelector("#diagnosisButton");
var diagnosisMessage = document.querySelector("#diagnosisMessage");
var diagnosisScore = document.querySelector("#diagnosisScore");

var fileName = "";

[
  "drag",
  "dragstart",
  "dragend",
  "dragover",
  "dragenter",
  "dragleave",
  "drop",
].forEach(function (dragEvent) {
  theImageContainer.addEventListener(dragEvent, preventDragDefault);
});

["dragover", "dragenter"].forEach(function (dragEvent) {
  theImageContainer.addEventListener(dragEvent, function () {
    theImageContainer.classList.add("dragging");
  });
});

["dragleave", "dragend", "drop"].forEach(function (dragEvent) {
  theImageContainer.addEventListener(dragEvent, function () {
    theImageContainer.classList.remove("dragging");
  });
});

theImageContainer.addEventListener("drop", function (e) {
  if (e.dataTransfer.files.length > 1) {
    theErrorMessage.innerHTML = "Drag only one file...";
    theErrorMessage.classList.remove("hide");
    return false;
  }
  var theFile = e.dataTransfer.files[0];
  theImageField.files[0] = theFile;

  if (checkFileProperties(theFile)) {
    handleUploadedFile(theFile);
  }
});

theImageField.onchange = function (e) {
  var theFile = e.target.files[0];

  if (checkFileProperties(theFile)) {
    handleUploadedFile(theFile);
  }
};

function checkFileProperties(theFile) {
  theErrorMessage.classList.add("hide");
  theSuccessMessage.classList.add("hide");

  if (theFile.type !== "image/png" && theFile.type !== "image/jpeg") {
    console.log("File type mismatch");
    theErrorMessage.innerHTML = "File type should be png or jpg/jpeg...";
    theErrorMessage.classList.remove("hide");
    return false;
  }

  if (theFile.size > 1000000) {
    console.log("File too large");
    theErrorMessage.innerHTML = "File too large, cannot be more than 1MB...";
    theErrorMessage.classList.remove("hide");
    return false;
  }

  return true;
}

theImageForm.onsubmit = function (e) {
  e.preventDefault();
  var theImageTag = document.querySelector("#theImageTag");
  jQuery
    .ajax({
      method: "POST",
      url: "/upload",
      data: {
        theFile: theImageTag.getAttribute("src"),
        name: fileName,
      },
    })
    .done(function (resp) {
      if (resp === "UPLOADED") {
        theSuccessMessage.innerHTML = "Image uploaded successfully";
        theSuccessMessage.classList.remove("hide");
      }
    });
  removalMessage.classList.add("hide");
};

theClearImageLink.onclick = clearImage;

function preventDragDefault(e) {
  e.preventDefault();
  e.stopPropagation();
}

function handleUploadedFile(file) {
  fileName = file.name;
  clearImage();
  var img = document.createElement("img");
  img.setAttribute("id", "theImageTag");
  img.file = file;
  theImageContainer.appendChild(img);

  var reader = new FileReader();
  reader.onload = (function (aImg) {
    return function (e) {
      aImg.src = e.target.result;
    };
  })(img);
  reader.readAsDataURL(file);
}

function clearImage(e) {
  if (e) {
    e.preventDefault();
  }

  var theImageTag = document.querySelector("#theImageTag");

  if (theImageTag) {
    theImageContainer.removeChild(theImageTag);
    theImageField.value = null;
    console.log("removal");

    jQuery
      .ajax({
        method: "POST",
        url: "/img-instant-removal",
        data: {
          name: fileName,
        },
      })
      .done(function (resp) {
        if (resp === "IMAGEREMOVED1") {
          removalMessage.innerHTML =
            "Image removed from your records successfully";
          removalMessage.classList.remove("hide");
        }
      });
  }
  theSuccessMessage.classList.add("hide");
  removalMessage.classList.add("hide");
  diagnosisMessage.classList.add("hide");
  diagnosisScore.classList.add("hide");
}

function getDiagnosis() {
  // clearScreen();
  if (fileName.length > 0) {
    console.log("diagnosis for " + fileName);
    jQuery
      .ajax({
        method: "POST",
        url: "/diagnosis",
        data: {
          name: fileName,
        },
      })
      .done(function (resp) {
        console.log(resp);
        if (resp != "NOSCORE") {
          diagnosisMessage.innerHTML = "Your depression score is 50";
          diagnosisScore.innerHTML = resp;
          diagnosisMessage.classList.remove("hide");
          diagnosisScore.classList.remove("hide");
        }
      });
  } else {
    diagnosisMessage.innerHTML = "Please upload your image first";
    diagnosisScore.innerHTML = "";
    diagnosisMessage.classList.remove("hide");
    diagnosisScore.classList.remove("hide");
  }
  diagnosisMessage.classList.add("hide");
  diagnosisScore.classList.add("hide");
}

function clearScreen() {
  diagnosisScore.innerHTML = "";
  diagnosisMessage.classList.remove("hide");
  diagnosisScore.classList.remove("hide");
  diagnosisMessage.classList.add("hide");
  diagnosisScore.classList.add("hide");
}

diagnosisButton.onclick = getDiagnosis;
