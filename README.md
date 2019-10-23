# Challenge: Backend Developer I

Develop a RESTful JSON API by exposing operations of a CRUD.Something very similar to the ProductHunt API was developed.

### requirements

- Version node: `10.15.0`.
- NodeJs [Link](https://nodejs.org/en/download/) for backend.

### Insomnia
- I used Insomnia to make Application requests.
- Visit the site and download the tool [Link](https://insomnia.rest/download/).

### Docker 
- I used the docker for database access.
- Download the tool to have access and manipulation to our database [Link](https://docs.docker.com/install/linux/docker-ce/ubuntu/).

### Install MongoDB with Docker
- With the docker already installed on your machine do the following commands.
```
$ sudo docker 

$ sudo docker pull mongo

$ sudo docker run --name mongodb -p 27017:27017 -d mongo

$ sudo docker ps 

```
 
## Configuration
- Configuration **Express** , a microframework that deals with routes, requests and responses;
- Configuration **nodemon** to monitor code changes and restart the server automatically when changes occur;
- Creation of *Models* and *Controllers*;
- Configuration of **mongoose** (ODM that uses Javascript syntax) to handle **MongoDB**, a nonrelational database;
- npm globals packages

### Express

```
$ npm install express --save

```

### Mongoose 

```
$ npm install mongoose --save
```

### Installing

**Cloning the Repository**

```
$ git clone https://github.com/ItsJuniorDias/valinor.git

$ cd valinor
```

**Installing dependencies**

```
$ npm install nodemon --save
```

**Running**

**Backend**

```
$ cd valinor
$ npm run dev
```
