const { User } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, { userId }) => {
      return User.findOne({ _id: userId });
    },
  },
  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);

      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("No profile with this email found!");
      }
      console.log(user);
      // const correctPw = await user.isCorrectPassword(password);

      // if (!correctPw) {
      //     throw new AuthenticationError('Incorrect password!');
      //   }
      const passwordOk = await User.findByCredentials(email, password);
      if (!passwordOk) {
        return done(null, false, { message: "Invalid username or password" });
      }

      const token = signToken(user);

      return { token, user };
    },
    // saveBook: async (
    //   parent,
    //   { userId, author, description, title, bookId, image, link }
    // ) => {
    //   return User.findOneAndUpdate(
    //     { _id: userId },
    //     {
    //       $addToSet: {
    //         authors: author,
    //         description: description,
    //         title: title,
    //         bookId: bookId,
    //         image: image,
    //         link: link,
    //       },
    //     },
    //     {
    //       new: true,
    //       runValidators: true,
    //     }
    //   );
    // },
          saveBook: async (parent, { input }, context) => {
          console.log(input, context)
          console.log('my string')
                 if (context.user) {
                     const updatedUser = await User.findOneAndUpdate(
                         { _id: context.user._id },
                         { $addToSet: { savedBooks: input } },
                         { new: true }
                     ).populate('savedBooks');
     
                     return updatedUser;
                 }
     
                 throw new AuthenticationError('You need to be logged in!');
             },
    removeBook: async (parent, { bookId }) => {
      return User.findOneAndDelete({ _id: bookId });
    },
  },
};
module.exports = resolvers;
