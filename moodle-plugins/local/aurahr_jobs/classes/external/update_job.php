<?php
namespace local_aurahr_jobs\external;

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;

/**
 * Update an existing job posting. Only provided fields are changed.
 */
class update_job extends external_api {

    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'jobid'       => new external_value(PARAM_INT, 'Job ID to update'),
            'title'       => new external_value(PARAM_TEXT, 'New title', VALUE_DEFAULT, ''),
            'description' => new external_value(PARAM_RAW, 'New description', VALUE_DEFAULT, ''),
            'department'  => new external_value(PARAM_TEXT, 'New department', VALUE_DEFAULT, ''),
            'vacancies'   => new external_value(PARAM_INT, 'New vacancy count', VALUE_DEFAULT, -1),
            'deadline'    => new external_value(PARAM_INT, 'New deadline', VALUE_DEFAULT, -1),
            'maxlimit'    => new external_value(PARAM_INT, 'New max limit', VALUE_DEFAULT, -1),
            'status'      => new external_value(PARAM_TEXT, 'New status', VALUE_DEFAULT, ''),
        ]);
    }

    public static function execute(
        int $jobid, string $title, string $description, string $department,
        int $vacancies, int $deadline, int $maxlimit, string $status
    ): array {
        global $DB;

        $params = self::validate_parameters(self::execute_parameters(), [
            'jobid' => $jobid, 'title' => $title, 'description' => $description,
            'department' => $department, 'vacancies' => $vacancies, 'deadline' => $deadline,
            'maxlimit' => $maxlimit, 'status' => $status,
        ]);

        $context = \context_system::instance();
        require_capability('local/aurahr_jobs:managejobs', $context);

        $job = $DB->get_record('local_aurahr_jobs', ['id' => $params['jobid']], '*', MUST_EXIST);

        // Update only non-empty / non-default fields.
        if (!empty($params['title']))       $job->title       = $params['title'];
        if (!empty($params['description'])) $job->description = $params['description'];
        if (!empty($params['department']))  $job->department   = $params['department'];
        if ($params['vacancies'] >= 0)      $job->vacancies    = $params['vacancies'];
        if ($params['deadline'] >= 0)       $job->deadline     = $params['deadline'];
        if ($params['maxlimit'] >= 0)       $job->maxlimit     = $params['maxlimit'];
        if (!empty($params['status'])) {
            if (!in_array($params['status'], ['active', 'closed', 'archived'])) {
                throw new \invalid_parameter_exception('Invalid status. Must be active, closed, or archived.');
            }
            $job->status = $params['status'];
        }

        $job->timemodified = time();
        $DB->update_record('local_aurahr_jobs', $job);

        return [
            'id'           => (int)$job->id,
            'title'        => $job->title,
            'status'       => $job->status,
            'timemodified' => (int)$job->timemodified,
            'success'      => true,
        ];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'id'           => new external_value(PARAM_INT, 'Job ID'),
            'title'        => new external_value(PARAM_TEXT, 'Updated title'),
            'status'       => new external_value(PARAM_TEXT, 'Updated status'),
            'timemodified' => new external_value(PARAM_INT, 'Modified timestamp'),
            'success'      => new external_value(PARAM_BOOL, 'Operation success'),
        ]);
    }
}
