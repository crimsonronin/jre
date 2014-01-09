<?php

require_once ('../../vendor/autoload.php');
error_reporting(E_ALL);
ini_set('display_errors', '1');
$twitter = new Jre\Fetcher\Twitter(
        '499576852-ojGwRvuH80QoQbKfyKbnUeM4FuTTiSN7AuuzZ1r8', '0h59MJanh1dieLOhYcsQIDmJPSCLAgIGdey0OcYWvkjQL', 'y8iiu3OVNYclPILfmj9bxg', 'CzlusZQYClF0LLMq4avoIfauFHaqlKolkUzC7e1rjk'
);

$backfill = new Jre\Fetcher\Backfill();
$backfill->setTwitter($twitter);

$limit = 10;
for ($i = 2; $i < 6; $i++) {
    $podcasts = $backfill->go($i * $limit, $limit);
    var_dump($podcasts);
}