<?php

namespace Jre\Fetcher;

use Jre\Fetcher\Twitter;
use Jre\Fetcher\Videos;
use Jre\Fetcher\Parse;
use Jre\Fetcher\Guest;

class Backfill
{
    private $twitter;

    /**
     * 
     * @return Twitter
     */
    public function getTwitter()
    {
        return $this->twitter;
    }

    /**
     * 
     * @param Twitter $twitter
     */
    public function setTwitter(Twitter $twitter)
    {
        $this->twitter = $twitter;
    }

    public function go($offset = 0, $limit = 10)
    {
        $parsed = [];
        $fetcher = new Videos;
        $parse = new Parse;

        $podcasts = $fetcher->getList($offset, $limit);

        /* @var $podcast Jre\Fetcher\Podcast */
        foreach ($podcasts as $podcast) {
            $guests = $podcast->getGuests();

            //save podcast
            $parse->savePodcast($podcast);

            if (!empty($guests) && is_array($guests)) {
                /* @var $guest Guest */
                foreach ($guests as $guest) {
                    //check for existing guest
                    $name = $guest->getName();
                    $existingGuestData = $parse->getGuest(['name' => $name]);

                    if ($existingGuestData === false) {
                        $guest->setTwitter($this->getTwitter());
                        $guest->addEpisode($podcast->getEpisode());
                        $guest->setLastAppearance($podcast->getAirDate());

                        $parse->saveGuest($guest);
                    } else {
                        if (isset($existingGuestData[0])) {
                            $existingGuestData = $existingGuestData[0];
                            $existingGuest = new Guest;
                            $existingGuest->setTwitter($this->getTwitter());
                            $existingGuest->fromArray($existingGuestData);
                            $existingGuest->addEpisode($podcast->getEpisode());

                            if ($podcast->getAirDate() > $existingGuest->getLastAppearance()) {
                                $existingGuest->setLastAppearance($podcast->getLastAppearance());
                            }

                            $parse->saveGuest($existingGuest);
                        }
                    }
                }
            }
            $parsed[] = $podcast->getTitle();
        }
        return $parsed;
    }

}
