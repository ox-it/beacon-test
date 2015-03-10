define(["backbone", "jquery", "underscore",
          "app/collections/TrailsCollection",
          "app/views/TrailsView", "app/views/TrailIntroView", "app/views/TopicView", "app/views/ItemView", "app/views/FinishedView",
          "app/views/ContentView", "app/models/Session", "app/views/NavView", "app/views/DashboardView"],
  function(Backbone, $, _,
            TrailsCollection,
            TrailsView, TrailIntroView, TopicView, ItemView, FinishedView,
            ContentView, Session, NavView, DashboardView) {

    var SEVRouter = Backbone.Router.extend({
        initialize: function() {
          //initialize the collections
          this.allTrails = new TrailsCollection();
          this.allTrails.fetch({
            error: function(coll, resp, opt) {
              console.log("error fetching trails: ");
              console.log(resp);
            }
          });

            //create the container content-view
            this.contentView = new ContentView({el:$('#content')});
        },

        routes: {
            "": "home",
            "home": "home",
            "trail/:trail": "trail",
            "topic/:topic": "topic",
            "item/:item": "item",
            "finished": "finished",
            "restart": "restart",
            "dashboard": "dashboard"
        },

        home: function() {
          var view = new TrailsView({
            trails:this.allTrails
          });
          this.contentView.setView(view);
          view.renderIfReady();
            if(this.navView) {
                this.navView.hide();
            }
        },

        trail: function(trailSlug) {
            //create a new session for the chosen trail
            var trail = this.allTrails.findWhere( {slug: trailSlug} );
            this.session = new Session(trail);

            if(!this.navView) {
                //create a navbar now we have a session
                this.navView = new NavView({el: $('#nav-menu'), session: this.session});
            }
            else {
                //update if for the new session.
                this.navView.session = this.session;
            }
            this.navView.render();

            //create intro view
            var view = new TrailIntroView({
                trail: trail,
                nextURL: this.session.getNextURL()
            });

            this.contentView.setView(view);
            view.render();
        },

        topic: function(topicSlug) {
            var topic = this.session.getTopic(topicSlug);
            var view = new TopicView({
                topic: topic,
                trail: this.session.getCurrentTrail()
            });
            this.contentView.setView(view);
            view.render();

            //re-render and hide the nav view
            if(this.navView) {
                this.navView.render();
                this.navView.hide();
            }
        },

        item: function(itemSlug) {
            var item = this.session.getItem(itemSlug);
            //Inform the session that we've visited this item
            this.session.visitItem(itemSlug);
            var nextURL = this.session.getNextURL();
            var currentTrail = this.session.getCurrentTrail();
            var currentTopic = this.session.getCurrentTopic();
            var view = new ItemView({
                item: item,
                trail: currentTrail,
                topic: currentTopic,
                nextURL: nextURL
            });
            this.contentView.setView(view);
            view.render();
            //re-render and hide the nav view
            this.navView.render();
            if(this.navView) {
                this.navView.hide();
            }
        },
        finished: function() {
            var view = new FinishedView();
            this.contentView.setView(view);
            view.render();
            //TODO mark with the session that it's finished.
            //TODO re-render the nav menu
            //Hide the nav-menu
            this.navView.hide();
        },
        restart: function() {
            //restart the current trail
            this.session = new Session(this.session.attributes.trail.attributes.slug);
            Backbone.history.navigate(this.session.getNextURL());
        },
        dashboard: function() {
            var dashboardView = new DashboardView( [
                {beaconId: 4005, name: 'Fossils1'},
                {beaconId: 11889, name: 'Fossil2'},
                {beaconId: 2889, name: 'Changes1'}
            ]);
            this.navView.hide();
            this.contentView.setView(dashboardView);
            dashboardView.render();
        }
    });

    return SEVRouter;

  });
