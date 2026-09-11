## What is REST API?

Before REST API's, the client request the server for the required information via an API, and then, the server send a response back to the client.

Over here, the response sent to the client is in the form of HTML web page. But, **do you think this is a apt response for that you would expect when you send a request?**

Since, you would prefer the data to be in the form of structed format, rather than the complete web page. So, for such reasons, the data returned by the server, in response to the request of the client is either in the format of JSON or XML. Both JSON and XML format have a proper hierarchical structure of data.

So o, this is where REST API comes into the picture. REST suggests to create an object of the data requested by the client and send the values of the object in response to the user.

### Principles of REST API

- #### Stateless

  The server does not store any information about the client. Each request from the client to the server must contain all the information needed to understand and process the request. The server does not remember anything about previous requests from the same client.

- #### Client-Server Architecture

  The client and server are separate entities that communicate with each other over a network. The client is responsible for the user interface and user experience, while the server is responsible for processing requests and managing data.

- #### Cacheable

  Responses from the server can be cached by the client to improve performance and reduce the number of requests sent to the server. The server can specify caching rules in the response headers to control how long the response can be cached.

- #### Uniform Interface

  All clients must interact with the server through a standardized, predictable, and consistent communication contract.

- #### Layered System

  The architecture can be composed of multiple layers, each with its own responsibilities. Each layer can only communicate with the layer directly above or below it. This allows for scalability, security, and flexibility in the system design.

- #### Code on Demand (optional)

  The server can provide executable code to the client, which can be used to extend the functionality of the client. This is an optional constraint and is not always used in RESTful systems.

## Why a seperate `server.js` file instead of putting everything in the `index.js` file?

To seperates the app definition from starting the app. `server.js` file is used to define the app and its routes, middleware, while `index.js` file is used to start the server and listen for incoming requests. Because later, if you want to write **tests**, you can import the app from `server.js` and test it without starting the server or connecting to a real database. Its about **testability**.

## Why a seperate route file?

You could have written `app.get("/movies", (req, res) => { ... })` in the `server.js` file itself. But imagine you later add reviews, users, authentication etc `server.js` would become a mess.

So routes are split into **separate files per resource**.

**Why** `router.route("/").get(...)` **instead of** `route.get("/")`**?**

`router.route("/")` lets you chain multiple HTTP methods for the same path:

```javascript
router
  .route("/")
  .get(MoviesController.apiGetMovies) // GET /api/v1/movies
  .post(MoviesController.apiCreateMovie); // POST /api/v1/movies
```

## Why doesn't the controller talk to MongoDB directly?

If you switch from MongoDB to PostgreSQL, you'd rewrite every **controller** method. Instead, the controller should call a **data access object** that handles all database operations. This way, if you switch databases, you only need to rewrite the **Data Access Object**.

Also you can't test the HTTP handling without a real database.

## Why Data Access Object?

Its a well-known design pattern, a class whose only job is to talk to the database (gatekeeper). No one else in the codebase touches MongoDB directly. Benefits:

- Switching databases is easy, you only need to rewrite the DAO.
- Database query broken? You know exactly where to look.
- Want to add caching? You can do it in the DAO without touching the controller or routes.

### The DAO doesn't create its own database connection. Instead, index.js creates the connection and injects it into the DAO. Why?

- **One connection, shared everywhere**

  Database connections are expensive. You don't want to each DAO creating its own connection. Instead, you create one connection in `index.js` and inject it into the DAO. This way, all DAOs share the same connection.

- **The DAO doesn't need to know connection details**

  It doesn't know the URI, the password, or how to connect. It just receives a working connection. This is called **Dependency Injection**, give a module what it needs instead of letting it fetch it itself.

## What is indexing in MongoDB?

Indexing in MongoDB is a way to improve the performance of database queries. An index is a data structure that allows MongoDB to quickly locate and retrieve specific documents in a collection.

Indexing in MongoDB works by creating and maintaining a separate data structure that contains references to the documents in a collection based on the indexed fields.

## What is ObjectId in MongoDB?

Every document in MongoDB has an `_id` field. By default, MongoDB generates this as an **ObjectId**, a special 12-byte identifier that looks something like `507f1f77bcf86cd799439011`.

The thing is, when we receive an `id` from the frontend (like from a URL or request body), it comes as a **string**. But MongoDB stores it as an **ObjectId**. They're not the same type. So if you try to query with just the string, MongoDB won't find anything.

That's why we do:

```javascript
const ObjectId = mongodb.ObjectId;
// later...
_id: new ObjectId(id) // converts the string to an actual ObjectId
```

Without this conversion, your queries would silently return no results and you'd be confused why.

## What are route parameters?

When you define a route like `/id/:id`, the `:id` part is a **route parameter**. Express will extract whatever value comes in that position of the URL.

So if someone hits `/api/v1/movies/id/507f1f77bcf86cd799439011`, Express puts `507f1f77bcf86cd799439011` into `req.params.id`.

Why `/id/:id` and not just `/:id`? Because without the `/id/` prefix, a request to `/api/v1/movies/ratings` could accidentally match `/:id` and Express would think `id = "ratings"`. The prefix makes the route unambiguous.

## What is MongoDB Aggregation Pipeline?

For simple queries, we use `find()`. But sometimes you need to do more complex operations like finding a movie and also pulling its reviews from another collection.

That's where **aggregation pipeline** comes in. Its basically a series of stages, where each stage transforms the data and passes it to the next stage.

```javascript
movies.aggregate([
  { $match: { _id: new ObjectId(id) } }, // Stage 1: find the movie
  { $lookup: { // Stage 2: attach its reviews
      from: "reviews",
      localField: "_id",
      foreignField: "movie_id",
      as: "reviews"
  }}
])
```

Think of it like a factory assembly line, where data goes through one stage, gets transformed, then moves to the next.

### What is `$lookup`?

MongoDB is **NoSQL**, it doesn't have **JOINs** like SQL databases. But sometimes you need related data from another collection. `$lookup` is MongoDB's way of doing a JOIN.

`$lookup` says: Go to the `reviews` collection, find all documents where `movie_id` matches this movie's `_id`, and put them in an array called `reviews`.

So instead of making two separate database calls (one for the movie, one for its reviews), we get everything in **one call**. Fewer round trips to the database result in better performance.

### `.next()` and `.toArray()`

- `.toArray()`
    
    Converts ALL the results into an array. Use when you expect **multiple** results (like a list of movies).

- `.next()`

    Gives you just the **first** result. Use when you expect **one** result (like getting a movie by its id).

No point creating an array when you only want one document.

## What does `distinct()` do?

`distinct("rated")` tells MongoDB: Go through every document in this collection and give me all the **unique** values of the `rated` field.

It returns something like: `["G", "PG", "PG-13", "R", "NC-17", "UNRATED"]`

Why not just fetch all movies and extract ratings in JavaScript? Because that would mean downloading thousands of documents just to get 6 unique values. `distinct()` does this work at the **database level**, much faster and more efficient.

We use this to populate the ratings dropdown in the frontend without hardcoding the values. If the dataset changes, the dropdown updates automatically.

## `req.body` and `req.query`, when to use which?

- **`req.query`**
  
  Data from the URL query string. Like `?page=2&rated=PG`. Used for **GET** requests (reading/filtering data). This data is visible in the URL.

- **`req.body`**
  Data from the request body. Sent as JSON. Used for **POST, PUT, DELETE** requests (creating/modifying data). This data is NOT visible in the URL.

Why not use query strings for everything? Because query strings have **length limits** and are **visible in browser history, logs, etc**. If you're sending a review text or sensitive data, you don't want that in the URL.

That's also why we have `app.use(express.json())` in `server.js`, it tells Express to parse incoming JSON request bodies and put them in `req.body`.

## What is CRUD and which HTTP methods to use?

CRUD stands for **Create, Read, Update, Delete**, the four basic operations you can do with data.

In REST APIs, each operation maps to an HTTP method:

| Operation | HTTP Method | Example |
|-----------|-------------|---------|
| **C**reate | `POST` | Submit a new review |
| **R**ead | `GET` | Fetch list of movies |
| **U**pdate | `PUT` | Edit an existing review |
| **D**elete | `DELETE` | Remove a review |

These aren't random. REST says the HTTP method should tell you what's happening. So when you see `POST /api/v1/movies/reviews`, you immediately know a new review is being created without even looking at the code.

Also notice that all three (POST, PUT, DELETE) share the **same URL path** `/reviews`. The path identifies the **resource**, and the method identifies the **action**. That's why `router.route("/reviews")` lets you chain `.post()`, `.put()`, `.delete()`, the same path, different methods.

## How is ownership handled for reviews?

When someone tries to update or delete a review, how do we make sure they're the one who wrote it? Look at the query in the DAO:

```javascript
// update
{ user_id: userId, _id: new ObjectId(reviewId) }

// delete
{ _id: new ObjectId(reviewId), user_id: userId }
```

The query checks both the **review id** and the **user id**. So it says: Find a review with this id that **also** belongs to this user." If the user didn't write that review, the query finds nothing, `modifiedCount` or `deletedCount` will be `0`, and the controller throws an error.

This is called **ownership-based access control**. The idea is simple: **never trust the client**. Just because someone sends a review id doesn't mean they should be allowed to modify or delete it.

## Why does the Data Access Object throw errors and the controller catches them?

You'll notice two different error handling patterns:

```javascript
// In the Data Access Object:
catch (e) {
  console.error(`Unable to post review: ${e}`);
  throw e;  // throws the error UP
}

// In the Controller:
catch (e) {
  res.status(500).json({ error: e.message });  // sends HTTP response
}
```

The **Data Access Object** only knows about database stuff. It doesn't know what `res` is or what HTTP status codes are. So it logs the error and re-throws it, letting someone else deal with it.

The controller is the one who knows about HTTP. It catches the error and translates it into a proper response with a status code.

Each layer handles errors at **its own level**. The Data Access Object says: **something went wrong with the database**, the controller says: **let me tell the client about it in a way they understand**.
