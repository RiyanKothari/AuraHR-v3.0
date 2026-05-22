<?php
define('CLI_SCRIPT', true);
require('C:/xampp/htdocs/moodle/config.php');

$client = new \local_aurahr_jdparser\ai_client();
try {
    $response = $client->chat('You are an AI.', 'Hello, return a json {"test": 123}');
    echo "Success!\nResponse:\n" . $response . "\n";
} catch (Exception $e) {
    echo "Error:\n" . $e->getMessage() . "\n";
}
