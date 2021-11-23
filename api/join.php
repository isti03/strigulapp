<?php

require 'config.php';

header('Content-Type: application/json');

if(!isset($_COOKIE["session"]) || !isset($_POST["webrtc"])) {
    http_response_code(401); // Unauthorized
    exit();
}

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$db = new mysqli(
    $config['db']['host'], 
    $config['db']['user'], 
    $config['db']['pass'], 
    'strigulapp'
);

if (!$db) { die("Connection failed: " . $db->connect_error); }

$results = array();

$results['peers'] = $db->query(
    "SELECT webrtc 
    FROM sessions 
    WHERE active > NOW() - INTERVAL 1 HOUR;
")->fetch_all();

$results['counters'] = $db->query(
    "SELECT names.id, names.name, COUNT(counters.time) as counter
    FROM 
        (SELECT `nameid`, `time` FROM counters WHERE DAY(`time`) = DAY(NOW())) AS counters
        RIGHT JOIN (SELECT `id`, `name` FROM names) AS names
        ON counters.nameid = names.id
    GROUP BY names.id
    ;
")->fetch_all(MYSQLI_ASSOC);

echo json_encode($results);

$stmt = $db->prepare("
    INSERT INTO sessions(sessionid, webrtc) VALUES(?,?)
    ON DUPLICATE KEY UPDATE webrtc=?, active=NOW()
");
$stmt->bind_param("sss", $_COOKIE['session'], $_POST['webrtc'], $_POST['webrtc']);
$stmt->execute();

$db->close();

?>