const express = require ('express');
// add ApolloServer
const { ApolloServer } = require('apollo-server-express');
// add middleware
const { authMiddleware } = require('./utils/auth');
// add typedefs, resolvers
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');
const path = require('path');

const PORt = process.env.PORT || 3001;
const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

// integrate our Apollo server with the Express application as middleware
server.applyMiddleware({ app });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    // log where we can go to test our GQL API
    console.log(`Use GraphQl at http://localhost:${PORT}${server.graphqlPath}`);
  });
});