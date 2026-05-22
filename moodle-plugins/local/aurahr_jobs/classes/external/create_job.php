<?php
namespace local_aurahr_jobs\external;

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;

/**
 * Creates a new job posting.
 */
class create_job extends external_api {

    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'title'       => new external_value(PARAM_TEXT, 'Job title'),
            'description' => new external_value(PARAM_RAW, 'Job description (may contain HTML)'),
            'department'  => new external_value(PARAM_TEXT, 'Department name', VALUE_DEFAULT, ''),
            'vacancies'   => new external_value(PARAM_INT, 'Number of open positions', VALUE_DEFAULT, 1),
            'deadline'    => new external_value(PARAM_INT, 'Application deadline (unix timestamp)', VALUE_DEFAULT, 0),
            'maxlimit'    => new external_value(PARAM_INT, 'Max applications accepted', VALUE_DEFAULT, 100),
        ]);
    }

    public static function execute(
        string $title,
        string $description,
        string $department,
        int $vacancies,
        int $deadline,
        int $maxlimit
    ): array {
        global $DB, $USER;

        // Validate parameters.
        $params = self::validate_parameters(self::execute_parameters(), [
            'title' => $title, 'description' => $description, 'department' => $department,
            'vacancies' => $vacancies, 'deadline' => $deadline, 'maxlimit' => $maxlimit,
        ]);

        // Check capability.
        $context = \context_system::instance();
        require_capability('local/aurahr_jobs:managejobs', $context);

        $now = time();
        $record = (object)[
            'title'        => $params['title'],
            'description'  => $params['description'],
            'department'   => $params['department'],
            'vacancies'    => $params['vacancies'],
            'deadline'     => $params['deadline'] ?: null,
            'maxlimit'     => $params['maxlimit'],
            'status'       => 'active',
            'createdby'    => $USER->id,
            'timecreated'  => $now,
            'timemodified' => $now,
        ];

        $record->id = $DB->insert_record('local_aurahr_jobs', $record);

        return [
            'id'           => $record->id,
            'title'        => $record->title,
            'description'  => $record->description,
            'department'   => $record->department ?? '',
            'vacancies'    => $record->vacancies,
            'deadline'     => $record->deadline ?? 0,
            'maxlimit'     => $record->maxlimit,
            'status'       => $record->status,
            'createdby'    => $record->createdby,
            'timecreated'  => $record->timecreated,
            'timemodified' => $record->timemodified,
        ];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'id'           => new external_value(PARAM_INT, 'Job ID'),
            'title'        => new external_value(PARAM_TEXT, 'Job title'),
            'description'  => new external_value(PARAM_RAW, 'Job description'),
            'department'   => new external_value(PARAM_TEXT, 'Department'),
            'vacancies'    => new external_value(PARAM_INT, 'Number of positions'),
            'deadline'     => new external_value(PARAM_INT, 'Deadline timestamp'),
            'maxlimit'     => new external_value(PARAM_INT, 'Max applications'),
            'status'       => new external_value(PARAM_TEXT, 'Job status'),
            'createdby'    => new external_value(PARAM_INT, 'Creator user ID'),
            'timecreated'  => new external_value(PARAM_INT, 'Created timestamp'),
            'timemodified' => new external_value(PARAM_INT, 'Modified timestamp'),
        ]);
    }
}
