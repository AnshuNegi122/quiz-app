# FrostByte - ACM Quiz Application

A full-stack quiz application for ACM events built with Next.js, MongoDB, and TypeScript.

## 🚀 Features

- **Admin Dashboard**: Create, read, update, and delete questions
- **Admin Authentication**: JWT-based authentication with secure httpOnly cookies
- **Participant Quiz**: Single-attempt quiz with real-time scoring
- **Leaderboard**: View participant rankings sorted by score and submission time
- **Statistics**: Dashboard with total questions, participants, top score, and average score
- **Rate Limiting**: Protection against abuse with rate limiting on sensitive endpoints
- **Validation**: Server-side validation for all API endpoints
- **Error Handling**: Comprehensive error handling with user-friendly messages

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Shadcn UI**
- **Framer Motion**
- **Sonner** (Toast notifications)

### Backend
- **Next.js API Routes** (Serverless functions)
- **MongoDB** with Mongoose
- **JWT** (JSON Web Tokens)
- **bcryptjs** (Password hashing)
- **Express-rate-limit** (Rate limiting)

### Testing
- **Jest**
- **Supertest**

## 📋 Prerequisites

- Node.js 18+ and npm/pnpm/yarn
- MongoDB Atlas account (or local MongoDB instance)
- Git

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd frostbyte
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp env.example .env.local
```

Update the following variables in `.env.local`:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/frostbyte?retryWrites=true&w=majority

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Port (optional, defaults to 3000 for Next.js)
PORT=3000

# Node Environment
NODE_ENV=development
```

### 4. Set Up MongoDB Atlas

#### Option A: MongoDB Atlas (Recommended for Production)

1. Create a MongoDB Atlas account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier is sufficient for development)
3. Create a database user:
   - Go to "Database Access" → "Add New Database User"
   - Set username and password
   - Save the credentials
4. Whitelist IP addresses:
   - Go to "Network Access" → "Add IP Address"
   - For development, use `0.0.0.0/0` (allow all IPs)
   - For production, whitelist specific IPs
5. Get connection string:
   - Go to "Database" → "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `frostbyte`
   - Update `MONGODB_URI` in `.env.local`

#### Option B: Local MongoDB

If you have MongoDB installed locally:

```env
MONGODB_URI=mongodb://localhost:27017/frostbyte
```

### 5. Seed the Database

Run the seed script to create an admin user and sample questions:

```bash
npm run seed
# or
pnpm seed
# or
yarn seed
```

This will create:
- An admin user with the username and password from `.env.local`
- 5 sample questions

### 6. Run the Development Server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 API Documentation

### Admin Endpoints

#### POST /api/admin/login
Login as admin and receive a JWT token.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "admin": {
    "id": "507f1f77bcf86cd799439011",
    "username": "admin"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -c cookies.txt
```

#### GET /api/admin/stats
Get statistics (requires authentication).

**Response:**
```json
{
  "totalQuestions": 5,
  "totalParticipants": 10,
  "topScore": 100,
  "avgScore": 85
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/admin/stats \
  -b cookies.txt
```

#### GET /api/admin/leaderboard?page=1&limit=10
Get leaderboard (requires authentication).

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "name": "John Doe",
      "email": "joh***@example.com",
      "score": 100,
      "time": "N/A",
      "submittedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 10,
    "totalPages": 1
  }
}
```

#### GET /api/admin/questions
Get all questions (requires authentication).

#### POST /api/admin/questions
Create a new question (requires authentication).

**Request Body:**
```json
{
  "title": "What does HTML stand for?",
  "options": [
    "Hyper Text Markup Language",
    "High Tech Modern Language",
    "Home Tool Markup Language",
    "Hyperlinks and Text Markup Language"
  ],
  "correctOption": 0,
  "points": 1
}
```

#### PUT /api/admin/questions/:id
Update a question (requires authentication).

#### DELETE /api/admin/questions/:id
Delete a question (requires authentication).

### Participant Endpoints

#### POST /api/participant/start
Register a participant for the quiz.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful"
}
```

#### GET /api/questions
Get all questions (without correct answers).

**Response:**
```json
{
  "questions": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "What does HTML stand for?",
      "options": [
        "Hyper Text Markup Language",
        "High Tech Modern Language",
        "Home Tool Markup Language",
        "Hyperlinks and Text Markup Language"
      ],
      "points": 1
    }
  ]
}
```

#### POST /api/participant/submit
Submit quiz answers and calculate score.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "answers": [
    {
      "questionId": "507f1f77bcf86cd799439011",
      "answer": 0
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "participant": {
    "id": "507f1f77bcf86cd799439012",
    "name": "John Doe",
    "score": 100,
    "submittedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🧪 Testing

Run tests:

```bash
npm test
# or
pnpm test
# or
yarn test
```

Run tests in watch mode:

```bash
npm run test:watch
# or
pnpm test:watch
# or
yarn test:watch
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- **Railway**: [https://railway.app](https://railway.app)
- **Render**: [https://render.com](https://render.com)
- **Heroku**: [https://www.heroku.com](https://www.heroku.com)

### Environment Variables for Production

Make sure to set the following environment variables in your deployment platform:

- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: A strong, random secret key
- `ADMIN_USERNAME`: Your admin username
- `ADMIN_PASSWORD`: Your admin password (use a strong password)
- `NODE_ENV`: Set to `production`

### MongoDB Atlas Production Setup

1. Create a production cluster in MongoDB Atlas
2. Create a database user with strong credentials
3. Whitelist your deployment platform's IP addresses
4. Use the connection string in your production environment variables

## 🤖 Using Cursor AI

This project is designed to work well with Cursor AI for code generation and refactoring. Here are some tips:

### Regenerating API Endpoints

To regenerate or modify an API endpoint, you can use Cursor's chat feature:

```
Regenerate the POST /api/admin/questions endpoint to include validation for duplicate questions.
```

### Creating Tests

Cursor can help generate tests for your API endpoints:

```
Create a test for the POST /api/participant/submit endpoint that tests score calculation.
```

### Refactoring Models

You can ask Cursor to modify Mongoose models:

```
Add a 'category' field to the Question model and update all related API endpoints.
```

### Safe Areas for Cursor Suggestions

- **API Routes**: Safe to regenerate and refactor
- **Frontend Components**: Safe to modify and improve
- **Validation Logic**: Safe to enhance
- **Error Handling**: Safe to improve

### Areas to Be Careful With

- **Environment Variables**: Never commit secrets or expose them in code
- **Authentication Logic**: Review changes carefully
- **Database Models**: Ensure migrations are handled properly
- **Rate Limiting**: Test changes thoroughly

### Example Cursor Prompts

1. **Generate API endpoint:**
   ```
   Create a new API endpoint GET /api/admin/participants that returns all participants with pagination.
   ```

2. **Add validation:**
   ```
   Add email validation to the participant start endpoint to ensure valid email format.
   ```

3. **Create tests:**
   ```
   Generate tests for the admin questions CRUD endpoints using Jest and Supertest.
   ```

4. **Refactor code:**
   ```
   Refactor the admin dashboard to use React Query for data fetching and caching.
   ```

## 📁 Project Structure

```
frostbyte/
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── login/
│   │   │   ├── stats/
│   │   │   ├── leaderboard/
│   │   │   └── questions/
│   │   ├── participant/
│   │   │   ├── start/
│   │   │   └── submit/
│   │   └── questions/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── questions/
│   │   └── leaderboard/
│   ├── quiz/
│   ├── start/
│   └── thank-you/
├── components/
├── lib/
│   ├── api.ts
│   ├── db.ts
│   └── middleware/
├── models/
├── scripts/
│   └── seed.ts
├── __tests__/
├── env.example
├── jest.config.js
├── jest.setup.js
├── next.config.mjs
├── package.json
└── README.md
```

## 🔒 Security Considerations

1. **Password Hashing**: Admin passwords are hashed using bcrypt with salt
2. **JWT Tokens**: Stored in httpOnly cookies to prevent XSS attacks
3. **Rate Limiting**: Applied to login and submit endpoints
4. **Input Validation**: All inputs are validated on the server
5. **CORS**: Configure CORS appropriately for production
6. **Environment Variables**: Never commit secrets to version control

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, please open an issue in the repository.

---

Built with ❤️ for ACM Events

