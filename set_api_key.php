<?php
define('CLI_SCRIPT', true);
require('C:/xampp/htdocs/moodle/config.php');

// Set JD Parser configuration to the new NeevCloud endpoint & key
set_config('apikey', 'sk-nc-kpI9ZaZf2wcHRckskFTCdisRSfO3gq4eMiMgrRk2qVc', 'local_aurahr_jdparser');
set_config('apiurl', 'https://inference.ai.neevcloud.com/v1', 'local_aurahr_jdparser');
set_config('model', 'gpt-oss-20b', 'local_aurahr_jdparser');

echo "API Key and Config Updated for local_aurahr_jdparser!\n";
