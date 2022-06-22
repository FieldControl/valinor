const createUserController = async (req, res) => {
    res.send({message: "create teste ok"})
};
const findAllUserController = async (req, res) => {
    res.send({message: "find all teste ok"})
};

module.exports = {
    createUserController,
    findAllUserController,
};
