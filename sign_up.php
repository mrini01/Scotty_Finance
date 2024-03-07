<?php

$data = json_decode(file_get_contents('php://input'));

$conn = new mysqli('localhost', 'user', 'password', 'database');  

$sql = "INSERT INTO users (name, email, password)
         VALUES ('{$data->name}', '{$data->email}', '{$data->password}')";

if (mysqli_query($conn, $sql)) 
{
  echo json_encode(['message' => 'User created']);
} 
else 
{
  echo json_encode(['message' => 'Error']);
}

?>