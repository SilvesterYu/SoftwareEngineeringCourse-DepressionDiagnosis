const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const Account = mongoose.model("Account");

/**
 * The function starts an authenticated session by regenerating the session and setting the user object
 * in the session.
 * @param req - The `req` parameter is an object that represents the HTTP request received by the
 * server. It contains information about the request, such as the request method, headers, URL, and any
 * data sent in the request body.
 * @param user - The `user` parameter is an object that represents the authenticated user. It 
 * contains information such as the user's ID, email, and any other relevant data associated
 * with the user's account. This object is used to set the `user` property on the `req.session` object,
 * @param cb - "cb" stands for "callback" and it is a function that will be called once the session
 * regeneration is complete.
 */
const startAuthenticatedSession = (req, user, cb) => {
  req.session.regenerate((err) => {
    if (!err) req.session.user = user;
    else console.log(err);
    cb(err);
  });
};

/**
 * The function ends an authenticated session by destroying the session object and calling a callback
 * function.
 * @param req - The `req` parameter is an object that represents the HTTP request made by the client to
 * the server. 
 * @param cb - "cb" stands for "callback" and the purpose of this callback function is to handle any errors that may
 * occur during the destruction of the session. Once the session is destroyed, the callback function is
 * called with the error.
 */
const endAuthenticatedSession = (req, cb) => {
  req.session.destroy((err) => {
    cb(err);
  });
};

/**
 * The function registers a new user account with client-side form validation and checks if the email
 * is already registered before saving the account details.
 * @param name - The name of the user registering for an account.
 * @param password - The password parameter is a string that represents the password that the user
 * wants to use for their account. It will be hashed using bcrypt before being stored in the database
 * for security purposes.
 * @param email - The email parameter is a string that represents the email address of the user who is
 * trying to register.
 * @param errorCallback - A function that will be called if there is an error during the registration
 * process. It takes an object with a "message" property as its parameter, which describes the error
 * that occurred.
 * @param successCallback - successCallback is a function that will be called if the registration
 * process is successful. It takes one argument, which is the saved account object.
 */
const register = async (
  name,
  password,
  email,
  errorCallback,
  successCallback
) => {
  // client-side form validation
  try {
    const user = await Account.findOne({ email });
    if (user) {
      errorCallback({ message: "EMAIL IS ALREADY REGISTERED" });
    } else {
      bcrypt.hash(password, 10, async function (err, hash) {
        if (err) {
          console.log(err);
          errorCallback({ message: "PASSWORD ERROR" });
        } else {
          const account = new Account({
            name,
            password: hash,
            email,
          });
          try {
            const savedAccount = await account.save();
            if (savedAccount) successCallback(savedAccount);
          } catch (error) {
            errorCallback({ message: "DOCUMENT SAVE ERROR" });
          }
        }
      });
    }
  } catch (error) {
    errorCallback({ message: "EMAIL ERROR" });
  }
};

/**
 * This is a login function that checks if a user exists and if their password matches the one
 * provided, and then either calls a success or error callback function.
 * @param email - The email entered by the user trying to log in.
 * @param password - The password parameter is a string representing the password entered by the user
 * during the login process.
 * @param errorCallback - The errorCallback is a function that will be called if there is an error
 * during the login process. It takes an object with a message property as its parameter.
 * @param successCallback - successCallback is a function that will be called if the login process is
 * successful. It takes the user object as an argument.
 */
const login = async (email, password, errorCallback, successCallback) => {
  const user = await Account.findOne({ email });
  if (!user) errorCallback({ message: "USER NOT FOUND" });
  else {
    bcrypt.compare(password, user.password, (err, passwordMatch) => {
      // regenerate session if passwordMatch is true
      if (err) errorCallback({ message: "PASSWORD ERROR" });
      else if (passwordMatch) successCallback(user);
      else errorCallback({ message: "PASSWORDS DO NOT MATCH" });
    });
  }
};

/**
 * This is a middleware function that checks if the requested path requires authentication and
 * redirects to the login page if the user is not authenticated.
 * @param authRequiredPaths - `authRequiredPaths` is an array of paths that require authentication. The
 * middleware function returned by `authRequired` checks if the current request path is included in
 * this array. If it is, it checks if the user is authenticated by checking if `req.session.user`
 * exists.
 * @returns The `authRequired` function returns another function that takes three parameters: `req`,
 * `res`, and `next`. This returned function checks if the `req.path` is included in the
 * `authRequiredPaths` array. 
 */
const authRequired = (authRequiredPaths) => {
  return (req, res, next) => {
    if (authRequiredPaths.includes(req.path)) {
      if (!req.session.user) {
        res.redirect("./index.html");
      } else {
        next();
      }
    } else {
      next();
    }
  };
};

module.exports = {
  startAuthenticatedSession,
  endAuthenticatedSession,
  register,
  login,
  authRequired,
};
