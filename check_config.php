<?php
define('CLI_SCRIPT', true);
require('C:/xampp/htdocs/moodle/config.php');

echo "API URL: " . get_config('local_aurahr_jdparser', 'apiurl') . "\n";
echo "API Key: " . get_config('local_aurahr_jdparser', 'apikey') . "\n";
echo "Model: " . get_config('local_aurahr_jdparser', 'model') . "\n";
