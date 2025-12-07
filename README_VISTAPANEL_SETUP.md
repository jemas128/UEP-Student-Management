
# UEP Student Management System - Production Setup Guide

## 1. 🚨 DATABASE SQL (Run in phpMyAdmin)

```sql
CREATE TABLE `users` (
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

CREATE TABLE `grades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_db_id` int(11) NOT NULL,
  `course_code` varchar(20) NOT NULL,
  `course_name` varchar(100) NOT NULL,
  `grade` varchar(5) NOT NULL,
  `score` int(11) NOT NULL,
  `semester` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','alert','success') DEFAULT 'info',
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `users` (`name`, `email`, `password`, `role`, `status`) VALUES
('System Administrator', 'admin@uep.edu', 'admin123', 'admin', 'active');
```

---

## 2. 🐘 PHP BACKEND FILES (Upload to `htdocs/api/`)

Create a folder named `api` in your `htdocs`. Create these 5 files inside it.

### 1. `db_connect.php`
```php
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$servername = "sql300.epizy.com"; // CHECK VISTAPANEL
$username = "epiz_XXXXXXX";       // CHECK VISTAPANEL
$password = "YOUR_PASSWORD";      // YOUR PASSWORD
$dbname = "epiz_XXXXXXX_uep_sms"; // YOUR DB NAME

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}
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
    $res = $conn->query("SELECT * FROM users WHERE email='$email'");
    if ($res->num_rows > 0) {
        $user = $res->fetch_assoc();
        if ($pass === $user['password']) { // Simple check (Use password_verify in real prod)
             if($user['status'] == 'pending') {
                 http_response_code(403);
                 echo json_encode(["error" => "Account pending approval"]);
             } else {
                 echo json_encode(["success" => true, "user" => $user]);
             }
        } else {
            http_response_code(401);
            echo json_encode(["error" => "Invalid password"]);
        }
    } else {
        http_response_code(404);
        echo json_encode(["error" => "User not found"]);
    }
} elseif ($action == 'register') {
    $name = $conn->real_escape_string($data->name);
    $email = $conn->real_escape_string($data->email);
    $pass = $data->password; // Hash in real prod
    
    $check = $conn->query("SELECT id FROM users WHERE email='$email'");
    if ($check->num_rows > 0) {
        http_response_code(409);
        echo json_encode(["error" => "Email already exists"]);
    } else {
        $sql = "INSERT INTO users (name, email, password, role, status) VALUES ('$name', '$email', '$pass', 'student', 'pending')";
        if ($conn->query($sql)) {
            echo json_encode(["success" => true]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => $conn->error]);
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
$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    $res = $conn->query("SELECT * FROM users WHERE role='student' ORDER BY created_at DESC");
    $users = [];
    while($row = $res->fetch_assoc()) {
        $users[] = $row;
    }
    echo json_encode($users);
} elseif ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $name = $conn->real_escape_string($data->name);
    $email = $conn->real_escape_string($data->email);
    $prog = $conn->real_escape_string($data->program);
    $pass = $data->password ?? '123456';
    
    $sql = "INSERT INTO users (name, email, password, role, status, program, year_level) 
            VALUES ('$name', '$email', '$pass', 'student', 'active', '$prog', $data->year_level)";
    if($conn->query($sql)) echo json_encode(["success"=>true]);
    else echo json_encode(["error"=>$conn->error]);
} elseif ($method == 'PUT') {
    $data = json_decode(file_get_contents("php://input"));
    $id = $data->id;
    $name = $conn->real_escape_string($data->name);
    $sid = $conn->real_escape_string($data->student_id);
    $prog = $conn->real_escape_string($data->program);
    
    $sql = "UPDATE users SET name='$name', student_id='$sid', program='$prog', year_level=$data->year_level WHERE id=$id";
    if($conn->query($sql)) echo json_encode(["success"=>true]);
} elseif ($method == 'PATCH') {
    $data = json_decode(file_get_contents("php://input"));
    $id = $data->id;
    $status = $data->status;
    $conn->query("UPDATE users SET status='$status' WHERE id=$id");
    echo json_encode(["success"=>true]);
} elseif ($method == 'DELETE') {
    $id = $_GET['id'];
    $conn->query("DELETE FROM users WHERE id=$id");
    echo json_encode(["success"=>true]);
}
$conn->close();
?>
```

### 4. `grades.php`
```php
<?php
require 'db_connect.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    $sid = $_GET['student_id'];
    $res = $conn->query("SELECT * FROM grades WHERE student_db_id=$sid");
    $grades = [];
    while($row = $res->fetch_assoc()) $grades[] = $row;
    echo json_encode($grades);
} elseif ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $sid = $data->student_id;
    $cc = $data->course_code;
    $cn = $data->course_name;
    $gr = $data->grade;
    $sc = $data->score;
    $sem = $data->semester;
    
    $sql = "INSERT INTO grades (student_db_id, course_code, course_name, grade, score, semester) VALUES ($sid, '$cc', '$cn', '$gr', $sc, '$sem')";
    if($conn->query($sql)) {
        // Recalculate GPA
        $avg = $conn->query("SELECT AVG(NULLIF(grade,0)) as gpa FROM grades WHERE student_db_id=$sid AND grade REGEXP '^[0-9]'")->fetch_assoc()['gpa'];
        $conn->query("UPDATE users SET gpa=$avg WHERE id=$sid");
        echo json_encode(["success"=>true]);
    }
} elseif ($method == 'PUT') {
    $data = json_decode(file_get_contents("php://input"));
    $id = $data->id;
    $cc = $data->course_code;
    $cn = $data->course_name;
    $gr = $data->grade;
    $sc = $data->score;
    $sem = $data->semester;
    $conn->query("UPDATE grades SET course_code='$cc', course_name='$cn', grade='$gr', score=$sc, semester='$sem' WHERE id=$id");
    echo json_encode(["success"=>true]);
} elseif ($method == 'DELETE') {
    $id = $_GET['id'];
    $conn->query("DELETE FROM grades WHERE id=$id");
    echo json_encode(["success"=>true]);
}
$conn->close();
?>
```

### 5. `notifications.php`
```php
<?php
require 'db_connect.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    $res = $conn->query("SELECT * FROM notifications ORDER BY created_at DESC");
    $data = [];
    while($row = $res->fetch_assoc()) $data[] = $row;
    echo json_encode($data);
} elseif ($method == 'POST') {
    $d = json_decode(file_get_contents("php://input"));
    $t = $conn->real_escape_string($d->title);
    $m = $conn->real_escape_string($d->message);
    $conn->query("INSERT INTO notifications (title, message, type) VALUES ('$t', '$m', '$d->type')");
    echo json_encode(["success"=>true]);
} elseif ($method == 'DELETE') {
    $id = $_GET['id'];
    $conn->query("DELETE FROM notifications WHERE id=$id");
    echo json_encode(["success"=>true]);
}
$conn->close();
?>
```
