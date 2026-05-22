<?php
defined('MOODLE_INTERNAL') || die();

$capabilities = [
    'local/aurahr_interview:manage' => [
        'riskbitmask' => RISK_CONFIG, 'captype' => 'write',
        'contextlevel' => CONTEXT_SYSTEM, 'archetypes' => ['manager' => CAP_ALLOW],
    ],
    'local/aurahr_interview:conduct' => [
        'captype' => 'write', 'contextlevel' => CONTEXT_SYSTEM,
        'archetypes' => ['manager' => CAP_ALLOW, 'editingteacher' => CAP_ALLOW],
    ],
    'local/aurahr_interview:attend' => [
        'captype' => 'write', 'contextlevel' => CONTEXT_SYSTEM,
        'archetypes' => ['user' => CAP_ALLOW],
    ],
    'local/aurahr_interview:proctor' => [
        'captype' => 'write', 'contextlevel' => CONTEXT_SYSTEM,
        'archetypes' => ['user' => CAP_ALLOW],
    ],
    'local/aurahr_interview:viewproctor' => [
        'captype' => 'read', 'contextlevel' => CONTEXT_SYSTEM,
        'archetypes' => ['manager' => CAP_ALLOW],
    ],
];
