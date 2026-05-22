<?php
define('CLI_SCRIPT', true);
require('C:/xampp/htdocs/moodle/config.php');
require_once('C:/Users/shrey/Desktop/AuraHR/moodle-plugins/local/aurahr_jobs/classes/external/list_jobs.php');
require_once('C:/Users/shrey/Desktop/AuraHR/moodle-plugins/local/aurahr_jobs/classes/external/get_stats.php');

global $USER;
// Set admin as current user so capabilities check passes
$admin = get_admin();
\core\session\manager::set_user($admin);

try {
    echo "Testing list_jobs:\n";
    $res1 = \local_aurahr_jobs\external\list_jobs::execute('active');
    echo "Jobs: " . count($res1['jobs']) . "\n";
} catch (Exception $e) {
    echo "list_jobs Failed: " . $e->getMessage() . "\n";
}

try {
    echo "Testing get_stats:\n";
    $res2 = \local_aurahr_jobs\external\get_stats::execute(0);
    echo "Total apps: " . $res2['total_applications'] . "\n";
} catch (Exception $e) {
    echo "get_stats Failed: " . $e->getMessage() . "\n";
}
