<?php
defined('MOODLE_INTERNAL') || die();

$string['pluginname'] = 'AuraHR JD Parser';
$string['manage'] = 'Manage JD Parser';
$string['aurahr_jdparser:parse'] = 'Run JD analysis on job descriptions';
$string['aurahr_jdparser:match'] = 'Match candidates against JD requirements';
$string['apikeymissing'] = 'AI API key is not configured. Please set it in Site Administration > Plugins > Local > AuraHR JD Parser.';
$string['parsecomplete'] = 'JD analysis completed successfully';
$string['matchcomplete'] = 'Candidate matching completed successfully';
$string['settings_apikey'] = 'AI API Key';
$string['settings_apikey_desc'] = 'API key for the AI service (OpenAI-compatible). Used for JD parsing and candidate matching.';
$string['settings_apiurl'] = 'AI API URL';
$string['settings_apiurl_desc'] = 'Base URL of the AI API endpoint (e.g. https://api.openai.com/v1)';
$string['settings_model'] = 'AI Model';
$string['settings_model_desc'] = 'The model to use for analysis (e.g. gpt-4o-mini, gemini-2.0-flash)';
