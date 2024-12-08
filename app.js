const express = require('express'); 
const path = require('path');
const app = express();              
const port = 3000;        
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://genericUser:5a1Vu2qe3f360L4F@spotifysongreccluster.fexy1.mongodb.net/?retryWrites=true&w=majority&appName=SpotifySongRecCluster";          

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
    // Connect the client to the server 
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render('home');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


