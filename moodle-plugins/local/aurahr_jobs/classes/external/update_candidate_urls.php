<?php
namespace local_aurahr_jobs\external;

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;

defined('MOODLE_INTERNAL') || die();

class update_candidate_urls extends external_api {

    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'github_url'   => new external_value(PARAM_TEXT, 'Github URL',   VALUE_DEFAULT, ''),
            'linkedin_url' => new external_value(PARAM_TEXT, 'Linkedin URL', VALUE_DEFAULT, ''),
            'leetcode_url' => new external_value(PARAM_TEXT, 'Leetcode URL', VALUE_DEFAULT, ''),
        ]);
    }

    public static function execute(string $github_url, string $linkedin_url, string $leetcode_url): array {
        global $DB, $USER;

        $params = self::validate_parameters(self::execute_parameters(), [
            'github_url'   => $github_url,
            'linkedin_url' => $linkedin_url,
            'leetcode_url' => $leetcode_url,
        ]);

        $context = \context_user::instance($USER->id);
        self::validate_context($context);

        // Update all applications for this user.
        $DB->execute("
            UPDATE {local_aurahr_applications}
            SET github_url = ?, linkedin_url = ?, leetcode_url = ?, timemodified = ?
            WHERE userid = ?
        ", [
            $params['github_url'],
            $params['linkedin_url'],
            $params['leetcode_url'],
            time(),
            $USER->id,
        ]);

        return ['status' => 'success'];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'status' => new external_value(PARAM_TEXT, 'Success flag'),
        ]);
    }
}
