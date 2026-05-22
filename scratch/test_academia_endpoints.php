<?php
define('CLI_SCRIPT', true);
require('C:/xampp/htdocs/moodle/config.php');
require_once($CFG->dirroot . '/local/aurahr_academia/classes/external/get_assessment.php');
require_once($CFG->dirroot . '/local/aurahr_academia/classes/external/generate_questions.php');

global $DB;

// Set admin as current user so capabilities check passes
$admin = get_admin();
\core\session\manager::set_user($admin);

try {
    // 1. Find a job
    $job = $DB->get_record('local_aurahr_jobs', [], '*', IGNORE_MULTIPLE);
    if (!$job) {
        die("No jobs found in the database. Run populate_mock.php first.\n");
    }
    echo "Using job ID: {$job->id} ({$job->title})\n";

    // 2. Find or create an assessment for this job
    $assessment = $DB->get_record('local_aurahr_assessments', ['jobid' => $job->id]);
    if (!$assessment) {
        echo "Creating assessment for job...\n";
        $record = (object)[
            'jobid' => $job->id,
            'title' => "Technical Test - Job {$job->id}",
            'num_questions' => 3, // keep it small for quick test
            'duration_mins' => 60,
            'pass_percentage' => 60.0,
            'ai_topic' => "React, Next.js, Javascript",
            'status' => 'draft',
            'timecreated' => time(),
            'timemodified' => time(),
        ];
        $record->id = $DB->insert_record('local_aurahr_assessments', $record);
        $assessment = $record;
    } else {
        echo "Using existing assessment ID: {$assessment->id}\n";
        // Let's set it to 3 questions for testing speed
        $assessment->num_questions = 3;
        $assessment->ai_topic = "React, Next.js, Javascript";
        $DB->update_record('local_aurahr_assessments', $assessment);
    }

    // 3. Generate questions
    echo "Calling generate_questions external function...\n";
    $gen_res = \local_aurahr_academia\external\generate_questions::execute($assessment->id);
    echo "Generation Result:\n";
    print_r($gen_res);

    // 4. Retrieve assessment details
    echo "\nCalling get_assessment external function...\n";
    $get_res = \local_aurahr_academia\external\get_assessment::execute(0, $job->id);
    echo "Get Assessment Result Questions Count: " . count($get_res['questions'] ?? []) . "\n";
    if (!empty($get_res['questions'])) {
        foreach ($get_res['questions'] as $i => $q) {
            echo ($i + 1) . ". " . $q['text'] . " (Difficulty: " . $q['difficulty'] . ")\n";
        }
    } else {
        echo "WARNING: No questions returned!\n";
    }

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n";
}
