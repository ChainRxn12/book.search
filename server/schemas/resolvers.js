const { User } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        console.log("context.user", context.user);
        const userData = await User.findOne({ _id: context.user._id }).select(
          "-__v -password"
        );
        console.log("me on the server side", userData);
        return userData;
      }

      throw new AuthenticationError("Not logged in");
    },
  },
  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);

      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("No profile with this email found!");
      }

      const passwordOk = await User.findByCredentials(email, password);
      if (!passwordOk) {
        return done(null, false, { message: "Invalid username or password" });
      }

      const token = signToken(user);

      return { token, user };
    },

    saveBook: async (parent, { input }, context) => {
      console.log(input, context);
      console.log("my string");
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: input } },
          { new: true }
        ).populate("savedBooks");

        return updatedUser;
      }

      throw new AuthenticationError("You need to be logged in!");
    },
    removeBook: async (parent, args, context) => {
      console.log(args, context.user);
      return User.findOneAndUpdate(
        { _id: context.user._id },
        { $pull: {savedBooks: { bookId: args.bookId}} },
        { new: true }
      )
    },
  },
};
module.exports = resolvers;
