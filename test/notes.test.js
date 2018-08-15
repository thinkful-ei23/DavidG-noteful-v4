'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');

const seedNotes = require('../db/seed/notes');

const expect = chai.expect;
chai.use(chaiHttp);

describe ('Noteful API - Notes', function(){
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });
    
  beforeEach(function () {
    return Note.insertMany(seedNotes);
  });
    
  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });
    
  after(function () {
    return mongoose.disconnect();
  });
});

describe('POST /api/notes', function () {
  it('should create and return a new item when provided valid data', function () {
    const newItem = {
      'title': 'The best article about cats ever!',
      'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...'
    };

    let res;    
    return chai.request(app)
      .post('/api/notes')
      .send(newItem)
      .then(function (_res) {
        res = _res;
        expect(res).to.have.status(201);
        expect(res).to.have.header('location');
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');
        return Note.findById(res.body.id);
      })
      .then(data => {
        expect(res.body.id).to.equal(data.id);
        expect(res.body.title).to.equal(data.title);
        expect(res.body.content).to.equal(data.content);
        expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
        expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
      });
  });

  it('should return an error when missing "title"', function () {
    const newItem = {
      'content' : 'Some blank nonsense to run in the test'
    };
    return chai.request(app)
      .post('/api/notes')
      .send(newItem)
      .then(res => {
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body.message).to.equal('Missing `title` in body');
      });
  });
});

describe('GET /api/notes/:id', function () {
  it('should return correct note', function () {
    let data;
    return Note.findOne()
      .then(_data => {
        data = _data;
        return chai.request(app).get(`/api/notes/${data.id}`);
      })
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');
        expect(res.body.id).to.equal(data.id);
        expect(res.body.title).to.equal(data.title);
        expect(res.body.content).to.equal(data.content);
        expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
        expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
      });
  });

  it('should return with a status of 404 for an ID that doesnt exist', function() {
    return chai.request(app)
      .get('/api/notes/DOESNOTEXIST')
      .then(res => {
        expect(res).to.have.status(404);
      });
  });
});

describe('GET /api/notes', function () {
  return Promise.all([
    Note.find(),
    chai.request(app).get('/api/notes')
  ])
    .then(([data, res]) => {
      expect(res).to.have.status(200);
      expect(res).to.be.json;
      expect(res.body).to.be.a('array');
      expect(res.body).to.have.length(data.length);
    });
});

describe('PUT /api/notes/:id', function(){
  it('should update the note with the provided valid data', function () {
    const updatedItem = {
      'title': 'My dogs name is Shia',
      'content': 'He is a Husky'
    };
    let data;
    return Note.findOne()
      .then(_data => {
        data = _data;
        // 2) then call the API with the ID
        return chai.request(app).put(`/api/notes/${data.id}`)
          .send(updatedItem);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');
        expect(res.body.id).to.equal(data.id);
        expect(res.body.title).to.equal(data.title);
        expect(res.body.content).to.equal(data.content);
        expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
        expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
      });
  });
  it('should return with a status of 404 for an ID that doesnt exist', function() {
    return chai.request(app)
      .get('/api/notes/DOESNOTEXIST')
      .then(res => {
        expect(res).to.have.status(404);
      });
  });
  it('should return an error when missing "title"', function () {
    const newItem = {
      'content' : 'Some blank nonsense to run in the test'
    };
    return chai.request(app)
      .post('/api/notes')
      .send(newItem)
      .then(res => {
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body.message).to.equal('Missing `title` in body');
      });
  });
});

describe ('DELETE /api/notes/:id', function() {
  it('should delete an existing note and come back with a 204 status', function () {
    let data;
    return Note.findOne()
      .then(_data => {
        data = _data;
        return chai.request(app).delete(`/api/notes/${data.id}`);
      })
      .then(function(res) {
        expect(res).to.have.status(204);
        return Note.count({ _id: data.id });
      })
      .then(count => {
        expect(count).to.equal(0);
      });
  });
});