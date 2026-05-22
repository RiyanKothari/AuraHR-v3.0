<?php
namespace local_aurahr_interview\external;

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;
use local_aurahr_jdparser\ai_client;

/**
 * Run AI evaluation on interview transcript.
 */
class ai_evaluate extends external_api {

    const SYSTEM_PROMPT = <<<'PROMPT'
You are an expert HR interviewer AI. Evaluate the provided interview transcript.

Return a JSON object with:
{
  "score": 85,
  "summary": "Candidate showed strong knowledge of React but lacked deep understanding of system design.",
  "strengths": ["React hooks", "Communication"],
  "weaknesses": ["System design", "Database indexing"],
  "technical_rating": 8,
  "cultural_rating": 9
}
PROMPT;

    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'applicationid' => new external_value(PARAM_INT, 'Application ID'),
            'transcript'  => new external_value(PARAM_RAW, 'Interview transcript text'),
        ]);
    }

    public static function execute(int $applicationid, string $transcript): array {
        global $DB;

        $params = self::validate_parameters(self::execute_parameters(), [
            'applicationid' => $applicationid, 'transcript' => $transcript,
        ]);

        $context = \context_system::instance();
        require_capability('local/aurahr_interview:manage', $context);

        $application = $DB->get_record('local_aurahr_applications', ['id' => $params['applicationid']], '*', MUST_EXIST);
        $interview = $DB->get_record('local_aurahr_interviews', [
            'candidateid' => $application->userid,
            'jobid' => $application->jobid
        ], '*', MUST_EXIST);
        
        $client = new ai_client();
        $response = $client->chat(self::SYSTEM_PROMPT, "Transcript:\n\n" . $params['transcript'], 0.3);
        $data = $client->parse_json_response($response);
        
        $score = (float)($data['score'] ?? 0);

        // Update interview record.
        $interview->transcript = $params['transcript'];
        $interview->ai_score = $score;
        $interview->ai_evaluation = json_encode($data);
        $interview->timemodified = time();
        $DB->update_record('local_aurahr_interviews', $interview);

        return [
            'success'  => true,
            'ai_score' => $score,
            'ai_evaluation' => json_encode($data)
        ];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'success'  => new external_value(PARAM_BOOL, 'Success'),
            'ai_score' => new external_value(PARAM_FLOAT, 'AI Score'),
            'ai_evaluation' => new external_value(PARAM_RAW, 'AI Evaluation JSON')
        ]);
    }
}
