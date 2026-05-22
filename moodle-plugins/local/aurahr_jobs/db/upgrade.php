<?php
// This file is part of AuraHR - https://aurahr.com
//
// AuraHR is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * AuraHR Jobs plugin upgrade script.
 */

defined('MOODLE_INTERNAL') || die();

function xmldb_local_aurahr_jobs_upgrade($oldversion) {
    global $DB;
    $dbman = $DB->get_manager();

    if ($oldversion < 2026052201) {
        // Define table local_aurahr_applications to be updated.
        $table = new xmldb_table('local_aurahr_applications');

        // Define the fields to add.
        $fields = [
            new xmldb_field('age', XMLDB_TYPE_INTEGER, '3', null, null, null, null, 'ai_summary'),
            new xmldb_field('gender', XMLDB_TYPE_CHAR, '20', null, null, null, null, 'age'),
            new xmldb_field('role', XMLDB_TYPE_CHAR, '255', null, null, null, null, 'gender'),
            new xmldb_field('education_details', XMLDB_TYPE_TEXT, null, null, null, null, null, 'role'),
            new xmldb_field('resume_skills', XMLDB_TYPE_TEXT, null, null, null, null, null, 'education_details'),
            new xmldb_field('github_score', XMLDB_TYPE_NUMBER, '10, 2', null, null, null, null, 'resume_skills'),
            new xmldb_field('leetcode_score', XMLDB_TYPE_NUMBER, '10, 2', null, null, null, null, 'github_score'),
            new xmldb_field('linkedin_score', XMLDB_TYPE_NUMBER, '10, 2', null, null, null, null, 'leetcode_score'),
            new xmldb_field('matched_skills', XMLDB_TYPE_TEXT, null, null, null, null, null, 'linkedin_score'),
        ];

        foreach ($fields as $field) {
            if (!$dbman->field_exists($table, $field)) {
                $dbman->add_field($table, $field);
            }
        }

        // Savepoint reached.
        upgrade_plugin_savepoint(true, 2026052201, 'local', 'aurahr_jobs');
    }

    return true;
}
