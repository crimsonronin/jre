<?php

namespace Jre\Fetcher;

use Zend\Http\Headers;
use Zend\Http\Client;
use Zend\Http\Client\Adapter\Curl;
use Zend\Http\Request;
use Zend\Stdlib\Parameters;
use Jre\Fetcher\Guest;
use Jre\Fetcher\Podcast;

class Parse
{
    public function savePodcast(Podcast $podcast)
    {
        $episode = $podcast->getEpisode();
        return $this->save('Podcast', $podcast->toArray(), ['episode' => $episode]);
    }

    public function saveGuest(Guest $guest)
    {
        $name = $guest->getName();
        return $this->save('Guest', $guest->toArray(), ['name' => $name]);
    }

    public function getGuest($by = [])
    {
        return $this->get('Guest', $by);
    }

    public function save($class, $data, $dupeCheck = [])
    {
        if (!empty($dupeCheck)) {
            $r = $this->get($class, $dupeCheck);
            if ($r !== false) {
                if (isset($r[0]['objectId'])) {
                    return $this->update($class, $r[0]['objectId'], $data);
                } else {
                    return true;
                }
            }
        }

        $uri = 'https://api.parse.com/1/classes/' . $class;

        $client = new Client();
        $client->setAdapter(new Curl());

        $request = new Request();

        $request->setHeaders($this->getHeaders());
        $request->setUri($uri);
        $request->setMethod(Request::METHOD_POST);
        $request->setContent(json_encode($data));
        $response = $client->dispatch($request);

        $r = json_decode($response->getContent(), true);
        if (!empty($r['createdAt'])) {
            return true;
        }
        return false;
    }

    public function update($class, $id, $data)
    {
        $uri = 'https://api.parse.com/1/classes/' . $class . '/' . $id;

        $client = new Client();
        $client->setAdapter(new Curl());

        $request = new Request();

        $request->setHeaders($this->getHeaders());
        $request->setUri($uri);
        $request->setMethod(Request::METHOD_PUT);
        $request->setContent(json_encode($data));
        $response = $client->dispatch($request);

        $r = json_decode($response->getContent(), true);

        if (!empty($r['createdAt'])) {
            return true;
        }
        return false;
    }

    public function get($class, $keyValue = [])
    {
        $uri = 'https://api.parse.com/1/classes/' . $class;

        $client = new Client();
        $curl = new Curl();
        $client->setAdapter($curl);

        $request = new Request();
        $request->setHeaders($this->getHeaders());
        $request->setUri($uri);

        if (!empty($keyValue)) {
            $params = new Parameters;
            $params->set('where', json_encode($keyValue));
            $request->setQuery($params);
        }

        $request->setMethod(Request::METHOD_GET);
        $response = $client->dispatch($request);

        $r = json_decode($response->getContent(), true);
        if (!empty($r['results'])) {
            return $r['results'];
        }
        return false;
    }

    private function getHeaders()
    {
        $headers = new Headers;
        $headers->addHeaders([
            'X-Parse-Application-Id' => 'eQsrp5wXs19ySB8Cz9NjE6z3ziJNgqxNdG2sZUlG',
            'X-Parse-REST-API-Key' => 'hkjgEpfIcNtUSpknR4o0Sp3zenumJbaNa1OgiXCc',
            'Content-Type' => 'application/json',
        ]);
        return $headers;
    }

}
