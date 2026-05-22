<?php
namespace local_aurahr_jdparser;

/**
 * AI API Client — makes HTTP requests to OpenAI-compatible endpoints.
 *
 * Reads config from Moodle admin settings:
 *   - local_aurahr_jdparser/apiurl
 *   - local_aurahr_jdparser/apikey
 *   - local_aurahr_jdparser/model
 */
class ai_client {

    /** @var string API base URL */
    private string $apiurl;

    /** @var string API key for authentication */
    private string $apikey;

    /** @var string Model identifier */
    private string $model;

    public function __construct() {
        $this->apiurl = get_config('local_aurahr_jdparser', 'apiurl') ?: 'https://inference.ai.neevcloud.com/v1';
        $this->apikey = get_config('local_aurahr_jdparser', 'apikey') ?: 'sk-nc-kpI9ZaZf2wcHRckskFTCdisRSfO3gq4eMiMgrRk2qVc';
        $this->model  = get_config('local_aurahr_jdparser', 'model') ?: 'gpt-oss-20b';

        if (empty($this->apikey)) {
            throw new \moodle_exception('apikeymissing', 'local_aurahr_jdparser');
        }
    }

    /**
     * Send a chat completion request to the AI API.
     *
     * @param string $systemprompt  System instructions for the AI
     * @param string $userprompt    User's input/question
     * @param float  $temperature   Randomness (0.0 = deterministic, 1.0 = creative)
     * @return string              The AI's response text
     * @throws \moodle_exception   On API failure
     */
    public function chat(string $systemprompt, string $userprompt, float $temperature = 0.3): string {
        $url = rtrim($this->apiurl, '/') . '/chat/completions';

        $payload = json_encode([
            'model'       => $this->model,
            'temperature' => $temperature,
            'messages'    => [
                ['role' => 'system', 'content' => $systemprompt],
                ['role' => 'user',   'content' => $userprompt],
            ],
        ]);

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $this->apikey,
            ],
            CURLOPT_TIMEOUT        => 120,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);

        $response = curl_exec($ch);
        $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error    = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new \moodle_exception('aicall_failed', 'local_aurahr_jdparser', '', null,
                "cURL error: $error");
        }

        if ($httpcode !== 200) {
            $body = json_decode($response, true);
            $msg = $body['error']['message'] ?? "HTTP $httpcode";
            throw new \moodle_exception('aicall_failed', 'local_aurahr_jdparser', '', null,
                "AI API error: $msg");
        }

        $data = json_decode($response, true);
        return $data['choices'][0]['message']['content'] ?? '';
    }

    /**
     * Parse an AI JSON response with error handling.
     *
     * @param string $response Raw AI response text
     * @return array           Decoded JSON as associative array
     */
    public function parse_json_response(string $response): array {
        // Strip markdown code fences if present.
        $response = preg_replace('/^```(?:json)?\s*/m', '', $response);
        $response = preg_replace('/```\s*$/m', '', $response);
        $response = trim($response);

        $data = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \moodle_exception('aicall_failed', 'local_aurahr_jdparser', '', null,
                'Failed to parse AI response as JSON: ' . json_last_error_msg());
        }

        return $data;
    }
}
