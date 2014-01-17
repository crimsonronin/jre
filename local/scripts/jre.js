JreData = window.JreData || {};
JreApp = window.JreApp || {};
JreFuncs = window.JreFuncs || {};

Parse.initialize("eQsrp5wXs19ySB8Cz9NjE6z3ziJNgqxNdG2sZUlG", "Qk4ykIaR0Vqqdgd3VDeDYxZYfHsMk49winrjEXoV");

JreFuncs.parseSearchTerm = function(search) {
    var words = search.split(/\b/);
    var wordsUpper = new Array;
    words.forEach(function(word) {
        if (!/^\s*$/.test(word)) {
            wordsUpper.push(word.toUpperCase());
        }
    });
    return wordsUpper;
};


JreFuncs.getQueryString = function(absUrl) {
    var urlParts = absUrl.split('?');
    if (urlParts[1]) {
        var qs = {};
        var nvps = urlParts[1].split('&');
        nvps.forEach(function(nvp) {
            var v = nvp.split('=');
            qs[v[0]] = v[1];
        });
        return qs;
    }
    return false;
};

JreData.Podcasts = {
    get: function(offset, limit, sort, search) {
        if (!limit) {
            limit = 3;
        }
        if (!offset) {
            offset = 0;
        }
        if (!sort) {
            sort = "episode";
        }

        var Podcast = Parse.Object.extend('Podcast');
        if (search && search != '' && (typeof search === 'number' || !isNaN(search))) {
            var query = new Parse.Query(Podcast);
            query.equalTo('episode', Number(search));
        } else if (search) {
            var query = new Parse.Query(Podcast);
            query.containsAll('searchTerms', JreFuncs.parseSearchTerm(search));
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
            var query = new Parse.Query(Guest);
            query.containsAll('searchTerms', JreFuncs.parseSearchTerm(search));
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

JreApp = angular.module('JreApp', []).config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('##').endSymbol('##');
});

JreApp.directive('youtube', function($sce) {
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

JreApp.directive('ngEnter', function() {
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