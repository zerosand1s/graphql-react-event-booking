const express = require('express');
const bodyParser = require('body-parser');
const expressGraphql = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const Event = require('./models/event');

const app = express();

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
    schema: buildSchema(`
      type Event {
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!
      }

      input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!
      }

      type RootQuery {
        events: [Event!]!
      }

      type RootMutation {
        createEvent(eventInput: EventInput): Event
      }

      schema {
        query: RootQuery
        mutation: RootMutation
      }
    `),
    // resolvers
    rootValue: {
      events: () => {
        return Event
          .find()
          .then(events => events.map(e => e._doc))
          .catch((err) => {
            console.log('Error while fetching events: ', err);
            throw err;
          });
      },
      createEvent: (args) => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date)
        });

        return event
          .save()
          .then((result) => {
            console.log('Event saved: ', result);
            return result._doc;
          })
          .catch(err => {
            console.log('Error while creating event: ', err);
            throw err;
          });
      }
    },
    graphiql: true
  })
);