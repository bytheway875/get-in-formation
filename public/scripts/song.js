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
  $('.play-pause').removeClass('icon-play-circle');
  $('.play-pause').addClass('icon-pause-circle');
  this.audioElement.addEventListener("ended", function(){
    this.library.playNextSong();
  }.bind(this));
}

Song.prototype.pause = function(){
  this.audioElement.pause();
  $('.play-pause').addClass('icon-play-circle');
  $('.play-pause').removeClass('icon-pause-circle');
}

Song.prototype.togglePlay = function(){
  if(this.audioElement.paused || !this.audioElement.currentTime > 0){
    this.play();
  } else {
    this.pause();
  }
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
