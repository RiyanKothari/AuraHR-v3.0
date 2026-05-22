<?php
namespace local_aurahr_interview\external;

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;

/**
 * Finalise interview and optionally move pipeline to next stage (offer/rejected).
 */
class finalise extends external_api {

    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'interviewid' => new external_value(PARAM_INT, 'Interview ID'),
            'next_stage'  => new external_value(PARAM_TEXT, 'Next stage (offer, rejected, etc.)'),
        ]);
    }

    public static function execute(int $interviewid, string $next_stage): array {
        global $DB;

        $params = self::validate_parameters(self::execute_parameters(), [
            'interviewid' => $interviewid, 'next_stage' => $next_stage,
        ]);

        $context = \context_system::instance();
        require_capability('local/aurahr_interview:manage', $context);

        $interview = $DB->get_record('local_aurahr_interviews', ['id' => $params['interviewid']], '*', MUST_EXIST);
        
        $app = $DB->get_record('local_aurahr_applications', ['id' => $interview->applicationid], '*', MUST_EXIST);
        $app->stage = $params['next_stage'];
        $app->timemodified = time();
        $DB->update_record('local_aurahr_applications', $app);

        return ['success' => true];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'success' => new external_value(PARAM_BOOL, 'Success'),
        ]);
    }
}
