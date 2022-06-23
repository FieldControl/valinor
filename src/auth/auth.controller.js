const authService = require("./auth.service");

const loginController = async (req, res) => {
  res.send({message: "login ok"});
};

module.exports = { loginController };
