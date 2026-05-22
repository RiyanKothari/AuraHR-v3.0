<?php
define('CLI_SCRIPT', true);
require('C:/xampp/htdocs/moodle/config.php');

// Set admin user to bypass capability checks
$admin = $DB->get_record('user', ['username' => 'admin']);
\core\session\manager::set_user($admin);

// Job ID 2 is likely the one the user is looking at based on /org/applications/2
try {
    $result = \local_aurahr_jdparser\external\match_candidates::execute(2);
    echo "Success!\n";
    print_r($result);
} catch (Exception $e) {
    echo "Error:\n" . $e->getMessage() . "\n";
}
