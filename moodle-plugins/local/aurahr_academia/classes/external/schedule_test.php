<?php
namespace local_aurahr_academia\external;

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;

/**
 * Schedule a test window and enroll candidates.
 */
class schedule_test extends external_api {

    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'assessmentid' => new external_value(PARAM_INT, 'Assessment ID'),
            'start_time'   => new external_value(PARAM_INT, 'Start time timestamp'),
            'end_time'     => new external_value(PARAM_INT, 'End time timestamp'),
        ]);
    }

    public static function execute(int $assessmentid, int $start_time, int $end_time): array {
        global $DB;

        $params = self::validate_parameters(self::execute_parameters(), [
            'assessmentid' => $assessmentid, 'start_time' => $start_time, 'end_time' => $end_time,
        ]);

        $context = \context_system::instance();
        require_capability('local/aurahr_academia:manage', $context);

        $assessment = $DB->get_record('local_aurahr_assessments', ['id' => $params['assessmentid']], '*', MUST_EXIST);

        // Update assessment window.
        $assessment->start_time = $params['start_time'];
        $assessment->end_time = $params['end_time'];
        $assessment->status = 'scheduled';
        $assessment->timemodified = time();
        $DB->update_record('local_aurahr_assessments', $assessment);

        // Enroll all candidates currently in the 'screened' stage.
        // We look for applications to the related job that have stage = 'screened'.
        $sql = "SELECT a.id, a.userid
                FROM {local_aurahr_applications} a
                WHERE a.jobid = :jobid AND a.stage = 'screened'";
        $applications = $DB->get_records_sql($sql, ['jobid' => $assessment->jobid]);

        $enrolled_count = 0;
        $now = time();
        foreach ($applications as $app) {
            // Check if already enrolled to avoid duplicates.
            if (!$DB->record_exists('local_aurahr_assess_enrol', ['assessmentid' => $assessment->id, 'userid' => $app->userid])) {
                $enrol = (object)[
                    'assessmentid'  => $assessment->id,
                    'userid'        => $app->userid,
                    'applicationid' => $app->id,
                    'status'        => 'pending',
                    'timecreated'   => $now,
                ];
                $DB->insert_record('local_aurahr_assess_enrol', $enrol);
                
                // Update application stage to academia.
                $app_update = clone $app;
                $app_update->stage = 'academia';
                $app_update->timemodified = $now;
                $DB->update_record('local_aurahr_applications', $app_update);
                
                $enrolled_count++;
            }
        }

        return [
            'success'        => true,
            'enrolled_count' => $enrolled_count,
            'status'         => 'scheduled'
        ];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'success'        => new external_value(PARAM_BOOL, 'Success'),
            'enrolled_count' => new external_value(PARAM_INT, 'Number of candidates enrolled'),
            'status'         => new external_value(PARAM_TEXT, 'New assessment status'),
        ]);
    }
}
