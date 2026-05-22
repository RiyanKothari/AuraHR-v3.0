<?php
namespace local_aurahr_academia\external;

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;

class submit_test extends external_api {
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'candidateId' => new external_value(PARAM_INT, 'Candidate ID (User ID)', VALUE_OPTIONAL),
            'jobId' => new external_value(PARAM_INT, 'Job ID', VALUE_OPTIONAL),
            'score' => new external_value(PARAM_FLOAT, 'Test Score'),
        ]);
    }

    public static function execute($candidateId, $jobId, $score): array {
        global $DB, $USER;
        $params = self::validate_parameters(self::execute_parameters(), [
            'candidateId' => $candidateId,
            'jobId' => $jobId,
            'score' => $score,
        ]);

        $userid = $params['candidateId'] ?: $USER->id;

        // Find the application
        if ($params['jobId']) {
            $app = $DB->get_record('local_aurahr_applications', ['userid' => $userid, 'jobid' => $params['jobId']]);
        } else {
            $apps = $DB->get_records('local_aurahr_applications', ['userid' => $userid], 'id DESC', '*', 0, 1);
            $app = reset($apps);
        }

        if ($app) {
            $app->academia_score = $params['score'];
            
            // Recalculate overall score
            $scores = array_filter([
                $app->jd_score ?? 0,
                $app->academia_score ?? 0,
                $app->interview_score ?? 0,
            ], fn($s) => $s > 0);
            
            $app->overall_score = !empty($scores) ? array_sum($scores) / count($scores) : 0;
            
            if ($app->stage === 'screened') {
                $app->stage = 'interview';
            }
            
            $app->timemodified = time();
            $DB->update_record('local_aurahr_applications', $app);
            return ['success' => true];
        }

        return ['success' => false];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'success' => new external_value(PARAM_BOOL, 'Status'),
        ]);
    }
}
