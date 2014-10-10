// SoundEx extends audio clip functionality. Each sound has a number of channels
// that support simultaneous playback.

tj.SoundEx = function(urlResource, nChannels) {
  var iChannel = 0,
      i=0;

  this.url = urlResource;
  this.channels = [];
  this.nChannels = nChannels;
  this.lastPlayed = -1;
  this.lastPlayTime = 0;
  this.duration = 0;
  this.volume = 1.0;
  this.bOverrideVolume = false;

  this.ADD_SOUND(this);

  return this;
};

tj.SoundEx.prototype.MASTER_VOLUME = 1.0;

tj.SoundEx.prototype.SET_MASTER_VOLUME = function(newVolume) {
  var i = 0;

  this.MASTER_VOLUME = Math.max(0, newVolume);
  this.MASTER_VOLUME = Math.min(this.MASTER_VOLUME, 1.0);

  // Propagate volume change to all sounds.
  for (i=0; i<this.ALL_SOUNDS.length; ++i) {
    if (!this.bOverrideVolume) {
      this.ALL_SOUNDS[i].setVolume(this.ALL_SOUNDS[i].volume);
    }
  }
};

tj.SoundEx.prototype.MIN_INTERRUPT_TIME_MS = 100;
tj.SoundEx.prototype.ALL_SOUNDS = [];
tj.SoundEx.prototype.ADD_SOUND = function(newSound) {
  this.ALL_SOUNDS.push(newSound);
};

tj.SoundEx.prototype.REMOVE_SOUND = function(delSound) {
  tj.Utility.erase(this.ALL_SOUNDS, delSound);
};

tj.SoundEx.prototype.setVolumeOverride = function(bOverride) {
  this.bOverrideVolume = bOverride;
};

tj.SoundEx.prototype.getVolume = function() {
  return this.volume;
};

tj.SoundEx.prototype.setVolume = function(volume, channel) {
  var i = 0;

  this.volume = volume;

  if (channel) {
    channel.volume = this.bOverrideVolume ? volume : volume * this.MASTER_VOLUME;
  }
  else {
    for (i=0; i<this.channels.length; ++i) {
      this.channels[i].volume = this.bOverrideVolume ? volume : volume * this.MASTER_VOLUME;
    }
  }
}

tj.SoundEx.prototype.loop = function() {
  var audio = this.play();

  if (audio) {
    audio.loop = true;
  }
};

tj.SoundEx.prototype.stop = function(channel) {
  var i=0;

  if (channel) {
    channel.pause();
    channel.load();
  }
  else {
    for (i=0; i<this.channels.length; ++i) {
      this.stop(this.channels[i]);
    }

    this.lastPlayed = -1;
    this.lastPlayTime = 0;
  }
};

tj.SoundEx.prototype.pause = function(channel) {
  var i=0;

  if (channel) {
    this.channel.pause();
  }
  else {
    for (i=0; i<this.channels.length; ++i) {
      this.pause(this.channels[i]);
    }
  }
};

tj.SoundEx.prototype.play = function() {
  var playTime = Date.now(),
      iChannel = 0,
      audio = null,
      nTries = 0;

  if (playTime - this.lastPlayTime > this.MIN_DELAY) {
    while (nTries < this.channels.length) {
      iChannel = (this.lastPlayed + 1) % this.channels.length;

      audio = this.channels[iChannel];

      if ((!audio.loop  && playTime - this.lastPlayTime > this.MIN_INTERRUPT_TIME_MS) || audio.ended) {
        audio.pause();
        audio.load();

        audio.volume = this.volume * this.MASTER_VOLUME;
        audio.play();

        this.lastPlayTime = playTime;
        this.lastPlayed = iChannel;

        break;
      }

      ++nTries;
    }
  }

  return audio;
};

tj.SoundEx.prototype.MIN_DELAY = 50; // ms
tj.SoundEx.prototype.FORMAT = null;

tj.SoundEx.prototype.findFormat = function(audioClip) {
  this.FORMAT = "ogg";

  if (audioClip) {
    if (audioClip.canPlayType("audio/ogg").indexOf("maybe") >= 0) {
      if (audioClip.canPlayType("audio/mp3").indexOf("probably") >= 0) {
        this.FORMAT = "mp3";
      }
    }
    else if (audioClip.canPlayType("audio/ogg").indexOf("probably") < 0) {
      if (audioClip.canPlayType("audio/mp3").indexOf("probably") >= 0) {
        this.FORMAT = "mp3";
      }
      else if (audioClip.canPlayType("audio/mp3").indexOf("maybe") >= 0) {
        this.FORMAT = "mp3";
      }
    }
  }
};

tj.SoundEx.prototype.duration = function() {
  return this.duration;
};

tj.SoundEx.prototype.load = function(onLoadedCallback, onErrorCallback, observer) {
  var audioClip = null,
      iChannel = 0,
      self = this;

  for (iChannel=0; iChannel<this.nChannels; ++iChannel) {
    audioClip = new Audio();
    this.channels.push(audioClip);

    if (!this.FORMAT) {
      this.findFormat(audioClip);
    }

    if (observer) {
      audioClip.oncanplaythrough = function() {
        audioClip.oncanplaythrough = null;
        self.duration = audioClip.duration;

        if (onLoadedCallback) {
          onLoadedCallback.call(observer, self);
        }
      };

      audioClip.onerror = function() {
        audioClip.onerror = null;
        if (onLoadedCallback) {
          onErrorCallback.call(observer, self);
        }
      }
    }

    audioClip.src = this.url + "." + this.FORMAT;
  }

  return audioClip;
};