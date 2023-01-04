const { Stats } = require("fs");
const path = require("path");
// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function list(req, res) {
    res.json({ data: orders });
}

function read(req, res) {
    res.json({ data: res.locals.order });
}

function orderExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);
    if (foundOrder) {
        res.locals.order = foundOrder;
        next();
    }
    next({ status: 404, message: `Order does not exist: ${orderId}`});
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

function update(req, res) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    res.locals.order.deliverTo = deliverTo;
    res.locals.order.mobileNumber = mobileNumber;
    res.locals.order.status = status;
    res.locals.order.dishes = dishes;
    res.json({ data: res.locals.order });
}

function statusIsValid(req, res, next) {
    const { data: { status } = {} } = req.body;
    const possibleStatus = ["delivered", "out-for-delivery", "pending", "preparing"];
    if (!status || status.length === 0 || !possibleStatus.includes(status)) {
        return next({ status: 400, message: "Order must have a status of pending, preparing, out-for-delivery, delivered" });
    }
    if (status === "delivered") {
        return next({ status: 400, message: "A delivered order cannot be changed"});
    }
    next();
}

function idPropertyIsValid(req, res, next) {
    const { orderId } = req.params;
    const { data: { id } = {} } = req.body;
    if (id && id === orderId || !id) {
        return next();
    }
    next({ status: 400, message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`});
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
    read: [orderExists, read],
    update: [
        orderExists,
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("status"),
        dishPropertyIsValid,
        dishQuantityIsValid,
        idPropertyIsValid,
        statusIsValid,
        update
    ],
}

//NEED TO WORK ON 'PUT' request for path '/orders/:orderId'