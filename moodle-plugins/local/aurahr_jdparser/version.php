<?php
// JD Parser plugin — AI-powered Job Description analysis.
defined('MOODLE_INTERNAL') || die();

$plugin->component = 'local_aurahr_jdparser';
$plugin->version   = 2026052203;
$plugin->requires  = 2024042200;
$plugin->maturity  = MATURITY_ALPHA;
$plugin->release   = '1.0.0';
$plugin->dependencies = [
    'local_aurahr_jobs' => 2026052200,  // Depends on core jobs plugin.
];
