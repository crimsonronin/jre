<?php

namespace Jre\Fetcher;

use \DateTime;

class Guest
{

    use SearchTrait;

    private $id;
    private $twitter;
    private $name;
    private $description;
    private $twitterUsername;
    private $image;
    private $site;
    private $episodes = [];
    private $lastAppearance;
    private $twitterUser;

    public function getId()
    {
        return $this->id;
    }

    public function setId($id)
    {
        $this->id = $id;
    }

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

    public function getTwitterUser()
    {
        if (empty($this->twitterUser)) {
            $twitter = $this->getTwitter();

            if ($twitter instanceof Twitter) {
                $this->twitterUser = $twitter->getUser($this->getName());
            }

            if (empty($this->twitterUser)) {
                $this->twitterUser = [
                    'username' => '',
                    'description' => '',
                    'site' => '',
                    'image' => ''
                ];
            }
        }
        return $this->twitterUser;
    }

    public function setTwitterUser($twitterUser)
    {
        $this->twitterUser = $twitterUser;
    }

    public function getEpisodes()
    {
        return $this->episodes;
    }

    public function setEpisodes($episodes)
    {
        $this->episodes = $episodes;
    }

    public function addEpisode($episode)
    {
        if (!empty($episode) && !in_array($episode, $this->episodes)) {
            $this->episodes[] = (int) $episode;
        }
    }

    public function getName()
    {
        return $this->name;
    }

    public function getDescription()
    {
        if (empty($this->description)) {
            $this->description = $this->getTwitterUser()['description'];
        }
        return $this->description;
    }

    public function getTwitterUsername()
    {
        if (empty($this->twitterUsername)) {
            $this->twitterUsername = $this->getTwitterUser()['username'];
        }
        return $this->twitterUsername;
    }

    public function getImage()
    {
        if (empty($this->image)) {
            $this->image = $this->getTwitterUser()['image'];
        }
        return $this->image;
    }

    public function getSite()
    {
        if (empty($this->site)) {
            $this->site = $this->getTwitterUser()['site'];
        }
        return $this->site;
    }

    public function getLastAppearance()
    {
        return $this->lastAppearance;
    }

    public function setName($name)
    {
        $this->name = $name;
    }

    public function setDescription($description)
    {
        $this->description = $description;
    }

    public function setTwitterUsername($twitterUsername)
    {
        $this->twitterUsername = $twitterUsername;
    }

    public function setImage($image)
    {
        $this->image = $image;
    }

    public function setSite($site)
    {
        $this->site = $site;
    }

    public function setLastAppearance(DateTime $lastAppearance)
    {
        $this->lastAppearance = $lastAppearance;
    }

    public function getNumberOfApperances()
    {
        return count($this->getEpisodes());
    }

    public function toArray()
    {
        
        $this->createSearchTerms(
            $this->getName(),
            $this->getDescription(),
            $this->getTwitterUsername(),
            $this->getEpisodes()
        );
        
        return [
            'name' => $this->getName(),
            'description' => $this->getDescription(),
            'twitterUsername' => $this->getTwitterUsername(),
            'site' => $this->getSite(),
            'image' => $this->getImage(),
            'lastAppearance' => $this->getLastAppearance(),
            'numberOfApperances' => $this->getNumberOfApperances(),
            'episodes' => $this->getEpisodes(),
            'searchTerms' => $this->getSearchTerms(),
        ];
    }

    public function fromArray($array)
    {
        if (isset($array['lastAppearance']['date']) && !empty($array['lastAppearance']['date'])) {
            $this->setLastAppearance(new DateTime($array['lastAppearance']['date']));
        }

        $this->setName($array['name']);
        $this->setDescription($array['description']);
        $this->setTwitterUsername($array['twitterUsername']);
        $this->setSite($array['site']);
        $this->setImage($array['image']);
        $this->setEpisodes($array['episodes']);
    }

}
