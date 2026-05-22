<?php
namespace local_aurahr_scheduler\external;

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;

class cancel_interview extends external_api {
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'interviewid' => new external_value(PARAM_INT, 'Interview ID'),
            'reason'      => new external_value(PARAM_TEXT, 'Reason for cancellation', VALUE_DEFAULT, ''),
        ]);
    }

    public static function execute(int $interviewid, string $reason): array {
        global $DB;
        $params = self::validate_parameters(self::execute_parameters(), [
            'interviewid' => $interviewid, 'reason' => $reason
        ]);
        
        $context = \context_system::instance();
        require_capability('local/aurahr_scheduler:manage', $context);
        
        $interview = $DB->get_record('local_aurahr_interviews', ['id' => $params['interviewid']], '*', MUST_EXIST);
        $interview->status = 'cancelled';
        $interview->timemodified = time();
        $DB->update_record('local_aurahr_interviews', $interview);

        return ['success' => true];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'success' => new external_value(PARAM_BOOL, 'Success'),
        ]);
    }
}
