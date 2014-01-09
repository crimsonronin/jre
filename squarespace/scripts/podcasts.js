jreApp.controller('PodcastsController', function($scope) {
    $scope.podcasts = [];

    var podcastsCollection = JreData.Podcasts.get(3, 1);

    podcastsCollection.fetch({
        success: function(podcasts) {
            var episodes = new Array;
            podcasts.each(function(podcast) {
                var videos = podcast.get("videos");
                var date = moment(podcast.get("airDate").date).format('Do MMM YYYY');

                episodes.push({
                    date: date,
                    episode: podcast.get("episode"),
                    guests: podcast.get("guests"),
                    description: podcast.get("description"),
                    featureVideo: videos[0]
                });
            });

            $scope.$apply(function() {
                $scope.podcasts = episodes;
            });
            jqueryFuncs.refreshScroll();
        },
        error: function(podcasts, error) {

        }
    });
});
jreApp.controller('FeaturedPodcastController', function($scope) {
    $scope.podcasts = [];
    var podcastsCollection = JreData.Podcasts.get(1, 0);

    podcastsCollection.fetch({
        success: function(podcasts) {
            var episodes = new Array;
            podcasts.each(function(podcast) {
                var videos = podcast.get("videos");
                var date = moment(podcast.get("airDate").date).format('Do MMM YYYY');
                episodes.push({
                    date: date,
                    episode: podcast.get("episode"),
                    guests: podcast.get("guests"),
                    description: podcast.get("description"),
                    featureVideo: videos[0]
                });
            });

            $scope.$apply(function() {
                $scope.podcasts = episodes;
            });
            jqueryFuncs.refreshScroll();
        },
        error: function(podcasts, error) {

        }
    });
});