const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const appPort = process.env.PORT || 3000;

app.use('/libs', express.static('bower_components'));
app.use(express.static('public'));
app.use(bodyParser({
    limit: '1mb'
}))
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// image upload
app.post('/upload', (req, res) => {
    console.log("upload...");
    if(req.body.theFile !== "") {
        console.log("received uploaded image!!");
        let theFileString = req.body.theFile;
        let theFileName = req.body.name;
        theFileString = theFileString.replace(/data:image\/(png|jpeg);base64,/, "");
        // console.log('the file string ' + theFileString);
        fs.writeFileSync('images/' + theFileName, theFileString, {
            'encoding': 'base64'
        });
    } else {
        console.log("!!!!!");
    }
    
    res.send('UPLOADED');
})

// image upload instant removal
app.post('/img-instant-removal', (req, res) => {
    if(req.body.content !== "") {
        console.log("received image instant removal request!!");

    var filePath = "images/" + req.body.name; 
    fs.unlinkSync(filePath);

} else {
    console.log("!!!!!imageInstantRemoval");
}

res.send('IMAGEREMOVED1');
})

// forum
app.post('/post-public', (req, res) => {
    console.log("taking text...");
    if(req.body.content !== "") {
        console.log("received text!!");
        
        let textContent = req.body.content;
        console.log(textContent);

        fs.writeFileSync("forum/" + req.body.fname + ".txt",
        textContent,
    {
      encoding: "utf8",
      flag: "a+",
      mode: 0o666
    });

} else {
    console.log("!!!!!text");
}

res.send('TEXTRECEIVED1');
})
// end of forum

app.listen(process.env.PORT || 3000, () => {
    console.log(`The server is up and running on ${appPort} port.`);
});


// "scripts": {
//     /*"start": "nodemon server",*/
//     "start": "node server.js",