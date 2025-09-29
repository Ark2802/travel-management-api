# Travel Management API

A comprehensive Travel Management API built with Node.js, Express, and MongoDB, featuring JWT authentication and role-based access control (RBAC).

## 🚀 Features

- **Authentication & Authorization**

  - User registration and login with JWT tokens
  - Password hashing with bcrypt
  - Token expiration (15 minutes)
  - Role-based access control (RBAC)

- **User Roles**

  - `admin`: Can delete users and view all resources
  - `owner`: Can add and manage vehicles
  - `driver`: Can view assigned trips (future feature)
  - `customer`: Can book trips (future feature)

- **Security Features**
  - JWT token verification
  - Token expiration handling
  - Role-based route protection
  - Password hashing
  - Input validation

## 📁 Project Structure

```
travel-management-api/
├── controllers/
│   ├── authController.js      # Authentication logic
│   ├── userController.js      # User management
│   └── vehicleController.js   # Vehicle management
├── middleware/
│   ├── auth.js               # JWT verification
│   └── rbac.js               # Role-based access control
├── models/
│   ├── User.js               # User schema
│   └── Vehicle.js            # Vehicle schema
├── routes/
│   ├── auth.js               # Authentication routes
│   ├── users.js              # User routes
│   └── vehicles.js           # Vehicle routes
├── .env                      # Environment variables
├── server.js                 # Main server file
└── package.json              # Dependencies
```

## 🛠️ Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd travel-management-api
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Update the `.env` file with your configuration:

   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/travel-management-db
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "customer" // optional, defaults to "customer"
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "email": "user@example.com",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Protected Routes

All protected routes require the `Authorization` header:

```http
Authorization: Bearer <your-jwt-token>
```

#### User Management (Admin Only)

##### Delete User

```http
DELETE /api/users/delete/:id
Authorization: Bearer <admin-token>
```

##### Get All Users

```http
GET /api/users
Authorization: Bearer <admin-token>
```

##### Get User by ID

```http
GET /api/users/:id
Authorization: Bearer <token>
```

#### Vehicle Management

##### Add Vehicle (Owner Only)

```http
POST /api/vehicles/add
Authorization: Bearer <owner-token>
Content-Type: application/json

{
  "make": "Toyota",
  "model": "Camry",
  "year": 2022,
  "licensePlate": "ABC123",
  "capacity": 4,
  "status": "available" // optional
}
```

##### Get My Vehicles (Owner Only)

```http
GET /api/vehicles/my
Authorization: Bearer <owner-token>
```

##### Get All Vehicles (Admin Only)

```http
GET /api/vehicles
Authorization: Bearer <admin-token>
```

## 🔐 Authentication & Authorization Flow

1. **User Registration/Login**: User provides credentials and receives JWT token
2. **Token Verification**: Each protected route verifies the JWT token
3. **Role Check**: RBAC middleware checks if user has required role
4. **Access Control**: User gets access only if token is valid and role matches

## 🛡️ Security Features

### JWT Token Security

- **Expiration**: Tokens expire in 15 minutes
- **Secret**: Uses strong JWT secret (configure in .env)
- **Verification**: All protected routes verify token validity

### Password Security

- **Hashing**: Passwords hashed with bcrypt (salt rounds: 12)
- **No Storage**: Plain text passwords never stored
- **Comparison**: Secure password comparison method

### Role-Based Access Control

- **Admin**: Full access to user management
- **Owner**: Can manage vehicles
- **Driver**: Limited access (future feature)
- **Customer**: Basic access (future feature)

## 🧪 Testing the API

### 1. Register an Admin User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```

### 2. Login and Get Token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### 3. Use Token to Access Protected Route

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <your-token-here>"
```

## ⚠️ Token Expiry Handling

- Tokens expire in 15 minutes
- Expired token requests return 401 with message: "Token has expired. Please log in again"
- Users must login again to get a new token
- No refresh token mechanism (as per requirements)

## 🌟 Key Implementation Features

1. **User Schema**: MongoDB schema with email, password, role fields
2. **JWT Middleware**: Verifies tokens and handles expiration
3. **RBAC Middleware**: Enforces role-based permissions
4. **Protected Routes**:
   - `/users/delete/:id` → Admin only
   - `/vehicles/add` → Owner only
5. **Error Handling**: Comprehensive error responses
6. **Validation**: Input validation for all endpoints

## 📦 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT implementation
- **express-validator**: Input validation
- **dotenv**: Environment variables
- **cors**: Cross-origin resource sharing

## 🔧 Environment Variables

| Variable      | Description               | Default         |
| ------------- | ------------------------- | --------------- |
| `PORT`        | Server port               | 3000            |
| `MONGODB_URI` | MongoDB connection string | localhost:27017 |
| `JWT_SECRET`  | JWT signing secret        | Required        |
| `NODE_ENV`    | Environment               | development     |

## 🚦 HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication failed)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate data)
- `500`: Internal Server Error

## 📝 Response Format

All API responses follow this structure:

```json
{
  "success": boolean,
  "message": "string",
  "data": object, // optional
  "errors": array // optional (for validation errors)
}
```

## 🔄 Future Enhancements

- Trip management for drivers and customers
- Refresh token implementation
- Rate limiting
- API documentation with Swagger
- Unit and integration tests
- Docker containerization
- Email verification
- Password reset functionality
