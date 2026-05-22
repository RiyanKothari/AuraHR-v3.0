<?php
define('CLI_SCRIPT', true);
require('C:/xampp/htdocs/moodle/config.php');

$admin = $DB->get_record('user', ['username' => 'admin']);
\core\session\manager::set_user($admin);

try {
    echo "Running parse_jd...\n";
    $result = \local_aurahr_jdparser\external\parse_jd::execute(2, 0);
    print_r($result);
} catch (Exception $e) {
    echo "Error parsing JD:\n" . $e->getMessage() . "\n";
}
