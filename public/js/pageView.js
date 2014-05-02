var PageView = Backbone.View.extend({
    columns: 4,
    initialize: function(){
        var self = this;
        $( "#songs" ).autocomplete({
            minLength: 1,
            source: function( request ) {
                $.getJSON( "search", request, function( data, status, xhr ) {
                    self.render(data);
                });
            }
        });
    },

    render: function(data){
        //$('#results').html('');
        var self = this;
        this.$el.html('<div class="row">');
        _.each(data, function(item, index){
            //console.log(index);
            var newSong = new SongView({model: item});
            if (index % self.columns == 0 && index > 0){
                console.log('new row')
                self.$el.append('</div><div class="row">');
            }
            self.$el.append(newSong.el);

        });
        this.$el.append('</div>');
        $('#results').html(this.el);
        return this;
    }

});