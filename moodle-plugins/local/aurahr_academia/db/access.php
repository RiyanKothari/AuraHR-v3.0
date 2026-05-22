<?php
defined('MOODLE_INTERNAL') || die();

$capabilities = [
    'local/aurahr_academia:manage' => [
        'riskbitmask'  => RISK_CONFIG,
        'captype'      => 'write',
        'contextlevel' => CONTEXT_SYSTEM,
        'archetypes'   => ['manager' => CAP_ALLOW],
    ],
    'local/aurahr_academia:take' => [
        'captype'      => 'write',
        'contextlevel' => CONTEXT_SYSTEM,
        'archetypes'   => ['user' => CAP_ALLOW],
    ],
    'local/aurahr_academia:viewresults' => [
        'captype'      => 'read',
        'contextlevel' => CONTEXT_SYSTEM,
        'archetypes'   => ['manager' => CAP_ALLOW],
    ],
];
