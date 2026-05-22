<?php
namespace local_aurahr_jobs\external;

defined('MOODLE_INTERNAL') || die();

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;

class change_password extends external_api {

    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'currentpassword' => new external_value(PARAM_RAW, 'Current password'),
            'newpassword' => new external_value(PARAM_RAW, 'New password')
        ]);
    }

    public static function execute(string $currentpassword, string $newpassword): array {
        global $USER, $DB;
        $context = \context_user::instance($USER->id);
        self::validate_context($context);
        
        $params = self::validate_parameters(self::execute_parameters(), [
            'currentpassword' => $currentpassword,
            'newpassword' => $newpassword
        ]);

        $user = $DB->get_record('user', ['id' => $USER->id], '*', MUST_EXIST);

        // Verify current password
        require_once(__DIR__ . '/../../../../lib/moodlelib.php');
        if (!validate_internal_user_password($user, $params['currentpassword'])) {
            throw new \moodle_exception('errorpasswordmismatch', 'core');
        }

        // Update password
        $user->password = hash_internal_user_password($params['newpassword']);
        $DB->update_record('user', $user);

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
