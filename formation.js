var JUKEBOX = new Library();

$(document).ready(function(){
  var audioTags = document.querySelectorAll('.my-audio audio');
  audioTags.forEach(function(element){
    JUKEBOX.createSongFromAudioElement(element);
  });
  JUKEBOX.insertDOMElements();

});

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
      debugger
      this.playlist[0].play();
    } else {
      var promise = new Promise(function(){
        this.setPlaylist();
      }.bind(this));
      promise.then(this.playlist[0].play());
    }
    if(this.currentlyPlaying.paused){
      $('.play-pause').addClass('icon-play-circle');
      $('.play-pause').removeClass('icon-pause-circle');
    } else {
      $('.play-pause').removeClass('icon-play-circle');
      $('.play-pause').addClass('icon-pause-circle');
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

function Song(audioElement, library, title, artist){
  this.title = name || audioElement.dataset.title;
  this.artist = artist || audioElement.dataset.artist;
  this.audioElement = audioElement;
  this.library = library;
  this.track = audioElement.dataset.track; // will be undefined unless initialized with an audioElement
  this.albumTitle = audioElement.dataset.album; // will be undefined unless initialized with an audioElement
}

Song.prototype.appendToDOM = function(element){
  var id = createId(this.title, this.artist, this.track);
  this.id = id;
  element.append(`<div class="song" data-src=${this.audioElement.src} id=${id}><span class="audio-indicator"></span><span class="content"></span></div>`)

  this.audioElement.addEventListener('durationchange', function(){
    $(`#${id} .content`).text(`${this.title} ${this.duration}`);
  }.bind(this));

  document.getElementById(id).addEventListener("click", function(){
    this.togglePlay();
    this.library.setPlaylist();
  }.bind(this));

  this.audioElement.addEventListener('timeupdate', function(){
    if(this.library.currentlyPlaying == this){
      $('.controls .current-time').text(this.currentTime);
      $('.controls .time-selector').val(this.audioElement.currentTime);
    }
  }.bind(this));
}

Song.prototype.play = function(){
  this.library.currentlyPlaying = this;
  this.library.updateCurrentlyPlayingElement(this);
  this.audioElement.play();
  this.audioElement.addEventListener("ended", function(){
    this.library.playNextSong();
  }.bind(this));
}

Song.prototype.pause = function(){
  this.audioElement.pause();
}

Song.prototype.togglePlay = function(){
  if(this.audioElement.paused || !this.audioElement.currentTime > 0){
    this.play();
  } else {
    this.pause();
  }
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

// convenience method for setting time onto songs audio element,
// or retrieving the FORMATTED time
Object.defineProperty(Song.prototype, 'currentTime',{
  set: function(currentTime){
    return this.audioElement.currentTime = currentTime;
  },
  get: function(){
    return formatSongTime(this.audioElement.currentTime);
  }
});

// Delegate paused from the audioElement to its song object.
Object.defineProperty(Song.prototype, 'paused', {
  get: function(){
    return this.audioElement.paused;
  }
})

// convenience method for getting the duration from the audioElement directly on the song object
Object.defineProperty(Song.prototype, 'duration',{
  get: function(){
    return formatSongTime(this.audioElement.duration);
  }
});

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




// var client = "6e14190e7eb34629b16e656036d26a0c";
// var secret = "78aaccfe8fef448085105057fe860e91";
// $.ajax({
//   method: "POST",
//   url: "https://accounts.spotify.com/api/token",
//   headers: {
//     "Authorization": "Basic " + btoa(client + ":" + secret)
//   },
//   data: {
//     grant_type: 'client_credentials'
//   }
//
// }).done(function(response){
//   accessToken = response.access_token;
// });



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
