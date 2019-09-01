const express = require('express');
const bodyParser = require('body-parser');
const expressGraphql = require('express-graphql');
const mongoose = require('mongoose');
const app = express();

const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');

mongoose
  .connect('mongodb://localhost/graph-react-events', { useNewUrlParser: true })
  .then(() => {
    console.log('Database connection successful.');
    app.listen(3000);
  })
  .catch(err => console.log('Error while connecting to database: ', err));

app.use(bodyParser.json());


app.use('/graphql',
  expressGraphql({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true
  })
);