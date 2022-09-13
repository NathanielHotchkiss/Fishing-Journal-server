# Fishing Log Server

## Installation

Clone this repository to your machine.

`cd` into the repository.

Install the node dependencies using `npm install`.

Create an `.env` file and add the following: 

```
  NODE_ENV=development
  PORT=8080
  DATABASE_URL=postgres://[username]:[password]@localhost:5432/[fishing_app_database_name]
```

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

http://localhost:5050/app_users/new

{
    "first_name": "John",
    "last_name": "Wick",
    "email": "gunfu@gmail.com",
    "password": "SecretW0rd!"
}

{
    "user_id": "4",
    "first_name": "John",
    "last_name": "Wick",
    "email": "gunfu@gmail.com",
    "password": "$2a$12$xKU6j0/7d5xhcKGKlU2WMOHHkVyJ/DkeyqneewvsHcZxdFKCT46VG",
    "created": "2022-08-29T15:56:53.236Z",
    "archived": null
}

http://localhost:5050/auth/token

{
    "email": "gunfu@gmail.com",
    "password": "SecretW0rd!"
}

{
    "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNCIsImZpcnN0X25hbWUiOiJKb2huIiwibGFzdF9uYW1lIjoiV2ljayIsImlhdCI6MTY2MTc4ODc0MCwiZXhwIjoxNjYxNzk4NzQwLCJzdWIiOiJndW5mdUBnbWFpbC5jb20ifQ.EMupfzE1QqyHqgNmlGI7djIksWoWDwZ5yW-bY7p0Xs4"
}

http://localhost:5050/fishing_logs/4

{
    "email": "gunfu@gmail.com",
    "password": "SecretW0rd!",
    "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNCIsImZpcnN0X25hbWUiOiJKb2huIiwibGFzdF9uYW1lIjoiV2ljayIsImlhdCI6MTY2MTc4ODc0MCwiZXhwIjoxNjYxNzk4NzQwLCJzdWIiOiJndW5mdUBnbWFpbC5jb20ifQ.EMupfzE1QqyHqgNmlGI7djIksWoWDwZ5yW-bY7p0Xs4"
}