
# UEP Student Management System - VistaPanel Setup Guide

**NOTE**: You must update your PHP files in `htdocs/api/` with the code below. We have switched to using `POST` for everything to fix "Database Not Updating" issues on shared hosting.

## 1. 🚨 DATABASE SQL (Run in phpMyAdmin)

**You likely already have this.** If you created the tables before, you **DO NOT** need to run this again unless you are missing the `grades` table.

```sql
-- Create Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` varchar(20) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','student') NOT NULL DEFAULT 'student',
  `status` enum('active','pending') NOT NULL DEFAULT 'pending',
  `program` varchar(100) DEFAULT NULL,
  `year_level` int(11) DEFAULT 1,
  `gpa` decimal(3,2) DEFAULT 0.00,
  `avatar_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Grades Table
CREATE TABLE IF NOT EXISTS `grades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_db_id` int(11) NOT NULL,
  `course_code` varchar(20) NOT NULL,
  `course_name` varchar(100) NOT NULL,
  `grade` varchar(5) NOT NULL,
  `score` int(11) NOT NULL,
  `semester` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Notifications Table
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','alert','success') DEFAULT 'info',
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Admin User (If not exists)
INSERT IGNORE INTO `users` (`name`, `email`, `password`, `role`, `status`) VALUES
('System Administrator', 'admin@uep.edu', 'admin123', 'admin', 'active');
```

---

## 2. 🐘 PHP BACKEND FILES (Upload to `htdocs/api/`)

**INSTRUCTIONS:** 
1. Open VistaPanel File Manager.
2. Go to `htdocs`.
3. Create a folder named `api` (if not exists).
4. Update these files with the code below.

### 1. `db_connect.php`
*I have pre-filled this with your ByetHost settings based on your website link.*
```php
<?php
// Display errors for debugging connection issues
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// !!! YOUR SPECIFIC DATABASE SETTINGS !!!
$servername = "sql309.byethost17.com"; // Usually sql309 for byethost17, check VistaPanel if this fails
$username = "b17_40616482";            // Based on your DB name prefix
$password = "YOUR_VISTAPANEL_PASSWORD"; // <--- ENTER YOUR PASSWORD HERE
$dbname = "b17_40616482_uep_db";       // Your specific database

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    // If sql309 fails, try "localhost"
    $conn = new mysqli("localhost", $username, $password, $dbname);
    if ($conn->connect_error) {
        die(json_encode(["error" => "Database Connection Failed: " . $conn->connect_error]));
    }
}

$conn->set_charset("utf8mb4");
?>
```

### 2. `auth.php`
```php
<?php
require 'db_connect.php';

$data = json_decode(file_get_contents("php://input"));
$action = $data->action ?? '';

if ($action == 'login') {
    $email = $conn->real_escape_string($data->email);
    $pass = $data->password;
    
    $result = $conn->query("SELECT * FROM users WHERE email='$email'");
    
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        // NOTE: For security in production, use password_verify()
        if ($pass === $user['password']) {
             if($user['status'] == 'pending') {
                 echo json_encode(["error" => "Account pending approval"]);
             } else {
                 echo json_encode(["success" => true, "user" => $user]);
             }
        } else {
            echo json_encode(["error" => "Invalid password"]);
        }
    } else {
        echo json_encode(["error" => "User not found"]);
    }
} 
elseif ($action == 'register') {
    $name = $conn->real_escape_string($data->name);
    $email = $conn->real_escape_string($data->email);
    $pass = $data->password;
    
    $check = $conn->query("SELECT id FROM users WHERE email='$email'");
    if ($check->num_rows > 0) {
        echo json_encode(["error" => "Email already exists"]);
    } else {
        $sql = "INSERT INTO users (name, email, password, role, status) VALUES ('$name', '$email', '$pass', 'student', 'pending')";
        if ($conn->query($sql)) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["error" => "DB Error: " . $conn->error]);
        }
    }
}
$conn->close();
?>
```

### 3. `students.php`
```php
<?php
require 'db_connect.php';

// Handle GET requests for fetching lists
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $result = $conn->query("SELECT * FROM users WHERE role='student' ORDER BY created_at DESC");
    $users = [];
    while($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
    echo json_encode($users);
    exit();
}

// Handle POST requests for Add/Update/Delete
$data = json_decode(file_get_contents("php://input"));
$action = $data->action ?? '';

if ($action == 'add_student') {
    $name = $conn->real_escape_string($data->name);
    $email = $conn->real_escape_string($data->email);
    $sid = $conn->real_escape_string($data->student_id);
    $prog = $conn->real_escape_string($data->program);
    $pass = $data->password;
    $yl = (int)$data->year_level;

    $sql = "INSERT INTO users (name, email, password, role, status, student_id, program, year_level) 
            VALUES ('$name', '$email', '$pass', 'student', 'active', '$sid', '$prog', $yl)";
            
    if($conn->query($sql)) echo json_encode(["success" => true]);
    else echo json_encode(["error" => $conn->error]);

} 
elseif ($action == 'update_student') {
    $id = (int)$data->id;
    $name = $conn->real_escape_string($data->name);
    $sid = $conn->real_escape_string($data->student_id);
    $prog = $conn->real_escape_string($data->program);
    $yl = (int)$data->year_level;

    $sql = "UPDATE users SET name='$name', student_id='$sid', program='$prog', year_level=$yl WHERE id=$id";
    
    if($conn->query($sql)) echo json_encode(["success" => true]);
    else echo json_encode(["error" => $conn->error]);

} 
elseif ($action == 'update_status') {
    $id = (int)$data->id;
    $status = $conn->real_escape_string($data->status);
    $conn->query("UPDATE users SET status='$status' WHERE id=$id");
    echo json_encode(["success" => true]);

} 
elseif ($action == 'delete_student') {
    $id = (int)$data->id;
    $conn->query("DELETE FROM users WHERE id=$id");
    $conn->query("DELETE FROM grades WHERE student_db_id=$id"); // Clean up grades
    echo json_encode(["success" => true]);
}

$conn->close();
?>
```

### 4. `grades.php`
```php
<?php
require 'db_connect.php';

// GET Grades
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['student_id'])) {
    $sid = (int)$_GET['student_id'];
    $result = $conn->query("SELECT * FROM grades WHERE student_db_id=$sid");
    $grades = [];
    while($row = $result->fetch_assoc()) $grades[] = $row;
    echo json_encode($grades);
    exit();
}

$data = json_decode(file_get_contents("php://input"));
$action = $data->action ?? '';

if ($action == 'add_grade') {
    $sid = (int)$data->student_id;
    $cc = $conn->real_escape_string($data->course_code);
    $cn = $conn->real_escape_string($data->course_name);
    $gr = $conn->real_escape_string($data->grade);
    $sc = (int)$data->score;
    $sem = $conn->real_escape_string($data->semester);

    $sql = "INSERT INTO grades (student_db_id, course_code, course_name, grade, score, semester) 
            VALUES ($sid, '$cc', '$cn', '$gr', $sc, '$sem')";
            
    if($conn->query($sql)) {
        // Recalculate GPA logic (Only average numeric grades 1.0 - 5.0)
        $avgRes = $conn->query("SELECT AVG(NULLIF(grade,0)) as gpa FROM grades WHERE student_db_id=$sid AND grade REGEXP '^[0-9]'");
        if($avgRes) {
            $avg = $avgRes->fetch_assoc()['gpa'];
            if($avg) $conn->query("UPDATE users SET gpa=$avg WHERE id=$sid");
        }
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["error" => $conn->error]);
    }

} 
elseif ($action == 'update_grade') {
    $id = (int)$data->id;
    $cc = $conn->real_escape_string($data->course_code);
    $cn = $conn->real_escape_string($data->course_name);
    $gr = $conn->real_escape_string($data->grade);
    $sc = (int)$data->score;
    $sem = $conn->real_escape_string($data->semester);

    $sql = "UPDATE grades SET course_code='$cc', course_name='$cn', grade='$gr', score=$sc, semester='$sem' WHERE id=$id";
    if($conn->query($sql)) {
        // Trigger GPA update even on edit
        $res = $conn->query("SELECT student_db_id FROM grades WHERE id=$id");
        if($res) {
             $sid = $res->fetch_assoc()['student_db_id'];
             $avgRes = $conn->query("SELECT AVG(NULLIF(grade,0)) as gpa FROM grades WHERE student_db_id=$sid AND grade REGEXP '^[0-9]'");
             if($avgRes) {
                 $avg = $avgRes->fetch_assoc()['gpa'];
                 if($avg) $conn->query("UPDATE users SET gpa=$avg WHERE id=$sid");
             }
        }
        echo json_encode(["success" => true]);
    }
    else echo json_encode(["error" => $conn->error]);

} 
elseif ($action == 'delete_grade') {
    $id = (int)$data->id;
    if($conn->query("DELETE FROM grades WHERE id=$id")) echo json_encode(["success" => true]);
    else echo json_encode(["error" => $conn->error]);
}

$conn->close();
?>
```

### 5. `notifications.php`
```php
<?php
require 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $result = $conn->query("SELECT * FROM notifications ORDER BY created_at DESC");
    $data = [];
    while($row = $result->fetch_assoc()) $data[] = $row;
    echo json_encode($data);
    exit();
}

$data = json_decode(file_get_contents("php://input"));
$action = $data->action ?? '';

if ($action == 'add_notif') {
    $t = $conn->real_escape_string($data->title);
    $m = $conn->real_escape_string($data->message);
    $type = $conn->real_escape_string($data->type);
    
    if($conn->query("INSERT INTO notifications (title, message, type) VALUES ('$t', '$m', '$type')"))
        echo json_encode(["success" => true]);
    else 
        echo json_encode(["error" => $conn->error]);
} 
elseif ($action == 'delete_notif') {
    $id = (int)$data->id;
    $conn->query("DELETE FROM notifications WHERE id=$id");
    echo json_encode(["success" => true]);
}

$conn->close();
?>
```

### 6. `test_db.php`
Use this file to check if your database password is correct.
```php
<?php
require 'db_connect.php';
echo json_encode(["message" => "Connected successfully to Database!"]);
?>
```
