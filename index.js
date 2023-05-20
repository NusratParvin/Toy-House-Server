const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
  res.send('Toy House server is running')
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.comdjom.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const carCollection = client.db('toyCars').collection('carCollection')

    app.get('/allCars', async (req, res) => {
      const result = await carCollection.find().limit(20).toArray()
      console.log(result);
      res.send(result)
    })

    app.get('/allCars/:category', async (req, res) => {
      const category_name = req.params.category
      // console.log(category_name);
      const result = await carCollection.find({ category: category_name }).toArray()
      res.send(result)
    })
    app.get('/cars/:byName', async (req, res) => {
      const byName = req.params.byName
      console.log(byName);

      const result = await carCollection.find({ name: { $regex: byName, $options: "i" } }).toArray();
      res.send(result)


    })
    app.get('/carDetails/:id', async (req, res) => {
      const id = new ObjectId(req.params.id)
      console.log(id, 'this is id');
      const result = await carCollection.findOne({ _id: id })
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, () => {
  console.log(`Toy House is running on port ${port}`);
})