<?php
namespace local_aurahr_scheduler\external;

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;

class approve_reschedule extends external_api {
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'id'       => new external_value(PARAM_INT, 'Reschedule request ID'),
            'action'   => new external_value(PARAM_TEXT, 'approve or reject'),
            'new_time' => new external_value(PARAM_INT, 'Override new time', VALUE_DEFAULT, 0),
        ]);
    }

    public static function execute(int $id, string $action, int $new_time): array {
        global $DB;
        $params = self::validate_parameters(self::execute_parameters(), [
            'id' => $id, 'action' => $action, 'new_time' => $new_time
        ]);
        
        $context = \context_system::instance();
        require_capability('local/aurahr_scheduler:manage', $context);
        
        $request = $DB->get_record('local_aurahr_reschedule', ['id' => $params['id']], '*', MUST_EXIST);
        $interview = $DB->get_record('local_aurahr_interviews', ['id' => $request->interviewid], '*', MUST_EXIST);

        if (!in_array($params['action'], ['approve', 'reject'])) {
            throw new \invalid_parameter_exception('Invalid action');
        }

        $request->status = $params['action'];
        $request->timemodified = time();
        $DB->update_record('local_aurahr_reschedule', $request);

        if ($params['action'] === 'approve') {
            $time_to_set = $params['new_time'] > 0 ? $params['new_time'] : $request->new_time;
            if ($time_to_set && $time_to_set > 0) {
                $interview->scheduled_at = $time_to_set;
                $interview->timemodified = time();
                $DB->update_record('local_aurahr_interviews', $interview);
            }
        }

        return ['success' => true];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'success' => new external_value(PARAM_BOOL, 'Success'),
        ]);
    }
}
