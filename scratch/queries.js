'use strict';

const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

mongoose.connect(MONGODB_URI)
  .then(() => {
    const searchTerm = 'Lady Gaga';
    let filter = {};

    if (searchTerm) {
      filter.title = { $regex: searchTerm, $options:'i' };
    }

    return Note.find(filter).sort({ updatedAt: 'desc' });
  })
  .then(results => {
    console.log(results);
  })
//Find by ID
// return Note.findById('000000000000000000000005')
//   .then(results => {
//     if(results){
//       console.log(results);
//     }else {
//       console.log('no note with that ID');
//     }
//   })

// const newNote = {
//   title: 'Shia is my dog',
//   content: 'He is a husky'
// };

// return Note.create(newNote)
//   .then(results => {
//     console.log(results);
//   })

//Update by ID
const updatedNote = {
  title: 'Duke is my other dog',
  content: 'He is a bulldog'
};

return Note.findByIdAndUpdate('5b732f1cb8f7dc3598243f6c', updatedNote, {new: true}
)
  .then(results => {
    if(results){
      console.log(results);
    } else {
      console.log('cant find that note');
    }
  })

//Remove by ID
// return Note.findByIdAndRemove('5b732f1cb8f7dc3598243f6c')
//   .then(results => {
//     console.log('removed', results);
//   })
  
  .then(() => {
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });