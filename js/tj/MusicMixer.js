tj.MusicMixerClass = function() {
  this.tracks = [];
  this.bRandomize = false;
  this.iCurTrack = -1;
  this.iNextTrack = -1;
  this.fadeTimer = -1.0;
};

tj.MusicMixerClass.prototype.MASTER_VOLUME = 1.0;   // normalized
tj.MusicMixerClass.prototype.FADE_INTERVAL = 0.25;  // seconds

tj.MusicMixerClass.prototype.SET_MASTER_VOLUME = function(newVolume) {
  this.MASTER_VOLUME = Math.min(newVolume, 1.0);
  this.MASTER_VOLUME = Math.max(0.0, this.MASTER_VOLUME);
};

tj.MusicMixerClass.prototype.update = function(dt) {
  var fadedVolume = 0;

  if (this.iCurTrack >= 0) {
    if (this.fadeTimer < 0.0) {
      this.tracks[this.iCurTrack].tPlayed += dt;

      if (this.tracks[this.iCurTrack].duration - this.tracks[this.iCurTrack].tPlayed < this.FADE_INTERVAL) {
        // Start the fade.
        this.fadeTimer = this.FADE_INTERVAL;
      }
    }
    else {
      // Manage the fade out.
      this.fadeTimer -= dt;
      if (this.fadeTimer <= 0.0) {
        // Start the next track.
        this.tracks[this.iCurTrack].sound.stop();

        if (this.bWantsStop) {
          this.iCurTrack = -1;
        }
        else {
          this.startNextTrack();
        }
      }
      else {
        fadedVolume = this.fadeTimer / this.FADE_INTERVAL;
        this.tracks[this.iCurTrack].sound.setVolume(fadedVolume);
      }
    }
  }
};

tj.MusicMixerClass.prototype.startNextTrack = function() {
  var iLastTrack = this.iCurTrack;

  if (this.bRandomize) {
    while (iLastTrack === this.iCurTrack) {
      this.iCurTrack = this.getRandomTrack();
    }
  }
  else {
    this.iCurTrack = (this.iCurTrack + 1) % this.tracks.length;
  }

  this.startTrack(this.tracks[this.iCurTrack]);
};

tj.MusicMixerClass.prototype.getTrack = function(iTrack) {
  return iTrack >= 0 && iTrack < this.tracks.length ? this.tracks[iTrack] : null;
};

tj.MusicMixerClass.prototype.start = function(startTrack) {
  if (this.tracks.length) {
    this.iCurTrack = startTrack || (this.bRandomize ? this.getRandomTrack() : 0);
    this.startTrack(this.getTrack(this.iCurTrack));
  }
  else {
    this.iCurTrack = -1;
  }
};

tj.MusicMixerClass.prototype.isPlaying = function() {
  return this.iCurTrack >= 0 && !this.bWantsStop;
};

tj.MusicMixerClass.prototype.stop = function() {
  if (this.iCurTrack >= 0) {
    // Signal stop.
    this.fadeTimer = this.FADE_INTERVAL;
    this.bWantsStop = true;
  }
};

tj.MusicMixerClass.prototype.startTrack = function(track) {
  if (track) {
    track.sound.stop();

    track.tPlayed = 0;
    track.tFade = 0;
    track.sound.setVolumeOverride(true);
    track.sound.setVolume(this.MASTER_VOLUME);
    track.sound.play();

    this.fadeTimer = -1.0;
  }
};

tj.MusicMixerClass.prototype.randomize = function(bDoRandomize) {
  this.bRandomize = bDoRandomize;
};

tj.MusicMixerClass.prototype.getRandomTrack = function() {
  return Math.floor(Math.random() * this.tracks.length);
};

tj.MusicMixerClass.prototype.setNextTrack = function(iTrack) {
  this.iNextTrack = Math.max(0, iTrack);
  this.iNextTrack = Math.min(iTrack, this.tracks.length - 1);
};

tj.MusicMixerClass.prototype.addTrack = function(newTrack) {
  if (newTrack) {
    this.tracks.push({
      sound: newTrack,
      tStart: 0,
      duration: newTrack.duration,
      tFade: 0
    })
  }
};

tj.MusicMixerClass.prototype.removeTrack = function(delTrack) {
  var i = 0,
      iTrack = -1;

  while (iTrack < this.tracks.length) {
    iTrack = this.tracks.length;

    // Search for the track.
    for (i=0; i<this.tracks.length; ++i) {
      if (this.tracks[i].sound === delTrack) {
        iTrack = i;
        break;
      }
    }

    // If found, remove it.
    if (iTrack < this.tracks.length) {
      tj.Utility.erase(this.tracks, this.tracks[iTrack]);
    }
  }
};

tj.MusicMixer = new tj.MusicMixerClass();

