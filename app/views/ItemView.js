define(["backbone", "underscore", "hbs!app/templates/item", "app/logging", "app/floor_tracking",
        "app/views/AudioControlsView"],
    function(Backbone, _, itemTemplate, Logging, FloorTracking,
             AudioControlsView) {

  var ItemView = Backbone.View.extend({

    template: itemTemplate,

    serialize: function() {
      var output = this.item.toJSON();

      output.nextURL = this.nextURL;
      output.trailTitle = this.trail.attributes.title;
      output.topicTitle = this.topic.attributes.title;
      return output;
    },

    initialize: function(params) {
      this.item = params.item;
      this.nextURL = params.nextURL;
      this.trail = params.trail;
      this.topic = params.topic;
      //listen for events
      this.eventId = 'beaconRange:' + this.item.attributes.beaconMajor;
      this.listenTo(Backbone, this.eventId, this.didRangeBeacon);
      Logging.logToDom("Listening for event: " + this.eventId);
      this.foundAtInit = params.found;
      this.headerView = params.headerView;

	    //found sound
	    if(typeof(Media) !== 'undefined') {

	            var pathPrefix = ''
                if(device.platform.toLowerCase() === "android") {
                    pathPrefix = "/android_asset/www/";
                }
                this.foundSound = new Media(pathPrefix + this.item.attributes.foundSound,
                                    function() { console.log("Created media object"); },
                                    function(error) { console.log("error creating media object"); console.log(error); });
        } else { console.log("Media plugin not available!");}
    },

    afterRender: function() {
        if (this.item.attributes.audio) {
            this.audioControlsView = new AudioControlsView({el: $('.audio-controls', this.el),
                                                            audio: this.item.attributes.audio,
                                                            caption: 'About',
                                                            duration: this.item.attributes.audio_duration});
            this.audioControlsView.render();
        }

        if(this.foundAtInit) {
          this.findObject(false);
        }

    },

    didRangeBeacon: function(data) {
        Logging.logToDom("View heard about ranged beacon!");
      switch(data.proximity) {
        case "ProximityImmediate":
          //update proximity indicator
          $('.proximity-indicator').removeClass('near far').addClass('immediate').html('Immediate');
          this.findObject(true);
          break;
        case "ProximityNear":
          //update proximity indicator
          $('.proximity-indicator').removeClass('immediate far').addClass('near').html('Near');
          this.findObject(true);
          break;
        case "ProximityFar":
          //update proximity indicator
          $('.proximity-indicator').removeClass('immediate near far').html('Scanning...');
          break;
      }
    },

    findObject: function(shouldAlert) {
      $('.search-item').hide();
      $('.found-item').show().css('display', 'inline-block');
      $('.hint-container').hide();

      //unsubscribe from further beacon events
      this.stopListening(Backbone, this.eventId);
      this.item.attributes.isFound=true;

      Backbone.trigger('found-item');

      //vibrate
	    if(shouldAlert) {
		    if (navigator.notification) {
			    navigator.notification.vibrate(500);
			    this.foundSound.play();
		    }
	    }

      //set header next link to found
      this.headerView.setNextURL(this.nextURL);
      this.headerView.render();


        //enable user prompting to switch floor
        FloorTracking.prompttoSwitch = true;

	    //Set up scrolling of image + description. Need a short delay so that the audio control can render first
	    setTimeout(function() {
		    var windowHeight = $(window).height();
		    var $found = $('.found-scrolling');
		    var foundPos = $found.offset();
		    var foundHeight = windowHeight - foundPos.top;
		    $found.height(foundHeight);
		    $found.css('overflow-y', 'scroll');
	    }, 50);
    },

    //For browser simulation of 'finding' the object. Click on the picture
    events: {
      "click img.item-image" : "onClickImage",
      "click img.toggle-audio-button" : "toggleAudio",
      "click .show-hint" : "showHint",
      "click #nav-menu-button" : "toggleNavMenu",
      "click .map-link" : "showMap",
      "click .map-container" : "hideMap",
      "click .find-item" : "findObject",
    },

    onClickImage: function(ev) {
      //Backbone.trigger(this.eventId, { proximity:"ProximityImmediate" });
	    this.findObject(false);
    },
    toggleAudio: function (ev) {
      this.audioControlsView.toggleAudioPublic();
    },
    showHint: function(ev) {
        ev.preventDefault();
      $('.show-hint').hide();
      $('.hint').show();
    },

    showMap: function(ev) {
      $('.map-container').show();
        //reposition to center on screen;
        var $img = $('img.map-image');
        var sHeight = $(window).height();
        var imgHeight = $img.height();
        var offset = (sHeight - imgHeight)/2;
        $img.css('top', '' + offset + 'px');

    },

    hideMap: function(ev) {
      $('.map-container').hide();
    },

    toggleNavMenu: function(ev)
    {
        var content = $('#content');
        content.toggleClass('slideout');
    },

	cleanup: function() {
		if(this.audioControlsView) {
			this.audioControlsView.remove();
		}
	}

    //allQuestions: allQuestions
  }
  );

  return ItemView;

});
