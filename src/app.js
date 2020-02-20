require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const uuid = require('uuid/v4');

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello, boilerplate!');
});

let contacts = [];
//* Create a GET route on /address that fetches all addresses
app.get('/address', (req, res) => {
  let response = contacts.map(contact => {
    return contact.address1;
  });
  res
    .status(200)
    .send(response);
});

//* Add Bearer Token Authorization middleware on ONLY the POST/DELETE routes
function validateBearerToken(req, res, next) {
  const authToken = req.get('Authorization');
  const apiToken = process.env.API_TOKEN;
  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    res
      .status(401)
      .json({error: 'Unauthorized Request'});
  }
  next();
}

//* Create a POST route on /address that creates a new address
app.post('/address', validateBearerToken, (req, res)=>{
  const { firstName, lastName, address1, address2, city, state, zip } = req.query;
  //* ALL fields except address2 are required
  if(!firstName){
    res.status(400).send('firstname is required');
  }
  if(!lastName){
    res.status(400).send('lastName is required');
  }
  if(!address1){
    res.status(400).send('address1 is required');
  }
  if(!city){
    res.status(400).send('city is required');
  }
  if(!state){
    res.status(400).send('state is required');
  }
  if(!zip){
    res.status(400).send('zip is required');
  }
  //* state must be exactly two characters
  if(state.length !==2  || !isNaN(state)){
    res.status(400).send('must be exactly two letters');
  }
  //* zip must be exactly a five-digit number
  if(zip.length !== 5 || isNaN(zip)){
    res.status(400).send('must be exactly a five-digit number');
  }

  //* id is auto generated
  const id = uuid();
  const newAddress ={
    id,
    firstName,
    lastName,
    address1,
    address2,
    city,
    state,
    zip
  };
   
  contacts.push(newAddress);

  res.status(200).send(contacts);
});

//* Create a DELETE route on /address/:id
app.delete('/address/:id', validateBearerToken, (req, res)=>{
  const { id }= req.params;
  const index = contacts.findIndex( item => item.id === id);
  if(index === -1){
    return res.status(400).send('address not found');
  }

  contacts.splice(index, 1);
   
  res.status(204).end();
});

// eslint-disable-next-line no-unused-vars
app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = {error: {message: 'server error'}};
  } else {
    // eslint-disable-next-line no-console
    console.log(error);
    response = {message: error.message, error};
  }
  res.status(500).json(response);
});

module.exports = app;