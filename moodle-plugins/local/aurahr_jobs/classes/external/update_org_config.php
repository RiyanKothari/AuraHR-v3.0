<?php
namespace local_aurahr_jobs\external;

defined('MOODLE_INTERNAL') || die();

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;

class update_org_config extends external_api {

    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'data' => new external_value(PARAM_RAW, 'JSON string of config')
        ]);
    }

    public static function execute(string $data): array {
        $context = \context_system::instance();
        self::validate_context($context);
        require_capability('local/aurahr_jobs:managejobs', $context);
        
        $params = self::validate_parameters(self::execute_parameters(), ['data' => $data]);

        set_config('org_settings', $params['data'], 'local_aurahr_jobs');

        return [
            'status' => 'success'
        ];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'status' => new external_value(PARAM_TEXT, 'Status')
        ]);
    }
}
