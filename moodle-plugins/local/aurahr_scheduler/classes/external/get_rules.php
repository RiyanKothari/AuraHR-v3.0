<?php
namespace local_aurahr_scheduler\external;

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;

class get_rules extends external_api {
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'jobid' => new external_value(PARAM_INT, 'Job ID, 0 for global', VALUE_DEFAULT, 0),
        ]);
    }

    public static function execute(int $jobid): array {
        global $DB;
        $params = self::validate_parameters(self::execute_parameters(), ['jobid' => $jobid]);
        
        $context = \context_system::instance();
        require_capability('local/aurahr_scheduler:manage', $context);
        
        $record = $DB->get_record('local_aurahr_sched_rules', ['jobid' => $params['jobid']]);
        if (!$record && $params['jobid'] > 0) {
            // Fall back to global
            $record = $DB->get_record('local_aurahr_sched_rules', ['jobid' => 0]);
        }
        
        if ($record) {
            return [
                'min_gap_mins' => (int)$record->min_gap_mins,
                'max_per_day' => (int)$record->max_per_day,
                'preferred_duration' => (int)$record->preferred_duration,
                'buffer_days' => (int)$record->buffer_days,
            ];
        }

        // Return defaults if nothing found
        return [
            'min_gap_mins' => 15,
            'max_per_day' => 8,
            'preferred_duration' => 30,
            'buffer_days' => 1,
        ];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'min_gap_mins'       => new external_value(PARAM_INT, 'Minimum gap between interviews in mins'),
            'max_per_day'        => new external_value(PARAM_INT, 'Max interviews per day'),
            'preferred_duration' => new external_value(PARAM_INT, 'Preferred duration in mins'),
            'buffer_days'        => new external_value(PARAM_INT, 'Buffer days'),
        ]);
    }
}
