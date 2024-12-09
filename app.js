const express = require('express'); 
const path = require('path');
const app = express();              
const port = 3000;        
const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://genericUser:5a1Vu2qe3f360L4F@spotifysongreccluster.fexy1.mongodb.net/?retryWrites=true&w=majority&appName=SpotifySongRecCluster";          

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri);


// Replace the uri string with your connection string.
async function run(songTitle, songArtist) {
  try {
    const database = client.db('spotify_songs');
    const tracks = database.collection('track');
    // Query for a movie that has the title 'Back to the Future'
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
    return songID.toArray();
    

  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

