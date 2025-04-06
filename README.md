# CineTracks

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

CineTracks is a comprehensive entertainment tracking platform that allows users to manage movies, TV series, and anime in one centralized application. It provides a unified solution for maintaining watchlists across different content types with reliable data from trusted sources.

## 🌟 Features

- **Unified Watchlist Management**: Track movies, TV series, and anime all in one place
- **Personalized Categories**: Organize content into "Watched", "Currently Watching", and "Plan to Watch" lists
- **Real-time Data Integration**: Fetch accurate information from trusted sources like TMDB
- **User Ratings & Reviews**: Rate and review content you've watched
- **Progress Tracking**: Keep track of your watching progress, including episodes for series
- **Smart Recommendations**: Get personalized content suggestions based on your preferences
- **Responsive Design**: Enjoy a seamless experience across desktop and mobile devices
- **Secure Authentication**: Protect your account with robust user authentication

## 🛠️ Technology Stack

### Backend
- **Java Spring Boot** for microservices architecture
- **Spring Security** with JWT for authentication
- **PostgreSQL** database for data persistence
- **RESTful APIs** for communication between services
- **Nginx** as a reverse proxy
- **Docker** for containerization and deployment

### Frontend
- **Next.js** for server-side rendering and optimal performance
- **React** for building a dynamic and responsive UI
- **TypeScript** for type safety
- **Tailwind CSS** for styling (inferred from project structure)

## 🏗️ Architecture

CineTracks follows a microservices architecture:

- **Auth Service**: Handles user registration, authentication, and authorization
- **Movie Catalog Service**: Manages movie data, watchlists, and integrates with TMDB API
- **Frontend Service**: Delivers the user interface and interacts with backend services

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js (v14 or higher)
- Java 11 or higher (for local development)
- Maven (for local development)

### Installation and Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Snapman5678/CineTracks.git
   cd cinetracks
   ```

2. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   POSTGRES_USER=your_db_user
   POSTGRES_PASSWORD=your_db_password
   POSTGRES_DB=cinetracks
   JWT_SECRET=your_jwt_secret
   TMDB_API_KEY=your_tmdb_api_key
   ```

3. **Start the application with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - API Gateway: http://localhost:8080

### Local Development

#### Backend
```bash
cd backend/auth-service
./mvnw spring-boot:run

# In a new terminal
cd backend/movie-catalog-service
./mvnw spring-boot:run
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🧪 Running Tests

### Backend
```bash
cd backend/auth-service
./mvnw test

cd backend/movie-catalog-service
./mvnw test
```

### Frontend
```bash
cd frontend
npm test
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [TMDB API](https://www.themoviedb.org/documentation/api) for providing movie and TV series data
- All contributors who have helped make this project better