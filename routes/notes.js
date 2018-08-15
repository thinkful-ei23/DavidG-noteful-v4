'use strict';

const express = require('express');
const mongoose = require('mongoose');
const Note = require('../models/note');
const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const {searchTerm} = req.query;
  let filter = {};

  if (searchTerm) {
    filter.title = { $regex: searchTerm, $options:'i' };
  }

  return Note.find(filter).sort({ updatedAt: 'desc' })
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const {id} = req.params;
  if(!mongoose.Types.ObjectId.isValid(id) ){
    const err = new Error('The Id doesnt exist');
    err.status = 400;
    return next(err);
  }
  return Note.findById(id)
    .then(results => {
      if(results){
        res.json(results);
      }else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const {title, content} = req.body;
  if (!title){
    const err = new Error('Missing Title');
    err.status = 400;
    return next(err);
  }

  const newNote = {title, content};
  return Note.create(newNote)
    .then(results => {
      res.location(`${req.originalUrl}/${results.id}`).status(201).json(results);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const {title, content} = req.body;
  const {id} = req.params;
  if (!title){
    const err = new Error('Missing Title');
    err.status = 400;
    return next(err);
  }
  if(!mongoose.Types.ObjectId.isValid(id) ){
    const err = new Error('The Id doesnt exist');
    err.status = 400;
    return next(err);
  }
  const updatedNote = {title, content};
  return Note.findByIdAndUpdate(id, updatedNote, {new: true}
  )
    .then(results => {
      if(results){
        res.json(results);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const {id} = req.params;
  if(!mongoose.Types.ObjectId.isValid(id) ){
    const err = new Error('The Id doesnt exist');
    err.status = 400;
    return next(err);
  }
  return Note.findByIdAndRemove(id)
    .then(() => {
      res.status(204).end();
    }).catch(err => {
      next(err);
    });
});



module.exports = router;