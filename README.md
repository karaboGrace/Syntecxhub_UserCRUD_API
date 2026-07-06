# User Management and Secure Notes Relational API

A RESTful backend API built with Node.js, Express, and Mongoose that handles user accounts, secure authentication, and a relational, user-owned notes management system. The application utilizes MongoDB Atlas for cloud data persistence, enforces token-based route authorization, and implements data archiving patterns.

## Features

### User Administration & Security
- **Comprehensive CRUD:** Core operations to create, read, update, and delete user accounts.
- **Secure Password Hashing:** Automatically runs user passwords through bcrypt before database storage.
- **JWT Authentication:** Issues JSON Web Tokens (JWT) upon successful login to handle stateless authorization.
- **Route Protection Middleware:** Enforces token verification to restrict sensitive administrative and resource endpoints to authenticated users.

### Relational Notes System
- **Data Modeling (One-to-Many):** Maps notes directly to their creator by storing a referenced User ID within the note schema.
- **Ownership Authorization:** Validates the incoming token payload against the resource owner ID to block unauthorized access, updates, or deletions.
- **On-the-Fly Document Hydration:** Utilizes Mongoose `.populate()` to dynamically resolve relational user object data during single-note lookups.
- **Soft-Deletion (Archiving):** Implements a `PATCH` toggle mechanism that marks notes as archived, instantly filtering them out of active queues without destructive hard-deletes.

---

## Tech Stack

- **Runtime Environment:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas
- **ODM (Object Data Modeling):** Mongoose
- **Security:** Bcrypt, JSON Web Tokens (JWT)
- **Testing Tool:** Postman

---

## API Endpoints

### Authentication & Profiles
| Method | Endpoint | Description | Auth Required | Status (Success) |
| :--- | :--- | :--- | :--- | :--- |
| POST | /api/auth/signup | Register a new account and hash password | No | 201 Created |
| POST | /api/auth/login | Authenticate credentials and return JWT | No | 200 OK |
| GET | /api/users | Fetch all user profiles | Yes (JWT) | 200 OK |
| GET | /api/users/:id | Fetch a single user by ID | No | 200 OK |
| PATCH | /api/users/:id | Update a user profile by ID | No | 200 OK |
| DELETE | /api/users/:id | Permanently delete a user by ID | No | 200 OK |

### Notes Management
| Method | Endpoint | Description | Auth Required | Status (Success) |
| :--- | :--- | :--- | :--- | :--- |
| POST | /api/notes | Create a note linked to the authenticated user | Yes (JWT) | 201 Created |
| GET | /api/notes | Fetch active notes belonging to the session user | Yes (JWT) | 200 OK |
| GET | /api/notes/:id | Fetch single note by ID with populated user details | Yes (JWT) | 200 OK |
| PUT | /api/notes/:id | Update title or content of an owned note | Yes (JWT) | 200 OK |
| PATCH | /api/notes/:id/archive | Toggle the soft-delete status of an owned note | Yes (JWT) | 200 OK |
| DELETE | /api/notes/:id | Permanently delete an owned note from database | Yes (JWT) | 200 OK |
