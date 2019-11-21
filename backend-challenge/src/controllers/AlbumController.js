import * as Yup from 'yup';
import { ObjectId } from 'mongodb';

import Album from '../models/Album';

class AlbumController {
  async index(req, res) {
    const { page = 1, author, min_year, max_year } = req.query;

    const album = await Album.find({
      author,
      launch_year: { $gte: min_year, $lte: max_year },
    })
      .skip((page - 1) * 10)
      .limit(10)
      .sort('launch_year');

    return res.json({ album });
  }

  async view(req, res) {
    const id = ObjectId(req.params.id);

    const album = await Album.findById({ _id: id });

    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }

    return res.json({ album });
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      author: Yup.string().required(),
      title: Yup.string().required(),
      launch_year: Yup.number()
        .required()
        .integer()
        .positive(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { filename } = req.file;
    const { author, title, launch_year } = req.body;

    const albumExists = await Album.findOne({ author, title });

    if (albumExists) {
      return res.status(400).json({ error: 'Album already exists' });
    }

    const album = await Album.create({
      folder: filename,
      author,
      title,
      launch_year,
    });

    return res.status(201).json({ album });
  }

  async updatePartial(req, res) {
    const schema = Yup.object().shape({
      author: Yup.string(),
      title: Yup.string(),
      launch_year: Yup.number()
        .integer()
        .positive(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const id = ObjectId(req.params.id);
    const { filename } = req.file;
    const { author, title, launch_year } = req.body;

    const album = await Album.findById({ _id: id });
    
    if (!album) {
      return res.status(404).json('Album not found');
    }

    if (author !== album.author || title !== album.title) {
      const albumExists = await Album.findOne({ author, title });

      if (albumExists) {
        return res.status(400).json({ error: 'Album already exists' });
      }
    }

    await Album.updateOne(
      { _id: id },
      { folder: filename, author, title, launch_year },
      { omitUndefined: true }
    );

    const updatedAlbum = await Album.findById({ _id: id });

    return res.json({ updatedAlbum });
  }

  async updateAll(req, res) {
    const schema = Yup.object().shape({
      author: Yup.string().required(),
      title: Yup.string().required(),
      launch_year: Yup.number()
        .integer()
        .positive()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const id = ObjectId(req.params.id);
    const { filename } = req.file;
    const { author, title, launch_year } = req.body;

    const album = await Album.findById({ _id: id });
    
    if (!album) {
      return res.status(404).json('Album not found');
    }

    if (author !== album.author || title !== album.title) {
      const albumExists = await Album.findOne({ author, title });

      if (albumExists) {
        return res.status(400).json({ error: 'Album already exists' });
      }
    }

    await Album.updateOne(
      { _id: id },
      { folder: filename, author, title, launch_year }
    );

    const updatedAlbum = await Album.findById({ _id: id });

    return res.json({ updatedAlbum });
  }

  async delete(req, res) {
    const id = ObjectId(req.params.id);

    const album = await Album.findById({ _id: id });

    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }

    await Album.deleteOne({ _id: id });

    return res.json({ message: 'Album deleted' });
  }
}

export default new AlbumController();
