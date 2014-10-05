/**
 *  To request resources:
 * 
 *  tj.Resources.requestMusic("art/music/theme-red");
 *  tj.Resources.requestMusic("art/music/theme-blue");
 *  tj.Resources.requestMusic("art/music/theme-white");
 *
 *  To load the requested resources.
 *  tj.Resources.sendRequests();
 *
 *  To check for completion:
 *  if (tj.Resources.loadComplete()) {
 *   if (tj.Resources.loadSuccessful()) {
 *     // Signal the game that resources are loaded and ready.
 *   }
 *   else {
 *     // Signal the game that resource loading has failed.
 *   }
 * }
 *
 */

tj.ResourcesClass = function() {
  this.requests = [];
  this.loaded = 0;
  this.failed = 0;
};

tj.ResourcesClass.prototype.TYPES = {SOUND: 0,
                                     MUSIC: 1,
                                     IMAGE: 2};

tj.ResourcesClass.prototype.getProgress = function() {
  return this.requests.length ? (this.loaded + this.failed) / this.requests.length : 1.0;
};

tj.ResourcesClass.prototype.onSoundLoaded = function(resource) {
  this.loaded += 1;
};

tj.ResourcesClass.prototype.onSoundLoadFailed = function(resource) {
  this.failed += 1;
};

tj.ResourcesClass.prototype.onMusicTrackLoaded = function(resource) {
  tj.MusicMixer.addTrack(resource);
  this.loaded += 1;
};

tj.ResourcesClass.prototype.onMusicTrackLoadFailed = function(resource) {
  this.failed += 1;
};

tj.ResourcesClass.prototype.onImageLoaded = function(resource) {
  this.loaded += 1;
};

tj.ResourcesClass.prototype.onImageLoadFailed = function(resource) {
  this.failed += 1;
};

tj.ResourcesClass.prototype.sendRequests = function() {
  var i = 0;

  for (i=0; i<this.requests.length; ++i) {
    switch (this.requests[i].type) {
      case this.TYPES.SOUND:
        this.requests[i].resource.load(this.onSoundLoaded, this.onSoundLoadFailed, this);
      break;

      case this.TYPES.MUSIC:
        this.requests[i].resource.load(this.onMusicTrackLoaded, this.onMusicTrackLoadFailed, this);
      break;

      case this.TYPES.IMAGE:
        this.requests[i].resource.load(this.onImageLoaded, this.onImageLoadFailed, this);
      break;

      default:
      break;
    }
  }
};

tj.ResourcesClass.prototype.loadComplete = function() {
  return this.loaded + this.failed === this.requests.length;
};

tj.ResourcesClass.prototype.loadSuccessful = function() {
  return this.loaded === this.requests.length;
};

tj.ResourcesClass.prototype.requestSound = function(url, nChannels) {
  var request = {resource: new tj.SoundEx(url, nChannels),
                 bSent: false,
                 bReceived: false,
                 bLoaded: false,
                 bError: false,
                 type: this.TYPES.SOUND};

  this.requests.push(request);

  return request.resource;
};

tj.ResourcesClass.prototype.requestMusic = function(url) {
  var request = {resource: new tj.SoundEx(url, 1),
                 bSent: false,
                 bReceived: false,
                 bLoaded: false,
                 bError: false,
                 type: this.TYPES.MUSIC};
                 
  this.requests.push(request);

  return request.resource;
};

tj.ResourcesClass.prototype.requestImage = function(url) {
  var request = {resource: new tj.ImageEx(url),
                 bSent: false,
                 bReceived: false,
                 bLoaded: false,
                 bError: false,
                 type: this.TYPES.IMAGE};
                 
  this.requests.push(request);

  return request.resource;
};

tj.Resources = new tj.ResourcesClass();
