<?php
define('CLI_SCRIPT', true);
require('C:/xampp/htdocs/moodle/config.php');

global $DB;
$app = $DB->get_record('local_aurahr_applications', ['id' => 5]);
echo "Before: {$app->jd_score}\n";

$app->jd_score = 90.00;
$app->timemodified = time();

$success = $DB->update_record('local_aurahr_applications', $app);
echo "Update success: " . var_export($success, true) . "\n";

$app2 = $DB->get_record('local_aurahr_applications', ['id' => 5]);
echo "After: {$app2->jd_score}\n";
