<?php
define('CLI_SCRIPT', true);
require('C:/xampp/htdocs/moodle/config.php');

set_config('apiurl', 'https://inference.ai.neevcloud.com/v1', 'local_aurahr_jdparser');
set_config('apikey', 'sk-nc-kpI9ZaZf2wcHRckskFTCdisRSfO3gq4eMiMgrRk2qVc', 'local_aurahr_jdparser');
set_config('model', 'gpt-oss-20b', 'local_aurahr_jdparser');

echo "Updated local_aurahr_jdparser config in database.\n";
