# FlavourFind – AI-powered food & restaurant recommender

FlavourFind is a full-stack, microservices-based application that recommends restaurants based on your food preferences, budget, and interaction history (likes, saves, ratings, reviews).

The system is designed using a microservices architecture and containerized using Docker.

---

## Tech Stack

Frontend: React (Vite)  
API Gateway: Node.js + Express  
Backend Services: Node.js + Express  
Recommendation Engine: FastAPI (Python)  
Database: MongoDB  
Containerization: Docker & Docker Compose  

---

## Architecture

The system consists of multiple services:

- React SPA client (`client`)
- Node/Express API gateway (`gateway`)
- User service (`services/user-service`)
- Restaurant service (`services/restaurant-service`)
- Interaction service (`services/interaction-service`)
- Recommendation service (`services/recommendation-service`)
- MongoDB databases
- Docker Compose setup (`docker/docker-compose.yml`)

---

# 1. Prerequisites

Make sure the following are installed:

- Docker Desktop (running)
- Node.js 18+
- npm

---

# 2. Run the Backend with Docker

From the project root directory:

```bash
cd docker
docker compose up --build
```

This will start the following services:

mongo-user – MongoDB for user data  
mongo-restaurant – MongoDB for restaurant data  
mongo-interaction – MongoDB for interaction data  
user-service – User management service (port 5001 inside Docker)  
restaurant-service – Restaurant data service (port 5002 inside Docker)  
interaction-service – User interaction service (port 5003 inside Docker)  
recommendation-service – FastAPI recommendation engine (port 8000 inside Docker)  
gateway – API gateway exposed on http://localhost:5000  

Expected logs:

```
User Service running on 5001
Restaurant Service running on 5002
Interaction Service running on 5003
Uvicorn running on http://0.0.0.0:8000
Gateway running on port 5000
```

Leave this terminal running.

---

# 3. Run the React Client

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

Vite will start the frontend server:

```
http://localhost:5173/
```

Open this URL in your browser.

The frontend communicates with the API gateway at:

```
http://localhost:5000
```

---

# 4. Using the Application

Browse restaurants on the home page.

Register as a new user and log in.

Users can:

- Like restaurants
- Save restaurants
- Rate restaurants
- Write reviews

These interactions help improve the recommendation engine.

Click **For You** on the home page to get personalized restaurant recommendations.

---

# 5. Admin Access

Login with:

```
Username: admin
Password: admin123
```

Admin features:

- Create restaurants
- Edit restaurant details
- Delete restaurants

All operations are available through the Admin Panel.

---

# 6. Manual Setup (Without Docker)

If you prefer running services manually, ensure MongoDB is running locally.

Start each service individually.

User Service

```bash
cd services/user-service
npm install
node server.js
```

Restaurant Service

```bash
cd services/restaurant-service
npm install
node server.js
```

Interaction Service

```bash
cd services/interaction-service
npm install
node server.js
```

Recommendation Service

```bash
cd services/recommendation-service
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```

API Gateway

```bash
cd gateway
npm install
node server.js
```

Run the Client

```bash
cd client
npm install
npm run dev
```

---

# 7. Project Structure

```
FlavourFind
│
├── client/
│   React + Vite frontend
│
├── gateway/
│   API gateway for all client requests
│
├── services/
│   ├── user-service/
│   │   User accounts & preferences (MongoDB)
│   │
│   ├── restaurant-service/
│   │   Restaurant data & filtering (MongoDB)
│   │
│   ├── interaction-service/
│   │   Likes, saves, ratings, reviews (MongoDB)
│   │
│   └── recommendation-service/
│       FastAPI recommendation engine
│
└── docker/
    docker-compose.yml
```

---

# Features

- Microservices architecture
- AI-powered restaurant recommendations
- User interaction tracking
- Admin restaurant management
- Docker containerized environment
- Scalable backend services

---

# Future Improvements

- Advanced recommendation models
- Location-based recommendations
- Restaurant image support
- Kubernetes deployment
- CI/CD integration

---

# Author

AI Food Recommender Project
