# 🎬 Next.js Movie API

## 📌 Overview
This project is a **RESTful API** built with **Next.js** that allows users to interact with a movie database. It supports CRUD operations for **movies, theaters, and comments** using **MongoDB** as the database and is hosted on **Vercel** for seamless deployment and scalability.

## 🚀 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js** | API Routes & Serverless Functions |
| **MongoDB** | NoSQL Database for storing movies, theaters, and comments |
| **Zod** | Data validation for API requests |
| **Swagger (OpenAPI)** | API documentation |
| **Vercel** | Cloud hosting for deployment |

## ☁️ Cloud Architecture

The architecture follows a **serverless, cloud-native** approach using **Vercel’s Serverless Functions** and **MongoDB Atlas**:

1. **Client Requests** → API requests are made to Vercel’s serverless functions.
2. **Vercel Functions** → API routes in Next.js handle CRUD operations.
3. **MongoDB Atlas** → Persistent storage of movie-related data.
4. **Caching & Optimization** → Vercel provides automatic caching for faster responses.

**Diagram:**
```
Client  →  Vercel (Serverless API)  →  MongoDB Atlas (Database)
```

## 🛠️ Setup & Installation

### 1️⃣ Clone the Repository
```sh
$ git clone https://github.com/yourusername/nextjs-movie-api.git
$ cd project-dev-svc-cloud
```

### 2️⃣ Install Dependencies
```sh
$ npm install
```

### 3️⃣ Setup Environment Variables
Create a `.env.local` file in the root directory and add:
```sh
MONGODB_URI=mongodb+srv://youruser:yourpassword@cluster.mongodb.net/movies_db
```

### 4️⃣ Run Locally
```sh
$ npm run dev
```

### 5️⃣ API Documentation (Swagger UI)
Visit `http://localhost:3000/api/doc` to view API documentation.

## 📌 API Endpoints

### 🎥 Movies
| Method | Endpoint | Description |
|--------|---------|-------------|
| **GET** | `/api/movies` | Get a list of movies |
| **POST** | `/api/movies` | Add a new movie |
| **PUT** | `/api/movies/:id` | Update a movie by ID |
| **DELETE** | `/api/movies/:id` | Remove a movie by ID |

### 🎭 Theaters
| Method | Endpoint | Description |
|--------|---------|-------------|
| **GET** | `/api/theaters` | Get a list of theaters |
| **POST** | `/api/theaters` | Add a new theater |
| **PUT** | `/api/theaters/:id` | Update a theater by ID |
| **DELETE** | `/api/theaters/:id` | Remove a theater by ID |

### 💬 Comments
| Method | Endpoint | Description |
|--------|---------|-------------|
| **GET** | `/api/comments` | Get all comments |
| **POST** | `/api/comments` | Add a comment |
| **DELETE** | `/api/comments/:id` | Delete a comment |

## 🔥 Features
✅ **Serverless API** with Next.js & Vercel  
✅ **MongoDB Atlas** for scalable NoSQL storage  
✅ **Data validation** with Zod  
✅ **Swagger (OpenAPI)** for API documentation  
✅ **Automatic Caching** via Vercel  

## 🛠 Future Enhancements
- ✅ Implement Authentication (JWT / OAuth)
- ✅ Rate limiting for API protection
- ✅ Unit & Integration Testing
---
