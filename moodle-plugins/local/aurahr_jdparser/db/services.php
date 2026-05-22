<?php
defined('MOODLE_INTERNAL') || die();

$functions = [
    'local_aurahr_jdparser_parse' => [
        'classname'    => 'local_aurahr_jdparser\external\parse_jd',
        'description'  => 'Parse a job description using AI and produce 4-box skill analysis',
        'type'         => 'write',
        'ajax'         => true,
        'capabilities' => 'local/aurahr_jdparser:parse',
    ],
    'local_aurahr_jdparser_match_candidates' => [
        'classname'    => 'local_aurahr_jdparser\external\match_candidates',
        'description'  => 'Score and rank candidates against JD requirements',
        'type'         => 'write',
        'ajax'         => true,
        'capabilities' => 'local/aurahr_jdparser:match',
    ],
    'local_aurahr_jdparser_get_analysis' => [
        'classname'    => 'local_aurahr_jdparser\external\get_analysis',
        'description'  => 'Retrieve existing JD analysis for a job',
        'type'         => 'read',
        'ajax'         => true,
    ],
    'local_aurahr_jdparser_update_config' => [
        'classname'    => 'local_aurahr_jdparser\external\update_config',
        'description'  => 'Update JD parser config (e.g. pass count)',
        'type'         => 'write',
        'ajax'         => true,
        'capabilities' => 'local/aurahr_jdparser:parse',
    ],
];

$services = [
    'AuraHR JD Parser API' => [
        'functions'       => array_keys($functions),
        'restrictedusers' => 0,
        'enabled'         => 1,
        'shortname'       => 'aurahr_jdparser',
    ],
];
