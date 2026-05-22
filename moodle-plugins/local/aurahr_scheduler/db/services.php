<?php
defined('MOODLE_INTERNAL') || die();

$functions = [
    'local_aurahr_scheduler_set_availability' => [
        'classname' => 'local_aurahr_scheduler\external\set_availability',
        'description' => 'Set availability slots for a user',
        'type' => 'write', 'ajax' => true,
        'capabilities' => 'local/aurahr_scheduler:setavailability',
    ],
    'local_aurahr_scheduler_get_availability' => [
        'classname' => 'local_aurahr_scheduler\external\get_availability',
        'description' => 'Get availability for a user',
        'type' => 'read', 'ajax' => true,
    ],
    'local_aurahr_scheduler_block_time' => [
        'classname' => 'local_aurahr_scheduler\external\block_time',
        'description' => 'Block a time period',
        'type' => 'write', 'ajax' => true,
        'capabilities' => 'local/aurahr_scheduler:setavailability',
    ],
    'local_aurahr_scheduler_auto_schedule' => [
        'classname' => 'local_aurahr_scheduler\external\auto_schedule',
        'description' => 'Auto-schedule interviews for a job based on availability',
        'type' => 'write', 'ajax' => true,
        'capabilities' => 'local/aurahr_scheduler:manage',
    ],
    'local_aurahr_scheduler_get_calendar' => [
        'classname' => 'local_aurahr_scheduler\external\get_calendar',
        'description' => 'Get calendar view with scheduled interviews',
        'type' => 'read', 'ajax' => true,
        'capabilities' => 'local/aurahr_scheduler:viewcalendar',
    ],
    'local_aurahr_scheduler_request_reschedule' => [
        'classname' => 'local_aurahr_scheduler\external\request_reschedule',
        'description' => 'Request to reschedule an interview',
        'type' => 'write', 'ajax' => true,
        'capabilities' => 'local/aurahr_scheduler:reschedule',
    ],
    'local_aurahr_scheduler_approve_reschedule' => [
        'classname' => 'local_aurahr_scheduler\external\approve_reschedule',
        'description' => 'Approve or reject a reschedule request',
        'type' => 'write', 'ajax' => true,
        'capabilities' => 'local/aurahr_scheduler:manage',
    ],
    'local_aurahr_scheduler_get_blocked_times' => [
        'classname' => 'local_aurahr_scheduler\external\get_blocked_times',
        'description' => 'Get blocked time periods',
        'type' => 'read', 'ajax' => true,
    ],
    'local_aurahr_scheduler_delete_blocked_time' => [
        'classname' => 'local_aurahr_scheduler\external\delete_blocked_time',
        'description' => 'Delete a blocked time period',
        'type' => 'write', 'ajax' => true,
        'capabilities' => 'local/aurahr_scheduler:setavailability',
    ],
    'local_aurahr_scheduler_get_pending_requests' => [
        'classname' => 'local_aurahr_scheduler\external\get_pending_requests',
        'description' => 'Get pending reschedule requests',
        'type' => 'read', 'ajax' => true,
        'capabilities' => 'local/aurahr_scheduler:manage',
    ],
    'local_aurahr_scheduler_update_rules' => [
        'classname' => 'local_aurahr_scheduler\external\update_rules',
        'description' => 'Update scheduling rules',
        'type' => 'write', 'ajax' => true,
        'capabilities' => 'local/aurahr_scheduler:manage',
    ],
    'local_aurahr_scheduler_get_rules' => [
        'classname' => 'local_aurahr_scheduler\external\get_rules',
        'description' => 'Get scheduling rules',
        'type' => 'read', 'ajax' => true,
    ],
    'local_aurahr_scheduler_cancel_interview' => [
        'classname' => 'local_aurahr_scheduler\external\cancel_interview',
        'description' => 'Cancel an interview',
        'type' => 'write', 'ajax' => true,
        'capabilities' => 'local/aurahr_scheduler:manage',
    ],
    'local_aurahr_scheduler_override_slot' => [
        'classname' => 'local_aurahr_scheduler\external\override_slot',
        'description' => 'Force an interview slot override',
        'type' => 'write', 'ajax' => true,
        'capabilities' => 'local/aurahr_scheduler:manage',
    ],
];

$services = [
    'AuraHR Scheduler API' => [
        'functions'       => array_keys($functions),
        'restrictedusers' => 0,
        'enabled'         => 1,
        'shortname'       => 'aurahr_scheduler',
    ],
];
