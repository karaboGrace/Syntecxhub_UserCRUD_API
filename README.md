# User Management and Secure Notes Relational API

A RESTful backend API built with Node.js, Express, and Mongoose that handles user accounts, secure authentication, role-based access control, and a relational, user-owned notes management system. The application utilizes MongoDB Atlas for cloud data persistence, enforces token-based route authorization, and implements data archiving patterns.

## Features

### User Administration & Security
- **Comprehensive CRUD:** Core operations to create, read, update, and delete user accounts.
- **Secure Password Hashing:** Automatically runs user passwords through bcrypt before database storage.
- **JWT Authentication:** Issues JSON Web Tokens (JWT) upon successful login to handle stateless authorization, with user roles encoded directly into the token payload.
- **Route Protection Middleware:** Enforces token verification to restrict sensitive administrative and resource endpoints to authenticated users.

### Role-Based Access Control (RBAC)
- **Hierarchical Roles:** Supports distinct user tiers (`user` and `admin`) to govern resource access.
- **Role Authorization Middleware:** Custom middleware that inspects JWT payloads and restricts advanced endpoints to authorized roles.
- **Administrative Management:** Exposes dedicated administrative endpoints allowing admins to promote standard users or block/suspend accounts.
- **Activity Audit Logging:** Server-side console logging of administrative actions for auditing purposes.

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
| POST | /api/auth/login | Authenticate credentials and return JWT with role | No | 200 OK |
| GET | /api/users | Fetch all user profiles | Yes (Admin Only) | 200 OK |
| GET | /api/users/:id | Fetch a single user by ID | No | 200 OK |
| PATCH | /api/users/:id | Update a user profile by ID | No | 200 OK |
| DELETE | /api/users/:id | Permanently delete a user by ID | No | 200 OK |

### Administrative Management
| Method | Endpoint | Description | Auth Required | Status (Success) |
| :--- | :--- | :--- | :--- | :--- |
| PATCH | /api/admin/users/:id/promote | Promote a specific user to admin | Yes (Admin Only) | 200 OK |
| PATCH | /api/admin/users/:id/block | Block / suspend a specific user account | Yes (Admin Only) | 200 OK |

### Notes Management
| Method | Endpoint | Description | Auth Required | Status (Success) |
| :--- | :--- | :--- | :--- | :--- |
| POST | /api/notes | Create a note linked to the authenticated user | Yes (JWT) | 201 Created |
| GET | /api/notes | Fetch active notes belonging to the session user | Yes (JWT) | 200 OK |
| GET | /api/notes/:id | Fetch single note by ID with populated user details | Yes (JWT) | 200 OK |
| PUT | /api/notes/:id | Update title or content of an owned note | Yes (JWT) | 200 OK |
| PATCH | /api/notes/:id/archive | Toggle the soft-delete status of an owned note | Yes (JWT) | 200 OK |
| DELETE | /api/notes/:id | Permanently delete an owned note from database | Yes (JWT) | 200 OK |
