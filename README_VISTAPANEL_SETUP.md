# UEP Student Management System - VistaPanel Setup Guide

## 1. 🚨 DATABASE SQL (COPY THIS FIRST) 🚨

Run this SQL in your **phpMyAdmin** on VistaPanel. 

```sql
-- Create Users Table with Status
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
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `student_id` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Grades Table
CREATE TABLE `grades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_db_id` int(11) NOT NULL,
  `course_code` varchar(20) NOT NULL,
  `course_name` varchar(100) NOT NULL,
  `grade` varchar(5) NOT NULL,
  `score` int(11) NOT NULL,
  `semester` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`student_db_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- DEFAULT ADMIN ACCOUNT
-- Email: admin@uep.edu
-- Password: admin123
INSERT INTO `users` (`name`, `email`, `password`, `role`, `status`) VALUES
('System Administrator', 'admin@uep.edu', 'admin123', 'admin', 'active');
```

---

## 2. 🏗️ HOW TO BUILD & UPLOAD (Frontend)

To get the files ready for VistaPanel:

1.  Open your terminal in the project folder.
2.  Run the command:
    ```bash
    npm run build
    ```
    *If this command fails, ensure you have run `npm install` first.*
3.  This will create a **`dist`** folder in your project.
4.  Open the `dist` folder. You should see:
    *   `assets/` (folder containing .js and .css files)
    *   `index.html`
    *   `vite.svg` (optional)

### Uploading to VistaPanel:
1.  Go to the **File Manager** (MonstaFTP) in VistaPanel.
2.  Open the **`htdocs`** folder.
3.  **Delete** the default `index2.html` or empty files if any.
4.  **Upload** everything **inside** your local `dist` folder into `htdocs`.
    *   Your `index.html` should be at `htdocs/index.html`.
    *   Your `assets` folder should be at `htdocs/assets/`.

---

## 3. 🐘 PHP BACKEND SETUP

Create a folder named `api` inside your `htdocs` folder (`htdocs/api`).
Create the following files inside that folder.

### `db_connect.php`
*Change the variables to match your VistaPanel MySQL details.*

```php
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE, PUT");
header("Access-Control-Allow-Headers: Content-Type");

$servername = "sql300.epizy.com"; // CHECK VISTAPANEL FOR YOUR HOST
$username = "epiz_XXXXXXX";       // CHECK VISTAPANEL FOR YOUR USERNAME
$password = "YOUR_PASSWORD";      // YOUR VISTAPANEL PASSWORD
$dbname = "epiz_XXXXXXX_uep_sms"; // YOUR DATABASE NAME

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}
?>
```

### `add_grade.php`

```php
<?php
require 'db_connect.php';
$data = json_decode(file_get_contents("php://input"));

if(isset($data->studentId) && isset($data->courseId)) {
    $studentId = $data->studentId; 
    $courseId = $data->courseId;
    $courseName = $data->courseName;
    $grade = $data->grade;
    $score = $data->score;
    $semester = $data->semester;

    $sql = "INSERT INTO grades (student_db_id, course_code, course_name, grade, score, semester) 
            VALUES ($studentId, '$courseId', '$courseName', '$grade', $score, '$semester')";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true, "message" => "Grade added successfully"]);
    } else {
        echo json_encode(["error" => "Error: " . $conn->error]);
    }
}
$conn->close();
?>
```

### `update_grade.php`

```php
<?php
require 'db_connect.php';
$data = json_decode(file_get_contents("php://input"));

if(isset($data->id)) {
    $id = $data->id;
    $courseId = $data->courseId;
    $courseName = $data->courseName;
    $grade = $data->grade;
    $score = $data->score;
    $semester = $data->semester;

    $sql = "UPDATE grades SET 
            course_code='$courseId', 
            course_name='$courseName', 
            grade='$grade', 
            score=$score, 
            semester='$semester' 
            WHERE id=$id";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true, "message" => "Grade updated successfully"]);
    } else {
        echo json_encode(["error" => "Error: " . $conn->error]);
    }
}
$conn->close();
?>
```

### `delete_grade.php`

```php
<?php
require 'db_connect.php';
$data = json_decode(file_get_contents("php://input"));

if(isset($data->id)) {
    $id = $data->id;
    $sql = "DELETE FROM grades WHERE id=$id";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true, "message" => "Grade deleted successfully"]);
    } else {
        echo json_encode(["error" => "Error: " . $conn->error]);
    }
}
$conn->close();
?>
```

### `login.php`

```php
<?php
require 'db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if(isset($data->email) && isset($data->password)) {
    $email = $data->email;
    $pass = $data->password;

    $sql = "SELECT * FROM users WHERE email = '$email'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        
        if($user['status'] !== 'active') {
             http_response_code(403);
             echo json_encode(["error" => "Your account is pending Administrator approval."]);
             exit();
        }

        if($pass === $user['password']) {
            $grades = [];
            $gSql = "SELECT * FROM grades WHERE student_db_id = " . $user['id'];
            $gResult = $conn->query($gSql);
            while($g = $gResult->fetch_assoc()) {
                $grades[] = [
                    "id" => (string)$g['id'],
                    "courseId" => $g['course_code'],
                    "courseName" => $g['course_name'],
                    "grade" => $g['grade'],
                    "score" => (int)$g['score'],
                    "semester" => $g['semester']
                ];
            }
            
            $responseUser = [
                "id" => (string)$user['id'],
                "name" => $user['name'],
                "email" => $user['email'],
                "role" => $user['role'],
                "status" => $user['status'],
                "avatar" => $user['avatar_url'] ? $user['avatar_url'] : "https://ui-avatars.com/api/?name=".$user['name']."&background=800000&color=fff",
                "studentId" => $user['student_id'],
                "program" => $user['program'],
                "yearLevel" => (int)$user['year_level'],
                "gpa" => (float)$user['gpa'],
                "grades" => $grades
            ];
            
            echo json_encode(["success" => true, "user" => $responseUser]);
        } else {
            http_response_code(401);
            echo json_encode(["error" => "Invalid password"]);
        }
    } else {
        http_response_code(404);
        echo json_encode(["error" => "User not found"]);
    }
} else {
    echo json_encode(["error" => "Missing credentials"]);
}
$conn->close();
?>
```

---

## 🚨 TROUBLESHOOTING WHITE SCREEN

If you still see a white screen after uploading:

1.  **Check Browser Console**: Right-click > Inspect > Console. If you see 404 errors for `.js` files, your paths are wrong.
    *   *Solution:* Ensure `vite.config.ts` has `base: './'`.
2.  **No Asset Folder?**: This means `npm run build` didn't find your files.
    *   *Solution:* Ensure `index.html` has `<script type="module" src="./index.tsx"></script>`.
3.  **Clear Cache**: Sometimes the browser remembers the broken version. Try Incognito mode.
