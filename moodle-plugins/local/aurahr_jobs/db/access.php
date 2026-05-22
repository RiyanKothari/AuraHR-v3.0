<?php
// Capability definitions for local_aurahr_jobs.
defined('MOODLE_INTERNAL') || die();

$capabilities = [

    // Allows creating, editing, and closing job postings.
    'local/aurahr_jobs:managejobs' => [
        'riskbitmask'  => RISK_CONFIG,
        'captype'      => 'write',
        'contextlevel' => CONTEXT_SYSTEM,
        'archetypes'   => [
            'manager' => CAP_ALLOW,
        ],
    ],

    // Allows viewing all candidate applications for any job.
    'local/aurahr_jobs:viewapplications' => [
        'captype'      => 'read',
        'contextlevel' => CONTEXT_SYSTEM,
        'archetypes'   => [
            'manager'        => CAP_ALLOW,
            'editingteacher' => CAP_ALLOW,  // Interviewer role maps here
        ],
    ],

    // Allows applying to job postings (candidate role).
    'local/aurahr_jobs:apply' => [
        'captype'      => 'write',
        'contextlevel' => CONTEXT_SYSTEM,
        'archetypes'   => [
            'user' => CAP_ALLOW,
        ],
    ],

    // Allows viewing own application status and scores.
    'local/aurahr_jobs:viewownapp' => [
        'captype'      => 'read',
        'contextlevel' => CONTEXT_SYSTEM,
        'archetypes'   => [
            'user' => CAP_ALLOW,
        ],
    ],
];
