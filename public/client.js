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

/* This code is adding event listeners to the `theImageContainer` element for various drag and drop
events. The `preventDragDefault` function is being called for each of these events to prevent the
default behavior of the browser when dragging and dropping files. */
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

/* The following code is adding event listeners to various elements for the dragging events.*/
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

/**
 * The function checks if a given file is a valid image file with a maximum size of 1MB and displays an
 * error message if it fails the checks.
 * @param theFile - The file that needs to be checked for its properties such as type and size.
 * @returns a boolean value (either true or false) depending on whether the file properties meet the
 * specified criteria. If the file type is not png or jpg/jpeg, or if the file size is greater than
 * 1MB, the function will return false. Otherwise, it will return true.
 */
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

/* This code is adding an event listener to the `submit` event of the `theImageForm` element.*/
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

/**
 * This function handles the uploaded file by creating an image element, setting its attributes, and
 * reading the file data to display the image.
 * @param file - The `file` parameter is an object that represents the file that was uploaded by the
 * user. It contains information about the file such as its name, size, and type. The function
 * `handleUploadedFile` takes this file object as input and uses it to display the uploaded image on
 * the webpage.
 * @returns Nothing
 */
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

/**
 * The function clears an image and sends a request to remove it from records.
 * @param e - The parameter `e` is an event object that is passed to the function `clearImage`. It is
 * used to prevent the default behavior of an event.
 */
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

/**
 * The function retrieves a depression diagnosis score for an uploaded image and displays it on the
 * webpage.
 */
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
          diagnosisMessage.innerHTML = "Your depression score is ";
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

/**
 * The function checks if a user is logged in and displays the user center if they are.
 * @returns If the `resp` variable is falsy, the function will return nothing (`undefined`). 
 * Otherwise, it will set the visibility of the HTML element with the ID "usercenter" to "visible".
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

diagnosisButton.onclick = getDiagnosis;

document.addEventListener(
  "DOMContentLoaded",
  function () {
    showUserCenter();
  },
  false
);
