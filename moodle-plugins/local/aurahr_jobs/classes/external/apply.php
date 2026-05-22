<?php
namespace local_aurahr_jobs\external;

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;

/**
 * Apply to a job posting as the current (candidate) user.
 * Checks for duplicate applications and max-limit enforcement.
 */
class apply extends external_api {

    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'jobid' => new external_value(PARAM_INT, 'Job posting ID to apply for'),
        ]);
    }

    public static function execute(int $jobid): array {
        global $DB, $USER;

        $params = self::validate_parameters(self::execute_parameters(), ['jobid' => $jobid]);

        $context = \context_system::instance();
        require_capability('local/aurahr_jobs:apply', $context);

        // Verify job exists and is active.
        $job = $DB->get_record('local_aurahr_jobs', ['id' => $params['jobid']], '*', MUST_EXIST);
        if ($job->status !== 'active') {
            throw new \moodle_exception('jobnotactive', 'local_aurahr_jobs', '', null,
                'This job posting is no longer accepting applications.');
        }

        // Check deadline.
        if (!empty($job->deadline) && time() > $job->deadline) {
            throw new \moodle_exception('deadlinepassed', 'local_aurahr_jobs', '', null,
                'The application deadline has passed.');
        }

        // Check for duplicate application.
        if ($DB->record_exists('local_aurahr_applications', ['userid' => $USER->id, 'jobid' => $params['jobid']])) {
            throw new \moodle_exception('duplicateapplication', 'local_aurahr_jobs', '', null,
                get_string('duplicateapplication', 'local_aurahr_jobs'));
        }

        // Check max limit.
        $currentcount = $DB->count_records('local_aurahr_applications', ['jobid' => $params['jobid']]);
        if ($currentcount >= $job->maxlimit) {
            throw new \moodle_exception('maxlimitreached', 'local_aurahr_jobs', '', null,
                'Maximum number of applications has been reached for this posting.');
        }

        $now = time();
        $application = (object)[
            'userid'       => $USER->id,
            'jobid'        => $params['jobid'],
            'stage'        => 'applied',
            'malpractice'  => 0,
            'timecreated'  => $now,
            'timemodified' => $now,
        ];

        $application->id = $DB->insert_record('local_aurahr_applications', $application);

        return [
            'id'          => (int)$application->id,
            'userid'      => (int)$application->userid,
            'jobid'       => (int)$application->jobid,
            'stage'       => $application->stage,
            'timecreated' => (int)$application->timecreated,
            'success'     => true,
            'message'     => get_string('applicationsubmitted', 'local_aurahr_jobs'),
        ];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'id'          => new external_value(PARAM_INT, 'Application ID'),
            'userid'      => new external_value(PARAM_INT, 'Candidate user ID'),
            'jobid'       => new external_value(PARAM_INT, 'Job ID'),
            'stage'       => new external_value(PARAM_TEXT, 'Pipeline stage'),
            'timecreated' => new external_value(PARAM_INT, 'Created timestamp'),
            'success'     => new external_value(PARAM_BOOL, 'Success flag'),
            'message'     => new external_value(PARAM_TEXT, 'Result message'),
        ]);
    }
}
