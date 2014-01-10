jreApp.controller('PodcastController', function($scope) {
    $scope.podcasts = [];
    var self = this;
    this.term = '';
    this.offset = 0;
    this.limit = 16;
    this.sort = 'airDate';
    this.numPerRow = 2;

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
    };

    this.parse = function parse(podcastEpisodes) {
        var podcastRows = new Array;
        var numPerRow = self.numPerRow;
        var counter = 0;
        var length = podcastEpisodes.length;
        var podcastRow = new Array;

        podcastEpisodes.each(function(podcast) {
            if (counter == 0 || counter % numPerRow == 0) {
                podcastRow = new Array;
            }

            var videos = podcast.get("videos");
            var date = moment(podcast.get("airDate").date).format('Do MMM YYYY');

            podcastRow.push({
                date: date,
                episode: podcast.get("episode"),
                guests: podcast.get("guests"),
                description: podcast.get("description"),
                featureVideo: videos[0]
            });

            counter++;
            if (counter == length || counter % numPerRow == 0) {
                podcastRows.push({'podcasts': podcastRow});
            }
        });
        return podcastRows;
    };

    this.load = function load() {
        if (this.term == '') {
            var podcastsCollection = JreData.Podcasts.get(self.offset, self.limit, self.sort);

            podcastsCollection.fetch({
                success: function(podcastEpisodes) {
                    self.offset += Number(podcastEpisodes.length);
                    
                    $scope.$apply(function() {
                        $scope.podcastRows = self.parse(podcastEpisodes);
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
                    var parsedPodcasts = self.parse(podcastEpisodes);
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
                        $scope.podcastRows = self.parse(podcastEpisodes);
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