<?php
define('CLI_SCRIPT', true);
require('C:/xampp/htdocs/moodle/config.php');

global $DB;
$apps = $DB->get_records('local_aurahr_applications', ['jobid' => 2]);
foreach ($apps as $app) {
    echo "App ID {$app->id}: JD Score = {$app->jd_score}\n";
}
