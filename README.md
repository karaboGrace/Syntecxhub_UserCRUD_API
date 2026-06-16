# User CRUD API

A lightweight RESTful API built with Node.js, Express, and Mongoose for managing a user database. This project connects to a MongoDB Atlas cloud database and allows full Create, Read, Update, and Delete (CRUD) operations.

## Features
- **Create**: Add new users with a name, email, and age.
- **Read**: Fetch all users or look up a specific user by their unique ID.
- **Update**: Modify existing user details dynamically using `PATCH`.
- **Delete**: Permanently remove users from the database.
- **Data Validation**: Built-in Mongoose schema validation ensures missing or malformed data is rejected with appropriate HTTP status codes.

## Tech Stack
- **Runtime Environment:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas
- **ODM (Object Data Modeling):** Mongoose
- **Testing Tool:** Postman

## Endpoints Optimized for Testing
| Method | Endpoint | Description | Status Code (Success) |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/users` | Create a new user | 201 Created |
| `GET` | `/api/users` | Fetch all users | 200 OK |
| `GET` | `/api/users/:id` | Fetch a single user by ID | 200 OK |
| `PATCH` | `/api/users/:id` | Update a user by ID | 200 OK |
| `DELETE` | `/api/users/:id` | Delete a user by ID | 200 OK |