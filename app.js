const express = require('express'); 
const path = require('path');
const app = express();              
const port = 3000;        
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://genericUser:5a1Vu2qe3f360L4F@spotifysongreccluster.fexy1.mongodb.net/?retryWrites=true&w=majority&appName=SpotifySongRecCluster";   

const cors = require('cors');
app.use(cors());  // Enable CORS for all routes

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


app.get('/fetch', async (req, res) => {
  const { title, artist } = req.query;  // Fetch title and artist from the query params
  
  try {
    const songData = await run(title, artist);  // Call the run function with title and artist
    res.json(songData);  // Return the song data as JSON
  } catch (error) {
    console.error('Error fetching song data:', error);
    res.status(500).json({ message: 'Error fetching song data.' });
  }
});


async function run(songTitle, songArtist) {
  try {
    const database = client.db('spotify_songs');
    const tracks = database.collection('track');

    //const query = { track_name: "I Don't Care (with Justin Bieber) - Loud Luxury Remix" }, { track_artist: "Ed Sheeran"};
    const songID = await tracks.find({
      track_name: songTitle,
      track_artist: songArtist,
    },
    {
      track_id: 1
    });
    for await (const doc of songID) {
      console.log(doc);
  }
    return songID.toString()
    

  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render('home');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


