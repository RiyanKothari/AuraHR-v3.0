<?php
define('CLI_SCRIPT', true);
require('C:/xampp/htdocs/moodle/config.php');

global $DB;

$record = $DB->get_record('local_aurahr_assessments', ['id' => 5]);
echo "Before write, questions value: '" . ($record->questions) . "'\n";
$record->questions = json_encode([['text' => 'Test manual question text']]);
try {
    $DB->update_record('local_aurahr_assessments', $record);
    echo "Update record called successfully.\n";
    
    $record_check = $DB->get_record('local_aurahr_assessments', ['id' => 5]);
    echo "After write, questions value: '" . ($record_check->questions) . "'\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
