var express = require('express');
var app = express();

app.use(express.static('public/styles'));
app.use(express.static('public/scripts'));

app.get('/', function(request, response) {
  response.sendFile(__dirname + "/public/views/formation.html");
});


app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});
