<?php
namespace local_aurahr_scheduler\external;

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_multiple_structure;
use core_external\external_value;

class get_blocked_times extends external_api {
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'userid' => new external_value(PARAM_INT, 'User ID', VALUE_DEFAULT, 0),
        ]);
    }

    public static function execute(int $userid): array {
        global $DB, $USER;
        $params = self::validate_parameters(self::execute_parameters(), ['userid' => $userid]);
        
        $uid = $params['userid'] > 0 ? $params['userid'] : $USER->id;
        
        $records = $DB->get_records('local_aurahr_blocked_times', ['userid' => $uid]);
        
        $blocks = [];
        foreach ($records as $r) {
            $blocks[] = [
                'id' => (int)$r->id,
                'userid' => (int)$r->userid,
                'start_time' => (int)$r->start_time,
                'end_time' => (int)$r->end_time,
                'reason' => $r->reason,
                'timecreated' => (int)$r->timecreated,
            ];
        }

        return ['blocks' => $blocks];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'blocks' => new external_multiple_structure(
                new external_single_structure([
                    'id'          => new external_value(PARAM_INT, 'Block ID'),
                    'userid'      => new external_value(PARAM_INT, 'User ID'),
                    'start_time'  => new external_value(PARAM_INT, 'Start timestamp'),
                    'end_time'    => new external_value(PARAM_INT, 'End timestamp'),
                    'reason'      => new external_value(PARAM_TEXT, 'Reason'),
                    'timecreated' => new external_value(PARAM_INT, 'Time created'),
                ])
            ),
        ]);
    }
}
