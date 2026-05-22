<?php
namespace local_aurahr_scheduler\external;

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;

class block_time extends external_api {
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'userid'     => new external_value(PARAM_INT, 'User ID'),
            'start_time' => new external_value(PARAM_INT, 'Start timestamp'),
            'end_time'   => new external_value(PARAM_INT, 'End timestamp'),
            'reason'     => new external_value(PARAM_TEXT, 'Reason for block', VALUE_DEFAULT, ''),
        ]);
    }

    public static function execute(int $userid, int $start_time, int $end_time, string $reason): array {
        global $DB, $USER;
        $params = self::validate_parameters(self::execute_parameters(), [
            'userid' => $userid, 'start_time' => $start_time, 'end_time' => $end_time, 'reason' => $reason
        ]);
        
        $context = \context_system::instance();
        require_capability('local/aurahr_scheduler:setavailability', $context);
        
        if ($params['userid'] != $USER->id) {
            require_capability('local/aurahr_scheduler:manage', $context);
        }

        $record = new \stdClass();
        $record->userid = $params['userid'];
        $record->start_time = $params['start_time'];
        $record->end_time = $params['end_time'];
        $record->reason = $params['reason'];
        $record->timecreated = time();
        
        $id = $DB->insert_record('local_aurahr_blocked_times', $record);

        return ['success' => true, 'id' => $id];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'success' => new external_value(PARAM_BOOL, 'Success'),
            'id'      => new external_value(PARAM_INT, 'Block ID'),
        ]);
    }
}
