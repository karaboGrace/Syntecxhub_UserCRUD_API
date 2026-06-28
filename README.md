# User CRUD and Authentication API

A lightweight RESTful API built with Node.js, Express, and Mongoose for managing a user database. This project connects to a MongoDB Atlas cloud database, allows full Create, Read, Update, and Delete (CRUD) operations, and includes a secure user authentication system.

## Features

- **Create:** Add new users with a name, email, age, and password.
- **Read:** Fetch all users or look up a specific user by their unique ID.
- **Update:** Modify existing user details dynamically using PATCH.
- **Delete:** Permanently remove users from the database.
- **Data Validation:** Built-in Mongoose schema validation ensures missing or malformed data is rejected with appropriate HTTP status codes.
- **Secure Password Hashing:** Automatically hashes user passwords using bcrypt before saving them to the database.
- **JWT Authentication:** Issues secure JSON Web Tokens upon successful user login.
- **Route Protection:** Restricts access to sensitive endpoints (such as fetching all users) to authorized token holders only.

## Tech Stack

- **Runtime Environment:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas
- **ODM (Object Data Modeling):** Mongoose
- **Security:** Bcrypt, JSON Web Tokens (JWT)
- **Testing Tool:** Postman

## Endpoints Optimized for Testing

| Method | Endpoint | Description | Status Code (Success) |
| :--- | :--- | :--- | :--- |
| POST | /api/auth/signup | Register a new user and hash password | 201 Created |
| POST | /api/auth/login | Authenticate user and return JWT token | 200 OK |
| POST | /api/users | Create a new user profile | 201 Created |
| GET | /api/users | Fetch all users (Requires valid JWT Token) | 200 OK |
| GET | /api/users/:id | Fetch a single user by ID | 200 OK |
| PATCH | /api/users/:id | Update a user by ID | 200 OK |
| DELETE | /api/users/:id | Delete a user by ID | 200 OK |