## FlavourFind – AI‑powered food & restaurant recommender

FlavourFind is a full‑stack, microservices‑based app that recommends restaurants based on your food preferences, budget, and interaction history (likes, saves, ratings, reviews). It includes:

- **React** SPA client (`client`)
- **Node/Express** API gateway (`gateway`)
- **Node/Express** services for users, restaurants, and interactions (`services`)
- **FastAPI** recommendation service (`services/recommendation-service`)
- **MongoDB** for all persistent data
- **Docker Compose** setup (`docker/docker-compose.yml`)

---

### 1. Prerequisites

- **Docker Desktop** installed and running
- **Node.js 18+** and **npm** (for running the React client locally)

---

### 2. Run the backend with Docker

From the root of the project:

```bash
cd docker
docker compose up --build
This will start:

mongo-user, mongo-restaurant, mongo-interaction (MongoDB instances)
user-service (port 5001 inside Docker)
restaurant-service (port 5002 inside Docker)
interaction-service (port 5003 inside Docker)
recommendation-service (FastAPI, port 8000 inside Docker)
gateway (exposed on http://localhost:5000)
You should see logs like:

User Service running on 5001
Restaurant Service running on 5002
Interaction Service running on 5003
Uvicorn running on http://0.0.0.0:8000
Gateway running on port 5000
Leave this terminal running.

3. Run the React client
In a new terminal:

cd client
npm install
npm run dev
Vite will print a URL, usually:

http://localhost:5173/
Open that in your browser. The client is configured to talk to the gateway at http://localhost:5000.

4. Using the app
Browse restaurants on the home page.
Register as a new user, then log in with the same credentials.
Like / save restaurants and see them on your Profile page.
Rate and review restaurants; these feed into the recommender.
Click 🎯 For You on the home page to get personalized recommendations.
Log in as admin in the UI with:
Username: admin
Password: admin123
Use the Admin Panel to create, edit, or delete restaurant entries.
5. Manual (non‑Docker) setup (optional)
If you don’t want Docker, you’ll need MongoDB running locally and environment variables set for each service.

Example (from the project root):

# User service
cd services/user-service
npm install
node server.js
# Restaurant service
cd ../restaurant-service
npm install
node server.js
# Interaction service
cd ../interaction-service
npm install
node server.js
# Recommendation service
cd ../recommendation-service
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
# Gateway
cd ../../../gateway
npm install
node server.js
Then run the client as shown in section 3.

6. Project structure
client/ – React + Vite frontend
gateway/ – API gateway for all client calls
services/user-service/ – user accounts & preferences (MongoDB)
services/restaurant-service/ – restaurant data & filters (MongoDB)
services/interaction-service/ – likes, saves, ratings, reviews (MongoDB)
services/recommendation-service/ – FastAPI recommendation engine
docker/ – docker-compose.yml and container setup
