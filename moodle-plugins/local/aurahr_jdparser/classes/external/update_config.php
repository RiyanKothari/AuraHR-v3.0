<?php
namespace local_aurahr_jdparser\external;

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;

class update_config extends external_api {
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'jobid'      => new external_value(PARAM_INT, 'Job ID'),
            'pass_count' => new external_value(PARAM_INT, 'New pass count'),
        ]);
    }

    public static function execute(int $jobid, int $pass_count): array {
        global $DB;
        $params = self::validate_parameters(self::execute_parameters(), [
            'jobid' => $jobid, 'pass_count' => $pass_count,
        ]);
        $context = \context_system::instance();
        require_capability('local/aurahr_jdparser:parse', $context);

        $record = $DB->get_record('local_aurahr_jd_analysis', ['jobid' => $params['jobid']]);
        if ($record) {
            $record->pass_count = $params['pass_count'];
            $DB->update_record('local_aurahr_jd_analysis', $record);
        }
        return ['success' => true];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'success' => new external_value(PARAM_BOOL, 'Operation success'),
        ]);
    }
}
