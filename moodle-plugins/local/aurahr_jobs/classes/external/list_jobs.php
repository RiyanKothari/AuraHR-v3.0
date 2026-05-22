<?php
namespace local_aurahr_jobs\external;

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_multiple_structure;
use core_external\external_value;

/**
 * Lists job postings with optional status filter.
 * Includes application count for each job.
 */
class list_jobs extends external_api {

    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'status' => new external_value(PARAM_TEXT, 'Filter by status (active/closed/archived/all)', VALUE_DEFAULT, 'active'),
        ]);
    }

    public static function execute(string $status): array {
        global $DB;

        $params = self::validate_parameters(self::execute_parameters(), ['status' => $status]);

        // Build WHERE clause.
        $where = '';
        $sqlparams = [];
        if ($params['status'] !== 'all') {
            $where = 'WHERE j.status = :status';
            $sqlparams['status'] = $params['status'];
        }

        // Fetch jobs with application counts.
        $sql = "SELECT j.*, COUNT(a.id) AS application_count
                FROM {local_aurahr_jobs} j
                LEFT JOIN {local_aurahr_applications} a ON a.jobid = j.id
                $where
                GROUP BY j.id
                ORDER BY j.timecreated DESC";

        $records = $DB->get_records_sql($sql, $sqlparams);

        $jobs = [];
        foreach ($records as $r) {
            $jobs[] = [
                'id'                => (int)$r->id,
                'title'             => $r->title,
                'description'       => $r->description,
                'department'        => $r->department ?? '',
                'vacancies'         => (int)$r->vacancies,
                'deadline'          => (int)($r->deadline ?? 0),
                'maxlimit'          => (int)$r->maxlimit,
                'status'            => $r->status,
                'createdby'         => (int)$r->createdby,
                'application_count' => (int)$r->application_count,
                'timecreated'       => (int)$r->timecreated,
                'timemodified'      => (int)$r->timemodified,
            ];
        }

        return ['jobs' => $jobs];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'jobs' => new external_multiple_structure(
                new external_single_structure([
                    'id'                => new external_value(PARAM_INT, 'Job ID'),
                    'title'             => new external_value(PARAM_TEXT, 'Job title'),
                    'description'       => new external_value(PARAM_RAW, 'Job description'),
                    'department'        => new external_value(PARAM_TEXT, 'Department'),
                    'vacancies'         => new external_value(PARAM_INT, 'Positions'),
                    'deadline'          => new external_value(PARAM_INT, 'Deadline timestamp'),
                    'maxlimit'          => new external_value(PARAM_INT, 'Max applications'),
                    'status'            => new external_value(PARAM_TEXT, 'Status'),
                    'createdby'         => new external_value(PARAM_INT, 'Creator user ID'),
                    'application_count' => new external_value(PARAM_INT, 'Number of applications'),
                    'timecreated'       => new external_value(PARAM_INT, 'Created timestamp'),
                    'timemodified'      => new external_value(PARAM_INT, 'Modified timestamp'),
                ])
            ),
        ]);
    }
}
