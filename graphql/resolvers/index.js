const bcrypt = require('bcrypt');

const Event = require('../../models/event');
const User = require('../../models/user');

const getUser = async (userId) => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      password: null,
      createdEvents: getEvents.bind(this, user._doc.createdEvents)
    };
  } catch (err) {
    console.log('Error while getting user: ', err);
    throw err;
  }
}

const getEvents = async (eventIds) => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    return events.map((e) => {
      return {
        ...e._doc,
        date: new Date(e._doc.date).toISOString(),
        creator: getUser.bind(this, e.creator)
      };
    });
  } catch (err) {
    console.log('Error while getting events: ', err);
    throw err;
  }
}


module.exports = {
  events: () => {
    return Event
      .find()
      .then((events) => {
        return events.map((e) => {
          return {
            ...e._doc,
            date: new Date(e._doc.date).toISOString(),
            creator: getUser.bind(this, e._doc.creator)
          };
        });
      })
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
      return {
        ...eventCreated._doc,
        date: new Date(eventCreated._doc.date).toISOString()
      };
    } catch (err) {
      console.log('Error while creating event: ', err);
      throw err;
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
      throw err;
    }
  }
}