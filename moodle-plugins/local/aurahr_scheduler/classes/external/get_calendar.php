<?php
namespace local_aurahr_scheduler\external;

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_multiple_structure;
use core_external\external_value;

/**
 * Get calendar view with scheduled interviews.
 */
class get_calendar extends external_api {

    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'start_time' => new external_value(PARAM_INT, 'Start timestamp'),
            'end_time'   => new external_value(PARAM_INT, 'End timestamp'),
        ]);
    }

    public static function execute(int $start_time, int $end_time): array {
        global $DB, $USER;

        $params = self::validate_parameters(self::execute_parameters(), [
            'start_time' => $start_time, 'end_time' => $end_time,
        ]);

        $context = \context_system::instance();
        require_capability('local/aurahr_scheduler:viewcalendar', $context);

        $sql = "SELECT * FROM {local_aurahr_interviews}
                WHERE scheduled_at >= :start AND scheduled_at <= :end
                AND (interviewerid = :uid1 OR candidateid = :uid2)
                ORDER BY scheduled_at ASC";
        
        $records = $DB->get_records_sql($sql, [
            'start' => $params['start_time'], 'end' => $params['end_time'],
            'uid1' => $USER->id, 'uid2' => $USER->id,
        ]);

        $events = [];
        foreach ($records as $r) {
            $events[] = [
                'id'            => (int)$r->id,
                'title'         => 'Interview',
                'scheduled_at'  => (int)$r->scheduled_at,
                'duration_mins' => (int)$r->duration_mins,
                'status'        => $r->status,
            ];
        }

        return ['events' => $events];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'events' => new external_multiple_structure(
                new external_single_structure([
                    'id'            => new external_value(PARAM_INT, 'Interview ID'),
                    'title'         => new external_value(PARAM_TEXT, 'Title'),
                    'scheduled_at'  => new external_value(PARAM_INT, 'Scheduled timestamp'),
                    'duration_mins' => new external_value(PARAM_INT, 'Duration'),
                    'status'        => new external_value(PARAM_TEXT, 'Status'),
                ])
            ),
        ]);
    }
}
