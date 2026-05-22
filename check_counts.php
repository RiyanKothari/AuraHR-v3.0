<?php
define('CLI_SCRIPT', true);
require('C:/xampp/htdocs/moodle/config.php');

global $DB;
$count = $DB->count_records('local_aurahr_jobs');
echo "Jobs count: " . $count . "\n";

$apps = $DB->count_records('local_aurahr_applications');
echo "Apps count: " . $apps . "\n";
