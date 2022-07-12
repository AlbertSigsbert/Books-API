const express = require("express");
const { connectToDb, getDb } = require("./db");
const { ObjectId } = require("mongodb");

//Init app & Middleware
const app = express();
app.use(express.json());

let db;

//Connect to DB
connectToDb((err) => {
  if (!err) {
    app.listen(3000, (req, res) => {
      console.log("Listening requests on port 3000");
    });

    db = getDb();
  }
});

//routes
app.get("/books", (req, res) => {
  const page = req.query.page || 0;

  const booksPerPage = 3;

  let books = [];

  db.collection("books")
    .find()
    .sort({ author: 1 })
    .skip(page * booksPerPage)
    .limit(booksPerPage)
    .forEach((book) => books.push(book))
    .then(() => {
      res.status(200).json(books);
    })
    .catch((err) => {
      res.status(500).json({ error: "Could NOT fetch documents" });
    });
});

app.get("/books/:id", (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    db.collection("books")
      .findOne({ _id: ObjectId(req.params.id) })
      .then((doc) => {
        res.status(200).json(doc);
      })
      .catch((err) => {
        res.status(500).json({ error: "Could NOT fetch document" });
      });
  } else {
    res.status(500).json({ error: "Not a Valid document ID" });
  }
});

app.post("/books", (req, res) => {
  const book = req.body;
  db.collection("books")
    .insertOne(book)
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((err) => {
      res.status(500).json({ error: "Could NOT insert a doc" });
    });
});

app.delete("/books/:id", (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    db.collection("books")
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => res.status(500).json({ err: "Could not delete doc" }));
  } else {
    res.status(500).json({ err: "Invalid document Id" });
  }
});

app.patch("/books/:id", (req, res) => {
  const updates = req.body;

  if (ObjectId.isValid(req.params.id)) {
    db.collection("books")
      .updateOne({ _id: ObjectId(req.params.id) }, { $set: updates })
      .then((result) => res.status(200).json(result))
      .catch((err) => res.status(500).json({ err: "Could Not delete Doc" }));
  } else {
    res.status(500).json({ err: "Invalid doc id" });
  }
});
