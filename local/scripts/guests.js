jreApp.controller('GuestsController', function($scope) {
    $scope.guests = [];
    var self = this;
    this.term = '';
    this.offset = 0;
    this.limit = 16;
    this.sort = 'lastAppearance';
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

    this.parse = function parse(podcastGuests) {
        var guestRows = new Array;
        var numPerRow = self.numPerRow;
        var counter = 0;
        var length = podcastGuests.length;
        var guestRow = new Array;

        podcastGuests.each(function(guest) {
            if (counter == 0 || counter % numPerRow == 0) {
                guestRow = new Array;
            }
            var date;
            var lastAppearance = guest.get("lastAppearance");
            if (lastAppearance && lastAppearance.date) {
                date = moment(guest.get("lastAppearance").date).format('Do MMM YYYY');
            }

            guestRow.push({
                name: guest.get("name"),
                url: encodeURIComponent(guest.get("name")),
                description: guest.get("description"),
                image: guest.get("image"),
                twitterUsername: guest.get("twitterUsername"),
                episodes: guest.get("episodes"),
                site: guest.get("site"),
                lastAppearance: date
            });

            counter++;
            if (counter == length || counter % numPerRow == 0) {
                guestRows.push({'guests': guestRow});
            }
        });
        return guestRows;
    };

    this.load = function load() {
        if (this.term == '') {
            var guestsCollection = JreData.Guests.get(self.offset, self.limit, self.sort);

            guestsCollection.fetch({
                success: function(podcastGuests) {
                    self.offset += Number(podcastGuests.length);
                    $scope.$apply(function() {
                        $scope.guestRows = self.parse(podcastGuests);
                    });
                },
                error: function(guests, error) {

                }
            });
        }
    };

    this.more = function more() {
        var guestsCollection = JreData.Guests.get(self.offset, self.limit, self.sort, self.term);

        guestsCollection.fetch({
            success: function(podcastGuests) {
                self.offset += podcastGuests.length;
                $scope.$apply(function() {
                    var parsedGuests = self.parse(podcastGuests);
                    parsedGuests.forEach(function(guest) {
                        $scope.guestRows.push(guest);
                    });
                });
            },
            error: function(guests, error) {

            }
        });
    };

    this.search = function search() {
        if (this.term != '') {
            self.offset = 0;
            self.term = this.term;
            var guestsCollection = JreData.Guests.get(self.offset, self.limit, self.sort, self.term);
            guestsCollection.fetch({
                success: function(podcastGuests) {
                    self.offset = Number(podcastGuests.length);

                    var guests = self.parse(podcastGuests);
                    $scope.$apply(function() {
                        $scope.guestRows = guests;
                    });
                },
                error: function(guests, error) {

                }
            });
        } else {
            this.load();
        }
    };
});