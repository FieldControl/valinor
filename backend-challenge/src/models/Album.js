import mongoose from 'mongoose';

const AlbumSchema = new mongoose.Schema({
  folder: String,
  author: String,
  title: String,
  launch_year: Number,
});

export default mongoose.model('Album', AlbumSchema);
