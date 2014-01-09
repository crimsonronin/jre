<?php

namespace Jre\Fetcher;

use ZendService\Twitter\Twitter as TwitterService;

class Twitter
{
    private $token;
    private $secret;
    private $consumerKey;
    private $consumerSecret;
    private $twitter;

    public function __construct($token, $secret, $consumerKey, $consumerSecret)
    {
        $this->token = $token;
        $this->secret = $secret;
        $this->consumerKey = $consumerKey;
        $this->consumerSecret = $consumerSecret;
    }

    public function getUser($name)
    {
        $twitter = $this->getTwitter();

        $response = $twitter->usersSearch($this->cleanName($name));
        if ($response->isSuccess()) {
            $json = $response->getRawResponse();
            $users = json_decode($json, true);
            foreach ($users as $user) {
                if ($this->isGuest($user, $name)) {
                    return [
                        'username' => $user['screen_name'],
                        'description' => $user['description'],
                        'site' => $user['url'],
                        'image' => str_replace('_normal', '', $user['profile_image_url'])
                    ];
                }
            }
        }
        return false;
    }

    private function cleanName($name)
    {
        return str_replace(['"'], '', $name);
    }

    private function isGuest($user, $guestName)
    {
        $r = 0;

        $followers = $user['followers_count'];
        $verified = $user['verified'];
        $name = $user['name'];

        if (strtolower($guestName) == strtolower($name) || strstr($guestName, $name) || strstr($name, $guestName)) {
            $r += 1;
        }

        if ($followers > 2000) {
            $r += 0.5;
        }

        if ($verified == true) {
            $r += 0.5;
        }

        return $r >= 1;
    }

    /**
     * 
     * @return TwitterService
     */
    public function getTwitter()
    {
        if (empty($this->twitter)) {
            $twitter = new TwitterService([
                'access_token' => [
                    'token' => $this->getToken(),
                    'secret' => $this->getSecret()
                ],
                'oauth_options' => [
                    'consumerKey' => $this->getConsumerKey(),
                    'consumerSecret' => $this->getConsumerSecret()
                ]
            ]);
            $twitter->getHttpClient()->setOptions(array('sslverifypeer' => false));
            $response = $twitter->accountVerifyCredentials();
            if ($response->isSuccess()) {
                $this->setTwitter($twitter);
            } else {
                throw new \Exception('Access keys are incorrect');
            }
        }
        return $this->twitter;
    }

    /**
     * 
     * @param TwitterService $twitter
     */
    public function setTwitter(TwitterService $twitter)
    {
        $this->twitter = $twitter;
    }

    /**
     * 
     * @return string
     */
    public function getToken()
    {
        return $this->token;
    }

    /**
     * 
     * @return string
     */
    public function getSecret()
    {
        return $this->secret;
    }

    public function getConsumerKey()
    {
        return $this->consumerKey;
    }

    public function getConsumerSecret()
    {
        return $this->consumerSecret;
    }

    public function setConsumerKey($consumerKey)
    {
        $this->consumerKey = $consumerKey;
    }

    public function setConsumerSecret($consumerSecret)
    {
        $this->consumerSecret = $consumerSecret;
    }

    /**
     * 
     * @param string $token
     */
    public function setToken($token)
    {
        $this->token = $token;
    }

    /**
     * 
     * @param string $secret
     */
    public function setSecret($secret)
    {
        $this->secret = $secret;
    }

}
