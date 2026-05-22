<?php
namespace local_aurahr_academia\external;

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;

/**
 * Get test info for the current candidate.
 */
class get_candidate_test extends external_api {

    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'assessmentid' => new external_value(PARAM_INT, 'Assessment ID'),
        ]);
    }

    public static function execute(int $assessmentid): array {
        global $DB, $USER;

        $params = self::validate_parameters(self::execute_parameters(), [
            'assessmentid' => $assessmentid,
        ]);

        $context = \context_system::instance();
        require_capability('local/aurahr_academia:take', $context);

        $assessment = $DB->get_record('local_aurahr_assessments', ['id' => $params['assessmentid']], '*', MUST_EXIST);
        $enrol = $DB->get_record('local_aurahr_assess_enrol', ['assessmentid' => $assessment->id, 'userid' => $USER->id], '*', MUST_EXIST);
        
        $job = $DB->get_record('local_aurahr_jobs', ['id' => $assessment->jobid], 'title', MUST_EXIST);

        $now = time();
        $is_open = ($assessment->status === 'scheduled' || $assessment->status === 'active') && 
                   ($now >= $assessment->start_time && $now <= $assessment->end_time);

        return [
            'id'             => (int)$assessment->id,
            'title'          => $assessment->title,
            'job_title'      => $job->title,
            'duration_mins'  => (int)$assessment->duration_mins,
            'start_time'     => (int)$assessment->start_time,
            'end_time'       => (int)$assessment->end_time,
            'status'         => $enrol->status,
            'score'          => (float)($enrol->score ?? 0),
            'is_open'        => $is_open,
        ];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'id'             => new external_value(PARAM_INT, 'Assessment ID'),
            'title'          => new external_value(PARAM_TEXT, 'Title'),
            'job_title'      => new external_value(PARAM_TEXT, 'Job title'),
            'duration_mins'  => new external_value(PARAM_INT, 'Duration in mins'),
            'start_time'     => new external_value(PARAM_INT, 'Start time'),
            'end_time'       => new external_value(PARAM_INT, 'End time'),
            'status'         => new external_value(PARAM_TEXT, 'Candidate test status'),
            'score'          => new external_value(PARAM_FLOAT, 'Current score'),
            'is_open'        => new external_value(PARAM_BOOL, 'Is the test currently open to take?'),
        ]);
    }
}
