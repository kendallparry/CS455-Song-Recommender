import express from 'express'; 
import path from 'path';
const app = express();              
const port = 3000;        
import { MongoClient, ServerApiVersion } from 'mongodb';
import { fileURLToPath } from 'url';
const uri = "mongodb+srv://genericUser:5a1Vu2qe3f360L4F@spotifysongreccluster.fexy1.mongodb.net/?retryWrites=true&w=majority&appName=SpotifySongRecCluster";          

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
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
    await client.connect();

    // Creating names for our attributes collections
    const database = client.db('spotify_songs');
    const tracks = database.collection('track');
    const attributes = database.collection('attributes');

    // finding the correct song given a title and artist
    const songInfo = await tracks.findOne({
      track_name: { $regex: songTitle, $options: 'i'},
      track_artist: { $regex: songArtist, $options: 'i'},
    });

    // pulling out just the track_id from the given song
    const songID = songInfo.track_id;

    // finding associated vector using songID
    const searchSong = await attributes.findOne({
      track_id: songID
    });
    const searchVector = searchSong.attributes;

    // using vectorSearch to find the 10 most similar songs to our given song
    const songList = attributes.aggregate([
      {
          $vectorSearch: {
              index: 'vectorSearch',
              limit : 11,
              numCandidates: 10000,
              path : 'attributes',
              queryVector : searchVector
          }
      },
      {
          $project: {
              _id: 0,
              track_id: 1 // only keep the track_id for each song
          }
      }
  ]);

    // getting the songIDs for each of the 10 songs
    const songListArray = await songList.toArray();
    const songStringIDs = [];
    for (let i = 1; i < songListArray.length; i++){
      songStringIDs.push(songListArray[i].track_id);
    }

    // getting the title and artist for each of the 10 songs
    const finalSongInfo = [];
    for (let i = 0; i < songStringIDs.length; i++) {
      const str = "";
      const songStringInfo = await tracks.findOne({
        track_id : songStringIDs[i]
      });
      const newStr = str.concat(songStringInfo.track_name, " - ", songStringInfo.track_artist);
      finalSongInfo.push(newStr);
    }

    return finalSongInfo;
    
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render('home');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});