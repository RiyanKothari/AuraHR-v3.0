<?php
namespace local_aurahr_scheduler\external;

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_multiple_structure;
use core_external\external_value;

class get_pending_requests extends external_api {
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([]);
    }

    public static function execute(): array {
        global $DB;
        self::validate_parameters(self::execute_parameters(), []);
        
        $context = \context_system::instance();
        require_capability('local/aurahr_scheduler:manage', $context);
        
        $sql = "SELECT r.*, i.candidateid, i.jobid, i.scheduled_at as curr_time, 
                       u.firstname, u.lastname
                FROM {local_aurahr_reschedule} r
                JOIN {local_aurahr_interviews} i ON r.interviewid = i.id
                JOIN {user} u ON i.candidateid = u.id
                WHERE r.status = 'pending'";
                
        $records = $DB->get_records_sql($sql);
        
        $requests = [];
        foreach ($records as $r) {
            $requests[] = [
                'id' => (int)$r->id,
                'interviewid' => (int)$r->interviewid,
                'candidate_name' => trim($r->firstname . ' ' . $r->lastname),
                'jobid' => (int)$r->jobid,
                'reason' => $r->reason ?? '',
                'new_time' => (int)$r->new_time,
                'current_time' => (int)$r->curr_time,
                'status' => $r->status,
                'timecreated' => (int)$r->timecreated,
            ];
        }

        return ['requests' => $requests];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'requests' => new external_multiple_structure(
                new external_single_structure([
                    'id'             => new external_value(PARAM_INT, 'Request ID'),
                    'interviewid'    => new external_value(PARAM_INT, 'Interview ID'),
                    'candidate_name' => new external_value(PARAM_TEXT, 'Candidate Name'),
                    'jobid'          => new external_value(PARAM_INT, 'Job ID'),
                    'reason'         => new external_value(PARAM_TEXT, 'Reason'),
                    'new_time'       => new external_value(PARAM_INT, 'Proposed new time'),
                    'current_time'   => new external_value(PARAM_INT, 'Current time'),
                    'status'         => new external_value(PARAM_TEXT, 'Status'),
                    'timecreated'    => new external_value(PARAM_INT, 'Time created'),
                ])
            ),
        ]);
    }
}
