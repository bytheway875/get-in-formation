var JUKEBOX = new Library();

$(document).ready(function(){
  var audioTags = document.querySelectorAll('.my-audio audio');
  audioTags.forEach(function(element){
    JUKEBOX.createSongFromAudioElement(element);
  });
  JUKEBOX.insertDOMElements();

});
