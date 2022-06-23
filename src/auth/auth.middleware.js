require("dotenv").config();
const jwt = require("jsonwebtoken");
const { findByIdUserService } = require("../users/users.service");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "O token não foi informado!" });
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2) {
    return res.status(401).send({ message: "Token inválido!" });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).send({ message: "Token mal formatado!" });
  }

  jwt.verify(token, process.env.SECRET, async (err, decoded) => {
    const user = await findByIdUserService(decoded.id);

    if (err || !user || !user.id) {
      return res.status(401).send({ message: "Token inválido!" });
    }

    req.userId = user.id;

    return next();
  });
};
