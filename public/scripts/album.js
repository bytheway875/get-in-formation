function Album(title, artist){
  this.title = title;
  this.artist = artist;
  this.songs = [];
}

Album.prototype.pushSong = function(songObject){
  return this.songs.push(songObject);
};

Album.prototype.appendToDOM = function(element){
  var id = createId(this.title, this.artist, 'album');
  element.append(`<div class="album" id=${id}>
    <div class="album-title">${this.title} by ${this.artist}</div>
    </div>`);
  this.songs.forEach(function(song){
    song.appendToDOM($(`#${id}`));
  });
};
