<?php
define('CLI_SCRIPT', true);
require('C:/xampp/htdocs/moodle/config.php');

global $DB;

// Set admin user to bypass capability checks
$admin = $DB->get_record('user', ['username' => 'admin']);
\core\session\manager::set_user($admin);

echo "\nRunning match_candidates for Job ID 1...\n";
try {
    $result = \local_aurahr_jdparser\external\match_candidates::execute(1);
    print_r($result);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\nRunning match_candidates for Job ID 2...\n";
try {
    $result = \local_aurahr_jdparser\external\match_candidates::execute(2);
    print_r($result);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
