<?php
define('CLI_SCRIPT', true);
require('C:/xampp/htdocs/moodle/config.php');

global $DB;
$records = $DB->get_records('local_aurahr_assessments');
foreach ($records as $r) {
    echo "ID: {$r->id}, JobID: {$r->jobid}, Title: {$r->title}, Status: {$r->status}, Questions length: " . strlen($r->questions ?? '') . "\n";
    if (!empty($r->questions)) {
        echo "Questions: " . substr($r->questions, 0, 200) . "...\n";
    }
}
