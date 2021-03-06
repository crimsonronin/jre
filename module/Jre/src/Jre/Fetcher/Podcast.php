<?php

namespace Jre\Fetcher;

use \DateTime;

class Podcast
{

    use SearchTrait;

    private $id;
    private $title;
    private $description;
    private $airDate;
    private $episode;
    private $featureImage;
    private $thumbnails = [];
    private $guests = [];
    private $videos = [];

    public function getId()
    {
        return $this->id;
    }

    public function setId($id)
    {
        $this->id = $id;
    }

    public function getTitle()
    {
        return $this->title;
    }

    public function getDescription()
    {
        return $this->description;
    }

    /**
     * 
     * @return DateTime
     */
    public function getAirDate()
    {
        return $this->airDate;
    }

    /**
     * 
     * @return int
     */
    public function getEpisode()
    {
        return $this->episode;
    }

    /**
     * 
     * @return array
     */
    public function getGuests()
    {
        return $this->guests;
    }

    public function getGuestsArray()
    {
        $guests = [];
        /* @var $guest Guest */
        foreach ($this->getGuests() as $guest) {
            $guests[] = $guest->getName();
        }
        return $guests;
    }

    /**
     * 
     * @return array
     */
    public function getVideos()
    {
        return $this->videos;
    }

    public function setTitle($title)
    {
        $this->title = $title;
    }

    public function setDescription($description)
    {
        $this->description = $description;
    }

    /**
     * 
     * @param DateTime $airDate
     */
    public function setAirDate(DateTime $airDate)
    {
        $this->airDate = $airDate;
    }

    public function setEpisode($episode)
    {
        $this->episode = (int) $episode;
    }

    /**
     * 
     * @param array $guests
     */
    public function setGuests(array $guests)
    {
        $this->guests = $guests;
    }

    public function addGuest(Guest $guest)
    {
        $this->guests[] = $guest;
    }

    /**
     * 
     * @param array $videos
     */
    public function setVideos(array $videos)
    {
        $this->videos = $videos;
    }

    public function addVideo($video)
    {
        $this->videos[] = $video;
    }

    public function getFeatureImage()
    {
        return $this->featureImage;
    }

    public function getThumbnails()
    {
        return $this->thumbnails;
    }

    public function setFeatureImage($featureImage)
    {
        $this->featureImage = $featureImage;
    }

    public function setThumbnails($thumbnails)
    {
        $this->thumbnails = $thumbnails;
    }

    public function addThumbnail($thumbnail)
    {
        $this->thumbnails[] = $thumbnail;
    }

    public function toArray()
    {
        $this->createSearchTerms(
                $this->getDescription(), $this->getEpisode(), $this->getGuestsArray()
        );

        return [
            'title' => $this->getTitle(),
            'description' => $this->getDescription(),
            'airDate' => $this->getAirDate(),
            'episode' => $this->getEpisode(),
            'guests' => $this->getGuestsArray(),
            'videos' => $this->getVideos(),
            'thumbnails' => $this->getThumbnails(),
            'featureImage' => $this->getFeatureImage(),
            'searchTerms' => $this->getSearchTerms(),
        ];
    }

}
