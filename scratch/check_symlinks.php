<?php
$moodle_file = 'C:/xampp/htdocs/moodle/local/aurahr_academia/classes/external/generate_questions.php';
if (file_exists($moodle_file)) {
    $content = file_get_contents($moodle_file);
    echo "Is symlink/junction: " . (is_link($moodle_file) || is_link(dirname($moodle_file)) ? 'YES' : 'NO') . "\n";
    if (strpos($content, '$assessment->questions = json_encode') !== false) {
        echo "Modification IS present in htdocs!\n";
    } else {
        echo "Modification IS NOT present in htdocs!\n";
    }
} else {
    echo "Moodle file does not exist!\n";
}
