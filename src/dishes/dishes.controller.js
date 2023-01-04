const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res) {
    res.json({ data: dishes });
}

function bodyDataHas(propertyName) {
    return function(req, res, next) {
        const { data = {} } = req.body;
        if(data[propertyName]) {
            return next();
        }
        next({ status: 400, message: `Must include a ${propertyName}`});
    };
}

function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find(dish => dish.id === dishId);
    if (foundDish) {
        res.locals.dish = foundDish;
        return next();
    }
    next({ status: 404, message: `Dish does not exist: ${dishId}`});
}
function idPropertyIsValid(req, res, next) {
    const { data: { id } = {} } = req.body;
    const { dishId } = req.params;
    if (id && dishId === id || !id) {
        return next();
    }
    next({ status: 400, message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}` });
}
function pricePropertyIsValid(req, res, next) {
    const { data: { price } = {} } = req.body;
    if(price < 0 || !Number.isFinite(price)) {
        return next({ status: 400, message: `price must be a valid number`});
    }
    next();
}

function update(req, res) {
    const { data: { name, description, price, image_url } = {} } = req.body;
    res.locals.dish.name = name;
    res.locals.dish.description = description;
    res.locals.dish.price = price;
    res.locals.dish.image_url = image_url;
    res.json({ data: res.locals.dish });
}

function read(req, res) {
    res.json({ data: res.locals.dish });
}

function create(req, res) {
    const { data: { name, description, price, image_url } = {} } = req.body;
    const newDish = {
        id: `${nextId}`,
        name,
        description,
        price,
        image_url
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}
module.exports = {
    list,
    read: [dishExists, read],
    create: [
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        pricePropertyIsValid,
        create
    ],
    update: [
        dishExists, 
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        idPropertyIsValid,
        pricePropertyIsValid, 
        update
    ],
};