define(["backbone", "hbs!app/templates/nav_menu"], function(Backbone, navTemplate) {

    var NavView = Backbone.View.extend({

        template: navTemplate,

        initialize: function(params) {
            this.session = params.session;
            this.session.on('change', this.render, this)

            //re-render when any item is found
            this.listenTo(Backbone, 'found-item', this.render);
            params.el.css('height', $(window).height() + 'px');
            $(window).resize( function(ev) {
               var $navmenu = $('#nav-menu');
                var height = $(window).height() + 'px';
                $navmenu.css('height', height);
            });
        },

        serialize: function () {
            //compile a list of topics, each with a list of items
            var sessionData = this.session.getAllSessionTopicsAndItems();
            return sessionData;
        },
        hide: function() {
            //actually hide by sliding in the overlapping 'content' div
            $('#content').removeClass('slideout');
        }


    });

    return NavView;

});
