# KIB TMDB Service

Welcome to the TMDB APIs written in NodeJS using NestJS framework.
This is a service orchestration layer responsible for connecting frontend applications to KIB TMDB backend business systems.

## Development
### Development Prerequisites

To start development on this project install the following applications:

1. VS Code (https://code.visualstudio.com/download)
2. Redis (https://redis.io/download or https://github.com/microsoftarchive/redis/releases)
3. NodeJS (https://nodejs.org/en/download/)
4. NestJS cli on your computer `npm install -g @nestjs/cli`
4. MongoDB (https://www.mongodb.com/docs/manual/installation/)

### Installation

Before starting development, create a feature branch from the develop branch following this pattern
feature/{feature-name}/{description-of-change} .e.g. feature/tmdb/admin-profile
Clone the repository and install project dependencies by running the below commands.

- Clone repository

```sh
git clone https://github.com/AalaaGhanam/kib-tmdb-service.git
```

- Install node dependencies

```sh
npm i
```
Once all dependencies are installed start Redis and MongoDB, as the application relies on
Redis for data caching and MongoDB for storing data, and run below commands to start the application.
The application relies on environment variables for most
of its configuration using the dotenv NodeJS module. To set up environment
variables copy and paste then rename the .dev.env files to .env.

> [!IMPORTANT]
> To initiate and sync the database with tmdb database, call /sync endpoint after starting the service, please check the endpoint details below.


- Run Service

```sh
npm run start
```
- Executing Tests
```sh
npm run test
```
- Access Swagger Docs
```sh
http://localhost:8080/api/docs/#/
```
- Run Throw Docker
```sh
# Run
docker-compose up

# Stop
docker-compose down
```

### Service Structure and Endpoints
 
Kib TMDB service consists of two main controllers (User and TMDB API controllers), here's a detailed breakdown of the API endpoints:

1. **User Controller Endpoints:**<br />
**Register User:** User registration with credentials and storing user data in MongoDB.<br />
**Login:** Allows the user to login and obtain an access token using JWT.<br />
**Get My Profile:** Authenticated request to retrieve the user's profile.<br />
**Add Movie to Watchlist:** Allows authenticated users to add a movie to their watchlist.<br />
**Rate Movie:** Allows users to rate a movie (average rating is stored).<br /><br />
2. **TMDB API Controller Endpoints:**<br />
**Add Movie:** Allows an authenticated user to add a movie to the database.<br />
**List All Movies:** Allows user to list all movies from the database.<br />
**Get Movie:** Allows user to get movie by Id from the database.<br />
**Update Movie:** Allows an authenticated user to update the movie details.<br />
**Delete Movie:** Allows an authenticated user to delete a movie from the database.<br />
**Rate Movie:** Allows users to rate a movie (average rating is stored).<br />
**Sync Movies:** This endpoint syncs and updates the MongoDB database with movie data from the TMDB API.<br />

#### Ping 

```sh
# check service connection
GET: http://localhost:8080/api/ping
```

#### Users 

```sh
# register new user
POST: http://localhost:8080/api/users/register

# login and get the token to be able to use the service endpoints
POST: http://localhost:8080/api/users/login

# get user profile
GET: http://localhost:8080/api/users/profile
--header 'Authorization: ••••••'

# add movie to my watch list
PUT: http://localhost:8080/api/users/{movieId}/watch-list
--header 'Authorization: ••••••'
```

### TMDB 

```sh
# add movie
POST: http://localhost:8080/api/tmdb/movies
--header 'Authorization: ••••••'

# list all movies
GET: http://localhost:8080/api/movies

# get movie
GET: http://localhost:8080/api/movies/{movieId}

# update
PUT: http://localhost:8080/api/movies/{movieId}
--header 'Authorization: ••••••'

# remove movie
DEL: http://localhost:8080/api/movies/{movieId}
--header 'Authorization: ••••••'

# rate movie
PUT: http://localhost:8080/api/movies/{movieId}/rate
--header 'Authorization: ••••••'

# sync movies
GET: http://localhost:8080/api/movies/sync
```