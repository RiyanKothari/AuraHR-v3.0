<?php
define('CLI_SCRIPT', true);
require('C:/xampp/htdocs/moodle/config.php');

global $DB;

// Update the first application found
$apps = $DB->get_records('local_aurahr_applications', [], 'id ASC', '*', 0, 1);

if ($apps) {
    $app = reset($apps);
    $user = $DB->get_record('user', ['id' => $app->userid]);
    
    // Change name to Shreyash Poddar just for the demo
    if ($user) {
        $user->firstname = 'Shreyash';
        $user->lastname = 'Poddar';
        $DB->update_record('user', $user);
        echo "Renamed Candidate (User ID {$user->id}) to Shreyash Poddar.\n";
    }
    
    $app->resume_skills = "Node.js, TypeScript, Next.js, React, Moodle, PHP, MySQL, System Design, Data Structures, Algorithms";
    $app->github_url = "https://github.com/ShreyashPoddar";
    $app->linkedin_url = "https://www.linkedin.com/in/shreyash-poddar-216938328/";
    
    $DB->update_record('local_aurahr_applications', $app);
    echo "Updated mock skills, GitHub URL, and LinkedIn URL for App ID: {$app->id}.\n";
} else {
    echo "No applications found to update.\n";
}
