const methodNotAllowed = require("../errors/methodNotAllowed");
const controller = require("./orders.controller");
const router = require("express").Router();

// TODO: Implement the /orders routes needed to make the tests pass
router.route("/").get(controller.list).post(controller.create).all(methodNotAllowed);

module.exports = router;
