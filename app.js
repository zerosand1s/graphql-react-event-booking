const express = require('express');
const bodyParser = require('body-parser');
const expressGraphql = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Event = require('./models/event');
const User = require('./models/user');

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

      type User {
        _id: ID!
        email: String!
        password: String
      }

      input UserInput {
        email: String!
        password: String!
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
        createUser(userInput: UserInput): User
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
      createEvent: async (args) => {
        try {

          const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: '5d6b81bfb7f5453b06154811'
          });

          const eventCreated = await event.save();
          const user = await User.findById('5d6b81bfb7f5453b06154811');

          user.createdEvents.push(event);
          await user.save();
          console.log('Event saved: ', eventCreated);
          return eventCreated._doc;

        } catch (err) {
          console.log('Error while creating event: ', err);
          return err;
        }
      },
      createUser: async (args) => {
        try {

          const existingUser = await User.findOne({ email: args.userInput.email });

          if (existingUser) {
            throw new Error('User exists already');
          }

          const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

          const user = new User({
            email: args.userInput.email,
            password: hashedPassword
          });

          const userCreated = await user.save();
          console.log('User saved: ', user);
          return { ...userCreated._doc, password: null };

        } catch (err) {
          console.log('Error while creating user: ', err);
          return err;
        }
      }
    },
    graphiql: true
  })
);