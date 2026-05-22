<?php
// Admin settings for the JD Parser plugin.
defined('MOODLE_INTERNAL') || die();

if ($hassiteconfig) {
    $settings = new admin_settingpage('local_aurahr_jdparser', get_string('pluginname', 'local_aurahr_jdparser'));

    // AI API URL.
    $settings->add(new admin_setting_configtext(
        'local_aurahr_jdparser/apiurl',
        get_string('settings_apiurl', 'local_aurahr_jdparser'),
        get_string('settings_apiurl_desc', 'local_aurahr_jdparser'),
        'https://inference.ai.neevcloud.com/v1',
        PARAM_URL
    ));

    // AI API Key (password field — hidden in UI).
    $settings->add(new admin_setting_configpasswordunmask(
        'local_aurahr_jdparser/apikey',
        get_string('settings_apikey', 'local_aurahr_jdparser'),
        get_string('settings_apikey_desc', 'local_aurahr_jdparser'),
        'sk-nc-kpI9ZaZf2wcHRckskFTCdisRSfO3gq4eMiMgrRk2qVc'
    ));

    // AI Model name.
    $settings->add(new admin_setting_configtext(
        'local_aurahr_jdparser/model',
        get_string('settings_model', 'local_aurahr_jdparser'),
        get_string('settings_model_desc', 'local_aurahr_jdparser'),
        'gpt-oss-20b',
        PARAM_TEXT
    ));

    $ADMIN->add('localplugins', $settings);
}
