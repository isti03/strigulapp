<?php

require 'config.php';

if(!isset($_COOKIE["session"])) {
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

if (isset($_POST["id"])) {
    $stmt = $db->prepare("
        INSERT INTO counters(nameid, noterid) VALUES (
            ?, (SELECT id FROM sessions WHERE sessionid = ?)
        );
    ");
    $stmt->bind_param("is", $_POST['id'], $_COOKIE['session']);
    $stmt->execute();
}
else if (isset($_POST['name'])) {
    $stmt = $db->prepare('INSERT INTO names(name) VALUES (?);');
    $stmt->bind_param('s', $_POST['name']);
    $stmt->execute();

    echo $db->query("SELECT LAST_INSERT_ID();")->fetch_all()[0][0];
}
else {
    http_response_code(400); // Bad request
}

$db->close();

?>