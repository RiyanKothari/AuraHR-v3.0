<?php
namespace local_aurahr_jobs\external;

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;

/**
 * Soft-deletes a job by setting status to 'archived'.
 */
class delete_job extends external_api {

    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'jobid' => new external_value(PARAM_INT, 'Job ID to archive'),
        ]);
    }

    public static function execute(int $jobid): array {
        global $DB;

        $params = self::validate_parameters(self::execute_parameters(), ['jobid' => $jobid]);

        $context = \context_system::instance();
        require_capability('local/aurahr_jobs:managejobs', $context);

        $job = $DB->get_record('local_aurahr_jobs', ['id' => $params['jobid']], '*', MUST_EXIST);
        $job->status = 'archived';
        $job->timemodified = time();
        $DB->update_record('local_aurahr_jobs', $job);

        return ['success' => true, 'message' => get_string('jobarchived', 'local_aurahr_jobs')];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'success' => new external_value(PARAM_BOOL, 'Operation success'),
            'message' => new external_value(PARAM_TEXT, 'Result message'),
        ]);
    }
}
