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
    // await client.connect();


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

    // app.get('/myToys/:email', async (req, res) => {
    //   const email = req.params.email
    //   console.log(email);
    //   const result = await carCollection.find({ seller_email: email }).toArray();
    //   res.send(result)
    // })


    app.get('/myToys', async (req, res) => {
      let index = 1;
      const order = req.query.order
      const email = req.query.email
      console.log(req.query, 'here');
      if (order !== 'ascending') {
        index = -1
      }
      console.log(order);
      if (order !== undefined) {
        const result = await carCollection.find({ seller_email: email }).sort({ price: index }).toArray();
        res.send(result)
      }
      else {
        const result = await carCollection.find({ seller_email: email }).toArray();
        res.send(result)
      }

    })


    app.get('/carDetails/:id', async (req, res) => {
      const id = new ObjectId(req.params.id)
      console.log(id, 'this is id');
      const result = await carCollection.findOne({ _id: id })
      res.send(result)
    })

    app.post("/addCar", async (req, res) => {
      const body = req.body;
      body.createdAt = new Date();
      console.log(body);
      const result = await carCollection.insertOne(body);
      if (result?.insertedId) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({
          message: "Addition unsuccessful!",
          status: false,
        });
      }
    });


    app.delete('/allCars/:id', async (req, res) => {
      const id = new ObjectId(req.params.id)
      const result = await carCollection.deleteOne({ _id: id });
      res.send(result)

    })


    app.put('/updateToy/:id', async (req, res) => {
      const id = new ObjectId(req.params.id)
      const updatedInfo = req.body;
      console.log(updatedInfo);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          name: updatedInfo.name,
          photo_url: updatedInfo.photo_url,
          category: updatedInfo.category,
          price: updatedInfo.price,
          rating: updatedInfo.rating,
          seller_email: updatedInfo.seller_email,
          seller_name: updatedInfo.seller_name,
          description: updatedInfo.description,
          quantity: updatedInfo.quantity,
        },
      };
      const result = await carCollection.updateOne(filter, updateDoc);
      res.send(result);

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