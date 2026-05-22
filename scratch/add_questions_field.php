<?php
define('CLI_SCRIPT', true);
require('C:/xampp/htdocs/moodle/config.php');

global $DB;

$dbman = $DB->get_manager();
$table = new xmldb_table('local_aurahr_assessments');
$field = new xmldb_field('questions', XMLDB_TYPE_TEXT, null, null, null, null, null, 'ai_topic');

try {
    if (!$dbman->field_exists($table, $field)) {
        $dbman->add_field($table, $field);
        echo "SUCCESS: Field 'questions' added to 'local_aurahr_assessments' table!\n";
    } else {
        echo "INFO: Field 'questions' already exists in 'local_aurahr_assessments' table.\n";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
