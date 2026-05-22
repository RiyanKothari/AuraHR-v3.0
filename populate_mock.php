<?php
define('CLI_SCRIPT', true);
require('C:/xampp/htdocs/moodle/config.php');

global $DB;

$apps = $DB->get_records('local_aurahr_applications');

if ($apps) {
    foreach ($apps as $app) {
        // Only update if they don't have mock data already or if it's 0
        if (empty($app->github_score)) {
            $app->github_score = rand(60, 95);
        }
        if (empty($app->linkedin_score)) {
            $app->linkedin_score = rand(60, 95);
        }
        
        $app->overall_score = ($app->jd_score + $app->academia_score + $app->github_score + $app->linkedin_score) / 4;
        
        $DB->update_record('local_aurahr_applications', $app);
    }
    echo "Updated mock scores for " . count($apps) . " applications.\n";
} else {
    echo "No applications found.\n";
}
