JreApp.controller('PodcastController', function($scope, $location) {
    $scope.podcasts = [];
    var self = this;
    this.term = '';
    this.offset = 0;
    this.limit = 16;
    this.sort = 'airDate';
    this.numPerRow = 2;
    this.queryString = JreFuncs.getQueryString($location.absUrl());
    this.featurePodcastContainer = $('#featurePodcast');

    this.init = function(offset, limit, numPerRow, sort)
    {
        self.offset = Number(offset);
        self.limit = Number(limit);
        self.numPerRow = Number(numPerRow);
        if (sort) {
            self.sort = Number(sort);
        }
        if (self.term == '') {
            self.load();
        }

        if (this.queryString && this.queryString.episode) {
            //get main video
            this.get(this.queryString.episode);
        }
    };

    this.get = function get(podcastEpisode) {
        if (podcastEpisode) {
            var podcastsCollection = JreData.Podcasts.get(0, 1, 'episode', podcastEpisode);

            podcastsCollection.fetch({
                success: function(podcastEpisodes) {
                    podcastEpisodes.each(function(podcast) {
                        $scope.$apply(function() {
                            $scope.featurePodcast = self.parseEpisode(podcast);
                            self.featurePodcastContainer.removeClass('hide');
                            $("html, body").animate({scrollTop: 0}, "slow");
                        });
                    });
                },
                error: function(podcasts, error) {

                }
            });
        }
    };

    this.parseEpisodes = function parseEpisodes(podcastEpisodes) {
        var podcastRows = new Array;
        var numPerRow = self.numPerRow;
        var counter = 0;
        var length = podcastEpisodes.length;
        var podcastRow = new Array;

        podcastEpisodes.each(function(podcast) {
            if (counter == 0 || counter % numPerRow == 0) {
                podcastRow = new Array;
            }

            podcastRow.push(self.parseEpisode(podcast));

            counter++;
            if (counter == length || counter % numPerRow == 0) {
                podcastRows.push({'podcasts': podcastRow});
            }
        });
        return podcastRows;
    };

    this.parseEpisode = function parseEpisode(podcast) {
        var parsedEpisode = {
            date: moment(podcast.get("airDate").date).format('Do MMM YYYY'),
            episode: podcast.get("episode"),
            guests: podcast.get("guests"),
            description: podcast.get("description"),
            featureVideo: podcast.get("videos")[0],
            featureImage: podcast.get("thumbnails")[0],
            thumbnails: podcast.get("thumbnails")
        };
        return parsedEpisode;
    };


    this.load = function load() {
        if (this.term == '') {
            var podcastsCollection = JreData.Podcasts.get(self.offset, self.limit, self.sort);

            podcastsCollection.fetch({
                success: function(podcastEpisodes) {
                    self.offset += Number(podcastEpisodes.length);

                    $scope.$apply(function() {
                        $scope.podcastRows = self.parseEpisodes(podcastEpisodes);
                    });
                },
                error: function(podcasts, error) {

                }
            });
        }
    };

    this.more = function more() {
        var podcastsCollection = JreData.Podcasts.get(self.offset, self.limit, self.sort, self.term);

        podcastsCollection.fetch({
            success: function(podcastEpisodes) {
                self.offset += podcastEpisodes.length;
                $scope.$apply(function() {
                    var parsedPodcasts = self.parseEpisodes(podcastEpisodes);
                    parsedPodcasts.forEach(function(podcast) {
                        $scope.podcastRows.push(podcast);
                    });
                });
            },
            error: function(podcasts, error) {

            }
        });
    };

    this.search = function search() {
        if (this.term != '') {
            self.offset = 0;
            self.term = this.term;

            var podcastsCollection = JreData.Podcasts.get(self.offset, self.limit, self.sort, self.term);

            podcastsCollection.fetch({
                success: function(podcastEpisodes) {
                    self.offset = Number(podcastEpisodes.length);
                    $scope.$apply(function() {
                        $scope.podcastRows = self.parseEpisodes(podcastEpisodes);
                    });
                },
                error: function(podcasts, error) {

                }
            });
        } else {
            self.offset = 0;
            this.load();
        }
    };
});