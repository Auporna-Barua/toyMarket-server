const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());

// mongo-DB

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_ID}:${process.env.DB_PASS}@cluster0.ovwjs.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const carsCollection = client.db("car-world").collection("all-cars");
    // read all cars's data by api
    app.get("/allCars", async (req, res) => {
      const cars = carsCollection.find();
      const result = await cars.toArray();
      res.send(result);
    });

    // get single car data form allCarCollection
    app.get("/allCars/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carsCollection.findOne(query);
      res.send(result);
    });

    // all toy databaseCollection
    const allToyCollection = client
      .db("allToyDB")
      .collection("allToyCollection");
    // indexing for search functionality
    const indexKeys = { ToyName: 1 };
    const indexOptions = { name: "toyName" };

    const result = await allToyCollection.createIndex(indexKeys, indexOptions);
    app.get("/searchToy/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await allToyCollection
        .find({
          $or: [{ ToyName: { $regex: searchText, $options: "i" } }],
        })
        .toArray();
      res.send(result);
    });
    // insert add toy data
    app.post("/addToy", async (req, res) => {
      const toy = req.body;
      console.log(toy);
      const result = await allToyCollection.insertOne(toy);
      res.send(result);
    });
    // get all toy api
    app.get("/allToy", async (req, res) => {
      const cursor = allToyCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });
    // get specific toy by id...
    app.get("/allToy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allToyCollection.findOne(query);
      res.send(result);
    });
    // get specific user allData
    app.get("/myToys/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await allToyCollection
        .find({ seller: req.params.email })
        .toArray();
      res.send(result);
    });
    // get specific toy for update data
    app.get("/ToyDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allToyCollection.findOne(query);
      res.send(result);
    });

    // this is for testing need to remove when work done
    app.get("/", (req, res) => {
      res.send("the server is running");
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
