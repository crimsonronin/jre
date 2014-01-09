JreData = window.JreData || {};
jreApp = window.jreApp || {};
jqueryFuncs = window.jqueryFuncs || {};

Parse.initialize("eQsrp5wXs19ySB8Cz9NjE6z3ziJNgqxNdG2sZUlG", "Qk4ykIaR0Vqqdgd3VDeDYxZYfHsMk49winrjEXoV");

jqueryFuncs.refreshScroll = function() {
    $('[data-spy="scroll"]').each(function() {
        $(this).scrollspy('refresh');
    });
};
jqueryFuncs.animateClicks = function() {

};

JreData.Podcasts = {
    get: function(limit, offset) {
        if (!limit) {
            limit = 3;
        }
        if (!offset) {
            offset = 0;
        }

        var Podcast = Parse.Object.extend('Podcast');
        var query = new Parse.Query(Podcast);
        query.descending("episode");
        query.limit(limit);
        query.skip(offset);

        var PodcastCollection = Parse.Collection.extend({
            query: query,
            model: Podcast
        });
        return new PodcastCollection;
    }

};

JreData.Guests = {
    get: function(limit, offset) {
        if (!limit) {
            limit = 2;
        }
        if (!offset) {
            offset = 0;
        }

        var Guest = Parse.Object.extend('Guest');
        var query = new Parse.Query(Guest);
        query.descending("lastAppearance");
        query.limit(limit);
        query.skip(offset);

        var GuestCollection = Parse.Collection.extend({
            query: query,
            model: Guest
        });
        return new GuestCollection;
    }

};

jreApp = angular.module('jreApp', []).config(function($interpolateProvider){
        $interpolateProvider.startSymbol('##').endSymbol('##');
    }
);

jreApp.directive('youtube', function($sce) {
    return {
        restrict: 'EA',
        scope: {code: '='},
        replace: true,
        template: '<div class="video-container"><iframe width="560" height="315" src="{{url}}" frameborder="0" allowfullscreen></iframe></div>',
        link: function(scope) {
            scope.$watch('code', function(newVal) {
                if (newVal) {
                    scope.url = $sce.trustAsResourceUrl("http://www.youtube.com/embed/" + newVal + "?wmode=transparent");
                }
            });
        }
    };
});