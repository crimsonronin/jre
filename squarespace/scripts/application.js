$(document).ready(function() {
    var podcastSource = $("#podcast-template").html();

    var podcastTemplate = Handlebars.compile(podcastSource);
    Parse.initialize("eQsrp5wXs19ySB8Cz9NjE6z3ziJNgqxNdG2sZUlG", "Qk4ykIaR0Vqqdgd3VDeDYxZYfHsMk49winrjEXoV");

    var Podcast = Parse.Object.extend("Podcast");
    var query = new Parse.Query(Podcast);
    query.descending("episode");
    query.find({
        success: function(podcast) {
            $.each(podcast, function(key, value) {
                var compiledTemplate = podcastTemplate({title: value.get('title')});
                $('#podcasts').html($('#podcasts').html() + compiledTemplate);
            });
        },
        error: function(podcast, error) {
            // The object was not retrieved successfully.
            // error is a Parse.Error with an error code and description.
        }
    });
});