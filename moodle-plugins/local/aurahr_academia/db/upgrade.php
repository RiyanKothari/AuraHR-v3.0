<?php
defined('MOODLE_INTERNAL') || die();

function xmldb_local_aurahr_academia_upgrade($oldversion) {
    global $DB;
    $dbman = $DB->get_manager();

    if ($oldversion < 2026052201) {
        $table = new xmldb_table('local_aurahr_assessments');
        $field = new xmldb_field('questions', XMLDB_TYPE_TEXT, null, null, null, null, null, 'ai_topic');

        if (!$dbman->field_exists($table, $field)) {
            $dbman->add_field($table, $field);
        }

        upgrade_plugin_savepoint(true, 2026052201, 'local', 'aurahr_academia');
    }

    return true;
}
