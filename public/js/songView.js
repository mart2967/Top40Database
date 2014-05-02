/**
 * Created by mart2967 on 4/22/14.
 */
var SongView = Backbone.View.extend({
    template: _.template('<div class="col-lg-3"><div class="thumbnail"> <img src="<%= imageURL %>" /> ' +
        '<div class="caption"><h3><%= title %></h3><h4><%= artist %></h4></div> </div> </div>'),


    initialize: function(){
        this.render();
    },

    render: function(){
        this.$el.html(this.template(this.model));
    }

});