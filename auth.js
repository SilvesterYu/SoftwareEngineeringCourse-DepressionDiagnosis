const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const Account = mongoose.model("Account");

const startAuthenticatedSession = (req, user, cb) => {
  req.session.regenerate((err) => {
    if (!err) req.session.user = user;
    else console.log(err);
    cb(err);
  });
};

const endAuthenticatedSession = (req, cb) => {
  req.session.destroy((err) => {
    cb(err);
  });
};

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
            console.log(savedAccount)
            successCallback(savedAccount);
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

// creates middleware that redirects to login if path is included in authRequiredPaths
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
