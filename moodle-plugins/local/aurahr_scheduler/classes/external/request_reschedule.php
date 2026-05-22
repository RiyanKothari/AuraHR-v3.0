<?php
namespace local_aurahr_scheduler\external;

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;

class request_reschedule extends external_api {
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'interviewid' => new external_value(PARAM_INT, 'Interview ID'),
            'reason'      => new external_value(PARAM_TEXT, 'Reason for reschedule'),
            'new_time'    => new external_value(PARAM_INT, 'Proposed new time', VALUE_DEFAULT, 0),
        ]);
    }

    public static function execute(int $interviewid, string $reason, int $new_time): array {
        global $DB, $USER;
        $params = self::validate_parameters(self::execute_parameters(), [
            'interviewid' => $interviewid, 'reason' => $reason, 'new_time' => $new_time
        ]);
        
        $context = \context_system::instance();
        require_capability('local/aurahr_scheduler:reschedule', $context);
        
        // Ensure interview exists
        $interview = $DB->get_record('local_aurahr_interviews', ['id' => $params['interviewid']], '*', MUST_EXIST);

        $record = new \stdClass();
        $record->interviewid = $params['interviewid'];
        $record->requestedby = $USER->id;
        $record->reason = $params['reason'];
        $record->new_time = $params['new_time'] > 0 ? $params['new_time'] : null;
        $record->status = 'pending';
        $record->timecreated = time();
        $record->timemodified = time();
        
        $id = $DB->insert_record('local_aurahr_reschedule', $record);

        return ['success' => true, 'id' => $id];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'success' => new external_value(PARAM_BOOL, 'Success'),
            'id'      => new external_value(PARAM_INT, 'Request ID'),
        ]);
    }
}
