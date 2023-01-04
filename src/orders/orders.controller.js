const path = require("path");
// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function list(req, res) {
    res.json({ data: orders });
}

function bodyDataHas(propertyName) {
    return function(req, res, next) {
        const { data = {} } = req.body;
        if(data[propertyName]) {
            return next();
        }
        next({ status: 400, message: `Order must include a ${propertyName}`});
    };
}
function create(req, res) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const newOrder = {
        id: `${nextId}`,
        deliverTo,
        mobileNumber,
        status,
        dishes
    };
    //still missing dish quanitity property
    orders.push(newOrder);
    res.status(201).json({ data: newOrder});
}

function dishPropertyIsValid(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    if (!dishes) {
        return next({ status: 400, message: "Order must include a dish"});
    }
    if(!Array.isArray(dishes) || dishes.length === 0) {
        return next({ status: 400, message: "Order must include at least one dish"});
    }
    next();
}

function dishQuantityIsValid(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    dishes.forEach((dish, index) => {
        if (!dish.quantity || dish.quantity <= 0 || !Number.isInteger(dish.quantity)) {
            return next({ status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0`});
        }
    });
    next();//this statement cannot go inside forEach() as it will 'create' any dish that does have a valid quantity, even if some other dish in the dishes array doesn't.
}

function statusIsValid(req, res, next) {
    //TODO: Implement logic for validating the status is either delivered, out-for-delivery, pending, preparing
}

module.exports = {
    list,
    create: [
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        dishPropertyIsValid,
        dishQuantityIsValid,
        create
    ],
}