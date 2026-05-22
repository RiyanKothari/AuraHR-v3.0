<?php
namespace local_aurahr_scheduler\external;

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_multiple_structure;
use core_external\external_value;

class get_availability extends external_api {
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'userid' => new external_value(PARAM_INT, 'User ID', VALUE_DEFAULT, 0),
        ]);
    }

    public static function execute(int $userid): array {
        global $DB, $USER;
        $params = self::validate_parameters(self::execute_parameters(), ['userid' => $userid]);
        
        $uid = $params['userid'] > 0 ? $params['userid'] : $USER->id;
        
        $records = $DB->get_records('local_aurahr_availability', ['userid' => $uid]);
        
        $slots = [];
        foreach ($records as $r) {
            $slots[] = [
                'id' => (int)$r->id,
                'userid' => (int)$r->userid,
                'day_of_week' => (int)$r->day_of_week,
                'start_time' => $r->start_time,
                'end_time' => $r->end_time,
                'recurring' => (int)$r->recurring,
                'specific_date' => (int)$r->specific_date,
                'timecreated' => (int)$r->timecreated,
            ];
        }

        return ['slots' => $slots];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'slots' => new external_multiple_structure(
                new external_single_structure([
                    'id'            => new external_value(PARAM_INT, 'Slot ID'),
                    'userid'        => new external_value(PARAM_INT, 'User ID'),
                    'day_of_week'   => new external_value(PARAM_INT, 'Day of week'),
                    'start_time'    => new external_value(PARAM_TEXT, 'Start time'),
                    'end_time'      => new external_value(PARAM_TEXT, 'End time'),
                    'recurring'     => new external_value(PARAM_INT, 'Recurring flag'),
                    'specific_date' => new external_value(PARAM_INT, 'Specific date timestamp'),
                    'timecreated'   => new external_value(PARAM_INT, 'Time created'),
                ])
            ),
        ]);
    }
}
