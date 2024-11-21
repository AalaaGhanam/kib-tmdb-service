# KIB TMDB Service

This is the architecture of AMON NodeJS Test.
Welcome to the TMDB APIs written in NodeJS using NestJS framework.
This is a service orchestration layer responsible for connecting frontend applications to KIB TMDB backend business systems.

## Running the app

```sh
# Run
docker-compose up

# Access Swagger Docs
http://localhost:8080/api/#/

# Stop
docker-compose down
```

## Development
### Development Prerequisites

To start development on this project install the following applications:

1. VS Code (https://code.visualstudio.com/download)
2. Redis (https://redis.io/download or https://github.com/microsoftarchive/redis/releases)
3. NodeJS (https://nodejs.org/en/download/)
4. Install NestJS cli on your computer `npm install -g @nestjs/cli`
4. Install MongoDB (https://www.mongodb.com/docs/manual/installation/)

Before starting development, create a feature branch from the develop branch following this pattern
feature/{feature-name}/{description-of-change} .e.g. feature/tmdb/admin-profile
Clone the repositorya abd install project dependencies by running the below commands.
Once all dependencies are installed start Redis and MongoDB, as the application relies on
Redis for data caching and MongoDB for storing data. The application relies on environment variables for most
of its configuration using the dotenv NodeJS module. To set up environment
variables copy and paste then rename the .dev.env files to .env.


- Clone repository

```sh
git clone https://github.com/AalaaGhanam/kib-tmdb-service.git
```

- Install node dependencies

```sh
npm i
```

- Run service

```sh
npm run start
```

- Executing tests

```sh
npm run test
```

## Endpoints
 
### Ping 

```sh
# check service connection
GET: http://localhost:8080/api/ping
```

### Users 

```sh
# register new user
POST: http://localhost:8080/api/users/register
payload {
    "username": "user",
    "password": "testUser$",
    "email": "testUser@test.com"
}

# login and get the token to be able to use the service endpoints
POST: http://localhost:8080/api/users/login
payload {
    "email": "usernamedd@ee",
    "password": "testUser$",
}

# lget user profile
GET: http://localhost:8080/api/users/profile
--header 'Authorization: ••••••'
```

### TMDB 

```sh
# add movie
POST: http://localhost:8080/api/tmdb/movies
payload {
    "username": "user",
    "password": "testUser$",
    "email": "testUser@test.com"
}

# list all movies
GET: http://localhost:8080/api/movies
--header 'Authorization: ••••••'

# lget user profile
GET: http://localhost:8080/api/users/profile
--header 'Authorization: ••••••'
```


## Links
Local dev BaseUrl and Swagger:

http://localhost:8080/api/#/