<?php
namespace local_aurahr_jdparser\external;

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;

/**
 * Retrieve an existing JD analysis for a job.
 */
class get_analysis extends external_api {

    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'jobid' => new external_value(PARAM_INT, 'Job ID'),
        ]);
    }

    public static function execute(int $jobid): array {
        global $DB;

        $params = self::validate_parameters(self::execute_parameters(), ['jobid' => $jobid]);

        $jd = $DB->get_record('local_aurahr_jd_analysis', ['jobid' => $params['jobid']]);

        if (!$jd) {
            return [
                'exists'      => false,
                'id'          => 0,
                'must_have'   => '[]',
                'good_to_have' => '[]',
                'future_proof' => '[]',
                'team_gap'    => '[]',
                'pass_count'  => 0,
                'timecreated' => 0,
            ];
        }

        return [
            'exists'      => true,
            'id'          => (int)$jd->id,
            'must_have'   => $jd->must_have ?? '[]',
            'good_to_have' => $jd->good_to_have ?? '[]',
            'future_proof' => $jd->future_proof ?? '[]',
            'team_gap'    => $jd->team_gap ?? '[]',
            'pass_count'  => (int)$jd->pass_count,
            'timecreated' => (int)$jd->timecreated,
        ];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'exists'      => new external_value(PARAM_BOOL, 'Whether analysis exists'),
            'id'          => new external_value(PARAM_INT, 'Analysis ID'),
            'must_have'   => new external_value(PARAM_RAW, 'JSON must-have skills'),
            'good_to_have' => new external_value(PARAM_RAW, 'JSON good-to-have skills'),
            'future_proof' => new external_value(PARAM_RAW, 'JSON future-proof skills'),
            'team_gap'    => new external_value(PARAM_RAW, 'JSON team-gap skills'),
            'pass_count'  => new external_value(PARAM_INT, 'Pass count'),
            'timecreated' => new external_value(PARAM_INT, 'Created timestamp'),
        ]);
    }
}
