<?php
define('CLI_SCRIPT', true);
require('C:/xampp/htdocs/moodle/config.php');

global $DB;
$cols = $DB->get_columns('local_aurahr_applications');
print_r($cols);
