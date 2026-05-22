<?php
define('CLI_SCRIPT', true);
require('C:/xampp/htdocs/moodle/config.php');

global $DB;
$cols = $DB->get_columns('local_aurahr_assessments');
foreach ($cols as $name => $col) {
    echo "$name: " . $col->type . "\n";
}
