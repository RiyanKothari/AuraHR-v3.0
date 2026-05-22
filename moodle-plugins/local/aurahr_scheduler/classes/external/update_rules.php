<?php
namespace local_aurahr_scheduler\external;

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;

class update_rules extends external_api {
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'min_gap_mins'       => new external_value(PARAM_INT, 'Minimum gap between interviews in mins'),
            'max_per_day'        => new external_value(PARAM_INT, 'Max interviews per day'),
            'preferred_duration' => new external_value(PARAM_INT, 'Preferred duration in mins'),
            'buffer_days'        => new external_value(PARAM_INT, 'Buffer days'),
            'jobid'              => new external_value(PARAM_INT, 'Job ID, 0 for global', VALUE_DEFAULT, 0),
        ]);
    }

    public static function execute(int $min_gap_mins, int $max_per_day, int $preferred_duration, int $buffer_days, int $jobid): array {
        global $DB;
        $params = self::validate_parameters(self::execute_parameters(), [
            'min_gap_mins' => $min_gap_mins, 'max_per_day' => $max_per_day,
            'preferred_duration' => $preferred_duration, 'buffer_days' => $buffer_days, 'jobid' => $jobid
        ]);
        
        $context = \context_system::instance();
        require_capability('local/aurahr_scheduler:manage', $context);
        
        $record = $DB->get_record('local_aurahr_sched_rules', ['jobid' => $params['jobid']]);
        
        if ($record) {
            $record->min_gap_mins = $params['min_gap_mins'];
            $record->max_per_day = $params['max_per_day'];
            $record->preferred_duration = $params['preferred_duration'];
            $record->buffer_days = $params['buffer_days'];
            $DB->update_record('local_aurahr_sched_rules', $record);
        } else {
            $record = new \stdClass();
            $record->jobid = $params['jobid'];
            $record->min_gap_mins = $params['min_gap_mins'];
            $record->max_per_day = $params['max_per_day'];
            $record->preferred_duration = $params['preferred_duration'];
            $record->buffer_days = $params['buffer_days'];
            $record->timecreated = time();
            $DB->insert_record('local_aurahr_sched_rules', $record);
        }

        return ['success' => true];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'success' => new external_value(PARAM_BOOL, 'Success'),
        ]);
    }
}
