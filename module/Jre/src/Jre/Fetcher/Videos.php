<?php

namespace Jre\Fetcher;

use \DateTime;
use ZendGData\YouTube;
use ZendGData\YouTube\VideoEntry;
use ZendGData\YouTube\VideoQuery;
use Jre\Fetcher\Podcast;

class Videos
{
    private static $format = [
        "Joe Rogan Experience \#([0-9]+) \-[\-]* ([a-zA-Z\,\s\-\"\.\']+)([a-zA-Z\(\)]*)",
        "JRE \#([0-9]+) \- ([a-zA-Z\,\s\-\"\.\']+)([a-zA-Z\(\)]*)"
    ];
    private static $pseudonymMap = [
        'Joey Diaz' => [
            'JOEY "COCO" DIAZ'
        ],
        'Cliffy Bleszinski' => [
            'CLIFFY B'
        ],
        'Patrick Magee' => [
            'PAT MAGEE'
        ],
        'Christopher Ryan' => [
            'DR. CHRISTOPHER RYAN',
            'CHRISTOPHER RYAN',
            'CHRIS RYAN',
        ]
    ];

    public function getRecent()
    {
        return $this->getList();
    }

    public function getList($offset = 0, $limit = 10, $orderBy = 'published')
    {
        $videos = $this->get($offset, $limit, $orderBy);

        $jreEpisodes = [];
        /* @var $video VideoEntry */
        foreach ($videos as $video) {
            $title = $video->getTitle()->getText();
            foreach (self::$format as $regex) {
                if (preg_match('/' . $regex . '/', $title)) {
                    $jreEpisodes[] = $video;
                    break;
                }
            }
        }

        return $this->parsePodcasts($jreEpisodes);
    }

    private function parseGuests($guestStr)
    {
        $cleanGuests = [];
        $guests = explode(',', $guestStr);
        foreach ($guests as $guestName) {
            $guest = new Guest;
            $guest->setName($this->getRealName($guestName));

            $cleanGuests[] = $guest;
        }
        return $cleanGuests;
    }

    private function getRealName($name)
    {
        $name = trim($name);
        foreach (self::$pseudonymMap as $realName => $pseudonyms) {
            if (in_array(strtoupper($name), $pseudonyms)) {
                return $realName;
            }
        }
        return $name;
    }

    private function parsePodcasts($episodes)
    {
        $podcasts = [];
        /* @var $ep VideoEntry */
        foreach ($episodes as $ep) {
            $title = $ep->getTitle()->getText();
            $videoId = $ep->getVideoId();
            $description = $ep->getContent()->getText();
            $airDate = new DateTime($ep->getPublished()->getText());

            $guests = $this->getGuests($title);
            $episode = $this->getEpisode($title);
            $part = $this->getMultiPart($title);

            if ($part !== false && $part > 1 && isset($podcast)) {
                $podcast->addVideo($videoId);
            } else {
                $podcast = new Podcast();
                $podcast->setAirDate($airDate);
                $podcast->setDescription($description);
                $podcast->setEpisode($episode);
                $podcast->setTitle($title);
                $podcast->addVideo($videoId);
                $podcast->setGuests($guests);

                $podcasts[] = $podcast;
            }
        }
        return $podcasts;
    }

    private function getGuests($title)
    {
        $guests = [];
        foreach (self::$format as $regex) {
            if (preg_match('/' . $regex . '/', $title, $matches)) {
                $guests = $this->parseGuests($matches[2]);

                break;
            }
        }
        return $guests;
    }

    private function getEpisode($title)
    {
        $episode = '';
        foreach (self::$format as $regex) {
            if (preg_match('/' . $regex . '/', $title, $matches)) {
                $episode = $matches[1];
                break;
            }
        }
        return $episode;
    }

    private function getMultiPart($title)
    {
        $multiPart = false;
        foreach (self::$format as $regex) {
            if (preg_match('/' . $regex . '/', $title, $matches)) {
                $multiPart = $matches[3];
                break;
            }
        }
        return $multiPart;
    }

    private function get($offset = 0, $limit = 10, $orderBy = 'published')
    {
        $yt = new YouTube();
        $yt->getHttpClient()->setOptions(array('sslverifypeer' => false));

        $query = new VideoQuery;
        $query->setAuthor('PowerfulJRE');
        $query->setStartIndex($offset);
        $query->setMaxResults($limit);
        $query->setOrderBy($orderBy);

        return $yt->getVideoFeed($query);
    }

}
