jreApp.controller('GuestsController', function($scope) {
    $scope.guests = [];

    var guestsCollection = JreData.Guests.get();

    guestsCollection.fetch({
        success: function(podcastGuests) {
            var guests = new Array;
            podcastGuests.each(function(guest) {
                var date;
                var lastAppearance = guest.get("lastAppearance");
                if (lastAppearance && lastAppearance.date) {
                    date = moment(guest.get("lastAppearance").date).format('Do MMM YYYY');
                }

                guests.push({
                    name: guest.get("name"),
                    url: encodeURIComponent(guest.get("name")),
                    description: guest.get("description"),
                    image: guest.get("image"),
                    twitterUsername: guest.get("twitterUsername"),
                    episodes: guest.get("episodes"),
                    site: guest.get("site"),
                    lastAppearance: date
                });
            });

            $scope.$apply(function() {
                $scope.guests = guests;
            });
            jqueryFuncs.refreshScroll();
        },
        error: function(guests, error) {

        }
    });
});
jreApp.controller('AllGuestsController', function($scope) {
    $scope.guests = [];

    var guestsCollection = JreData.Guests.get(16, 0);

    guestsCollection.fetch({
        success: function(podcastGuests) {
            var guestRows = new Array;
            var numPerRow = 2;
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

            console.log(guestRows);
            $scope.$apply(function() {
                $scope.guestRows = guestRows;
            });
            jqueryFuncs.refreshScroll();
        },
        error: function(guests, error) {

        }
    });
});