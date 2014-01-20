<?php

set_time_limit(6000);

require_once (__DIR__ . '/../../vendor/autoload.php');
error_reporting(E_ALL);
ini_set('display_errors', '1');
$twitter = new Jre\Fetcher\Twitter(
        '499576852-ojGwRvuH80QoQbKfyKbnUeM4FuTTiSN7AuuzZ1r8', '0h59MJanh1dieLOhYcsQIDmJPSCLAgIGdey0OcYWvkjQL', 'y8iiu3OVNYclPILfmj9bxg', 'CzlusZQYClF0LLMq4avoIfauFHaqlKolkUzC7e1rjk'
);

$backfill = new Jre\Fetcher\Backfill();
$backfill->setTwitter($twitter);

$limit = 20;
$start = 0;
$end = 1;
//$end = 80;
for ($i = $start; $i < $end; $i++) {
    echo 'Running batch: ' . $i . "\n";
    $podcasts = $backfill->go($i * $limit, $limit);
}