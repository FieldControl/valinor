<<<<<<< HEAD
# AirCnC
=======
# Challenge: Backend Developer I

Develop a RESTful JSON API by exposing operations of a CRUD.Something very similar to the ProductHunt API was developed.

## App
![CRUD](https://user-images.githubusercontent.com/50254416/67446772-0d8be300-f5e8-11e9-99ea-5bd5077d52fa.gif)

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
- Configuration **mongoose-paginate** to page the records in our database.
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
>>>>>>> 8135dd7f4506c54a03111721ecd849e40b9f9614
