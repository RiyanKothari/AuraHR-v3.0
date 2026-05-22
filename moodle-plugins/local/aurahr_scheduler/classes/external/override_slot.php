<?php
namespace local_aurahr_scheduler\external;

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;

class override_slot extends external_api {
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'applicationid' => new external_value(PARAM_INT, 'Application ID'),
            'interviewerid' => new external_value(PARAM_INT, 'Interviewer User ID'),
            'scheduled_at'  => new external_value(PARAM_INT, 'Scheduled time unix timestamp'),
            'duration_mins' => new external_value(PARAM_INT, 'Duration in mins', VALUE_DEFAULT, 30),
        ]);
    }

    public static function execute(int $applicationid, int $interviewerid, int $scheduled_at, int $duration_mins): array {
        global $DB;
        $params = self::validate_parameters(self::execute_parameters(), [
            'applicationid' => $applicationid, 'interviewerid' => $interviewerid, 
            'scheduled_at' => $scheduled_at, 'duration_mins' => $duration_mins
        ]);
        
        $context = \context_system::instance();
        require_capability('local/aurahr_scheduler:manage', $context);
        
        $application = $DB->get_record('local_aurahr_applications', ['id' => $params['applicationid']], '*', MUST_EXIST);
        
        $record = new \stdClass();
        $record->applicationid = $params['applicationid'];
        $record->jobid = $application->jobid;
        $record->candidateid = $application->userid;
        $record->interviewerid = $params['interviewerid'];
        $record->scheduled_at = $params['scheduled_at'];
        $record->duration_mins = $params['duration_mins'];
        $record->jitsi_room = 'aurahr_override_' . time();
        $record->status = 'scheduled';
        $record->timecreated = time();
        $record->timemodified = time();

        // Check if an interview already exists for this application. If so, update it instead.
        $existing = $DB->get_record('local_aurahr_interviews', ['applicationid' => $params['applicationid']]);
        if ($existing) {
            $record->id = $existing->id;
            $DB->update_record('local_aurahr_interviews', $record);
            $id = $existing->id;
        } else {
            $id = $DB->insert_record('local_aurahr_interviews', $record);
        }

        return ['success' => true, 'interviewid' => $id];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'success'     => new external_value(PARAM_BOOL, 'Success'),
            'interviewid' => new external_value(PARAM_INT, 'Interview ID'),
        ]);
    }
}
