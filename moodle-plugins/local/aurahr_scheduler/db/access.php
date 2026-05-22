<?php
defined('MOODLE_INTERNAL') || die();

$capabilities = [
    'local/aurahr_scheduler:manage' => [
        'riskbitmask' => RISK_CONFIG, 'captype' => 'write',
        'contextlevel' => CONTEXT_SYSTEM, 'archetypes' => ['manager' => CAP_ALLOW],
    ],
    'local/aurahr_scheduler:setavailability' => [
        'captype' => 'write', 'contextlevel' => CONTEXT_SYSTEM,
        'archetypes' => ['user' => CAP_ALLOW, 'manager' => CAP_ALLOW],
    ],
    'local/aurahr_scheduler:viewcalendar' => [
        'captype' => 'read', 'contextlevel' => CONTEXT_SYSTEM,
        'archetypes' => ['user' => CAP_ALLOW, 'manager' => CAP_ALLOW],
    ],
    'local/aurahr_scheduler:reschedule' => [
        'captype' => 'write', 'contextlevel' => CONTEXT_SYSTEM,
        'archetypes' => ['user' => CAP_ALLOW],
    ],
];
