var textForm1 = document.querySelector('#textForm1');
var textbutton1 = document.querySelector('#textbutton1');
var demo = document.getElementById("demo");

var fName = "userInput";

function myFunction() {
    var x = "\r\n" + document.getElementById("myText").value;
    jQuery.ajax({
        method: 'POST',
        url: '/upload2',
        data: {
            content: x,
            fname: fName
        }
    }).done(function (resp) {
        if(resp === "TEXTRECEIVED1") {
            demo.innerHTML = "Text saved successfully";
            demo.classList.remove('hide');
        }
    })
}

textbutton1.onclick = myFunction;