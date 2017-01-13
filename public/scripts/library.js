function Library(){
  this.albums = [];
}

Library.prototype.createSongFromAudioElement = function(element){
  var song = new Song(element, this);
  var album = this.findOrCreateAlbum(song.albumTitle, song.artist);

  song.album = album;
  album.pushSong(song);
  return song;
}

Object.defineProperty(Library.prototype, "currentlyPlaying", {
  get: function() { return this._currentlyPlaying },
  set: function(song) {
    if(this._currentlyPlaying !== song){ song.audioElement.currentTime = 0;}
    // pause any song that is currently playing. only one song can play at any time.
    if(this._currentlyPlaying) { this._currentlyPlaying.audioElement.pause() };
    this._currentlyPlaying = song;
    return song;
  }
});

Library.prototype.setUpcomingFromSong = function(startingSong){
  var album = startingSong.album;
  var songs = album.songs;
  var matchingIndex = songs.findIndex(function(song){
    return song === startingSong;
  });

  if (this.shuffle){
    // splice out the matching song, then shuffle the rest!
    songs.splice(matchingIndex, matchingIndex + 1)
    return songs.shuffle();
  } else {
    // start at the matchingIndex and go to the end of the album.
    return songs.slice(matchingIndex);
  }
}

Library.prototype.getSongs = function(){
  var songs = [];
  this.albums.forEach(function(element){
    songs = songs.concat(element.songs);
  });
  return songs;
}

Library.prototype.insertDOMElements = function(){
  this.albums.forEach(function(album){
    album.appendToDOM($('body'));
  });

  $('.controls .time-selector').on('input', function(event){
    if(this.currentlyPlaying){
      this.currentlyPlaying.currentTime = $(event.target).val();
    }
  }.bind(this));

  $('.controls .play-pause').click(function(){
    if(this.currentlyPlaying){
      this.currentlyPlaying.togglePlay();
    } else if(this.playlist) {
      this.playlist[0].play();
    } else {
      var promise = new Promise(function(){
        this.setPlaylist();
      }.bind(this));
      promise.then(this.playlist[0].play());
    }
  }.bind(this));

  $('.controls .next').click(function(){
    this.playNextSong();
  }.bind(this));

  $('.controls .back').click(function(){
    this.playPreviousSong();
  }.bind(this));
}

Library.prototype.updateCurrentlyPlayingElement = function(song){
  $('.controls .title').text(song.title);
  $('.controls .artist').text(song.artist);
  $('.controls .time-selector').attr('max', song.audioElement.duration);
  $('.controls .time-selector').val(song.audioElement.currentTime);
}

Library.prototype.createAlbum = function(albumName, artistName){
  var newAlbum = new Album(albumName, artistName);
  newAlbum.library = this;
  this.albums.push(newAlbum);
  return newAlbum;
}

Library.prototype.findAlbum = function(albumTitle, artistName){
  var matchingAlbum;
  this.albums.forEach(function(album){
    if(album.title === albumTitle && album.artist === artistName){
      return matchingAlbum = album;
    }
  });
  return matchingAlbum;
}

Library.prototype.findOrCreateAlbum = function(albumTitle, artist) {
  return this.findAlbum(albumTitle, artist) || this.createAlbum(albumTitle, artist);
}

Library.prototype.setPlaylist = function(){
  var songs, currentIndex;
  if(this.currentlyPlaying){
    songs = this.currentlyPlaying.album.songs
    currentIndex = songs.indexOf(this.currentlyPlaying)
  } else {
    songs = this.getSongs();
    currentIndex = 0;
  }
  if(this.shuffle === true){
    // find the currentSong, shuffle the rest, and then make the currentSong the first song in the
    // playlist
    var currentSong = songs.splice(currentIndex, 1);
    this.playlist = currentSong.concat(songs.shuffle());
  } else {
    // the playlist starts at the currently playing song, then moves forward in order.
    this.playlist = songs.splice(currentIndex);
  }
}

Library.prototype.indexInPlaylist = function(song){
  this.playlist = this.playlist || [];
  if(this.playlist.length > 1 && this.currentlyPlaying){
    return this.playlist.findIndex(function(element){
      return element == song;
    }, this);
  }
}

Library.prototype.playNextSong = function(){
  var index = this.indexInPlaylist(this.currentlyPlaying)
  this.playlist[index + 1].play();
}

Library.prototype.playPreviousSong = function(){
  var index = this.indexInPlaylist(this.currentlyPlaying);
  if(this.currentlyPlaying.audioElement.currentTime < 2 && index - 1 >= 0){
    this.playlist[index - 1].play();
  } else {
    this.currentlyPlaying.currentTime = 0;
  }
}
