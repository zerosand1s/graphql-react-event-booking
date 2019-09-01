### Event Booking App

Start the app using
  `npm start`

Example GraphQL queries:

1) To query all events

    ```
    query {
      events {
        _id
        title
        date
        creator {
          email
          createdEvents {
            title
            creator {
              email
            }
          }
        }
      }
    }
    ```

  2) To create event

    ```
    mutation {
      createEvent(eventInput: {title: "Another event", description: "Just another event", price: 49.99, date: "2019-09-03T17:00:27.188Z"}) {
        title
        price
        description
      }
    }
    ```

  3) To create user

    ```
    mutation {
      createUser(userInput: {email: "test1@test.com", password: "abcd"}) {
        email
        password
      }
    }
    ```