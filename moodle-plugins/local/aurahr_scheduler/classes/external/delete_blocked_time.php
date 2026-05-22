<?php
namespace local_aurahr_scheduler\external;

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;

class delete_blocked_time extends external_api {
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'id' => new external_value(PARAM_INT, 'Block ID'),
        ]);
    }

    public static function execute(int $id): array {
        global $DB, $USER;
        $params = self::validate_parameters(self::execute_parameters(), ['id' => $id]);
        
        $context = \context_system::instance();
        require_capability('local/aurahr_scheduler:setavailability', $context);
        
        $record = $DB->get_record('local_aurahr_blocked_times', ['id' => $params['id']], '*', MUST_EXIST);
        
        if ($record->userid != $USER->id) {
            require_capability('local/aurahr_scheduler:manage', $context);
        }

        $DB->delete_records('local_aurahr_blocked_times', ['id' => $params['id']]);

        return ['success' => true];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'success' => new external_value(PARAM_BOOL, 'Success'),
        ]);
    }
}
