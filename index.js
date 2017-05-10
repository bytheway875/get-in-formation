var express = require('express');
var app = express();

app.use(express.static('public'));

app.get('/', function(request, response) {
  response.sendFile(__dirname + "/public/views/formation.html");
});

app.listen(process.env.PORT || 3000, function () {
  console.log('Spinning up the app!')
});
