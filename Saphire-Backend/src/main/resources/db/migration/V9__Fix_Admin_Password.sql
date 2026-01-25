-- V9__Fix_Admin_Password.sql
-- Updates the admin user's password to match 'admin123'
UPDATE users 
SET hashed_password = '$2a$10$dpUzv3fW3jc2G8ex7TEp/.GjO97bKYMkld1iEAz/6tBF6.8q/Juwe' 
WHERE username = 'admin';
