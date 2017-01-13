/*
  Utility Functions
*/

function leadingZero(num){
  if(num < 10){
    return "0" + num;
  }
  return num;
}

function createId(){
  var argArray = [].slice.call(arguments);
  var clean = argArray.map(function(e){
    return e.split(" ").join("-").replace(/\.|\(|\)|\'/g, "");
  });
  return clean.join("-").toLowerCase();
}

Array.prototype.shuffle = function() {
  var i = this.length, j, temp;
  if ( i == 0 ) return this;
  while ( --i ) {
     j = Math.floor( Math.random() * ( i + 1 ) );
     temp = this[i];
     this[i] = this[j];
     this[j] = temp;
  }
  return this;
}

// Two reasons this is a function instead of an attribute.
// First, if we set it as an attribute before the audioElement has
// loaded its metadata, it will inadvertantly be set to NaN. Second, we want to reformat int
// m:ss format.
function formatSongTime(seconds) {
  if(!seconds){ return "0:00" }
  var m = parseInt(seconds/60);
  var ss = parseInt(seconds % 60);
  return `${m}:${leadingZero(ss)}`
}
