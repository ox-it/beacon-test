define(["backbone", "underscore", "app/views/vcentre", "app/models/Trail", "hbs!app/templates/trail_intro"],
    function(Backbone, _, CentreMixin, Trail, trailIntro) {

    var TrailIntroView = Backbone.View.extend({
        template: trailIntro,

        initialize: function(params) {
            this.trail = params.trail;
        },

        afterRender: function() {
            this.$video = $('#introvideo');
            this.video = this.$video[0];

            //initiailize the video plugin
            //on Android the videos must be loose in res/raw/, where the plugin plays them, on ios they are in www/video'
	        if(typeof(device)!='undefined') {
		        var videoPath = (device.platform == 'Android' || device.platform == 'amazon-fireos') ? '' : 'video/'
		        console.log("Initializing video");
		        window.plugins.html5Video.initialize({
			        "introvideo": videoPath + this.trail.attributes.video,
		        });
	        }

            //setTimeout(this.startVideo.bind(this), 5000);
            this.startVideo();
	        this.playing = false;
            this.$video.on('ended', this.showStartLink.bind(this));
	        this.checkErrorTimeout = setTimeout(this.checkVideoError.bind(this), 500);
	        //this.$video.on('canplaythrough', function(ev) {
		     //   console.log("received canplay event");
		     //   if(!this.playing) {
			 //       console.log("Can play!");
			 //       this.playing = true;
			 //       this.startVideo();
		     //   }
	        //}.bind(this));

			setTimeout(this.centreElements.bind(this), 100);
        },
	    checkVideoError: function() {
		    // Sometimes on Android, decoding fails at first attempt.
		    // Check periodically and try to replay if it is in error state
		    var video = this.$video[0];
		    if(video.error !== null) {
			    video.play();
		    }
		    this.checkErrorTimeout = setTimeout(this.checkVideoError.bind(this), 500);
	    },
	    centreElements: function() {
		    //not on android - video has no height initially
		    if(typeof(device)!='undefined') {
			    if (device.platform !== 'Android' && device.platform !== 'amazon-fireos') {
				    this.moveToCentre(this.$video);
			    }
		    }
	    },
        startVideo: function() {
	        console.log("Playing video");
	        if(typeof(device)!='undefined') {
		        window.plugins.html5Video.play('introvideo', this.showStartLink);
	        } else {
		        this.video.play();
	        }
        },
        serialize: function() {
            var out = this.trail.toJSON();
            return out;
        },

        showStartLink: function() {
	        //stop error checking
	        clearTimeout(this.checkErrorTimeout);

	        var $buttonsContainer = $('.buttons-container');
            $buttonsContainer.show();
            this.moveToCentre($buttonsContainer);
            //add the 'finished' class to the video
            var $video = $('#intro-video');

	        //hide controls
	        $('.controls-container').hide();
        },

        replayVideo: function(ev) {
          ev.preventDefault();
          window.plugins.html5Video.play('introvideo');

            //hide nav controls
            $('.buttons-container').hide();

	        //unhide video controls
	        $('.controls-container').show();
	        $('.stop').show();
	        this.$video.show();
        },
	    pauseVideo: function(ev) {
		    console.log("pausing video");
		    this.$video[0].pause();
		    //toggle buttons
		    $('#pause').hide();
		    $('#resume').show();
	    },
	    resumeVideo: function(ev) {
		    console.log("resuming video");
		    this.$video[0].play();
		    //toggle buttons
		    $('#pause').show();
		    $('#resume').hide();
	    },
	    stopVideo: function(ev) {
		   // console.log("stopping video");
	      this.$video[0].pause();
	      this.$video[0].currentTime = 0;
		    this.showStartLink();
		   // this.$video.hide();
		   // $('.controls-container').hide();
		   // $('.buttons-container').show();

	    },

        events: {
            "click #replay": "replayVideo",
	        "click #pause": "pauseVideo",
	        "click #resume": "resumeVideo",
	        "click #stop": "stopVideo",
        }


    });

    _.extend(TrailIntroView.prototype, CentreMixin);


    return TrailIntroView;

});
