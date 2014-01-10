JreData = window.JreData || {};
jreApp = window.jreApp || {};
jqueryFuncs = window.jqueryFuncs || {};

Parse.initialize("eQsrp5wXs19ySB8Cz9NjE6z3ziJNgqxNdG2sZUlG", "Qk4ykIaR0Vqqdgd3VDeDYxZYfHsMk49winrjEXoV");

JreData.Podcasts = {
    get: function(offset, limit, sort, search) {
        if (!limit) {
            limit = 3;
        }
        if (!offset) {
            offset = 0;
        }
        if (!sort) {
            sort = "airDate";
        }

        var Podcast = Parse.Object.extend('Podcast');
        
        if (search) {
            var nameQ = new Parse.Query(Podcast);
            nameQ.equalTo('episode', search);

            var episodeQ = new Parse.Query(Podcast);
            episodeQ.equalTo('guests', search);

            var query = Parse.Query.or(nameQ, episodeQ);
        } else {

            var query = new Parse.Query(Podcast);
        }
        
        query.descending(sort);
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
    get: function(offset, limit, sort, search) {
        if (!limit) {
            limit = 2;
        }
        if (!offset) {
            offset = 0;
        }
        if (!sort) {
            sort = "lastAppearance";
        }

        var Guest = Parse.Object.extend('Guest');

        if (search) {
            var nameQ = new Parse.Query(Guest);
            nameQ.startsWith('name', search);

            var episodeQ = new Parse.Query(Guest);
            episodeQ.equalTo('episodes', search);

            var query = Parse.Query.or(nameQ, episodeQ);
        } else {

            var query = new Parse.Query(Guest);
        }

        query.descending(sort);
        query.limit(limit);
        query.skip(offset);

        var GuestCollection = Parse.Collection.extend({
            query: query,
            model: Guest
        });
        return new GuestCollection;
    }

};

jreApp = angular.module('jreApp', []).config(function($interpolateProvider) {
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

jreApp.directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if (event.which === 13) {
                scope.$apply(function() {
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});