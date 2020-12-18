const express = require("express");
const listEndpoints = require("express-list-endpoints");
const cors = require("cors");
const { join } = require("path");
const productsRouter = require("./services/products");
const cartsRouter = require("./services/carts");

const {
  badRequestHandler,
  notFoundHandler,
  genericErrorHandler,
} = require("./errorHandling");

const server = express();

const port = process.env.PORT || 5001;
const publicFolderPath = join(__dirname, "../public");

const loggerMiddleware = (req, res, next) => {
  console.log(`Logged ${req.url} ${req.method} -- ${new Date()}`);
  next();
};

server.use(cors());
server.use(express.json());
server.use(loggerMiddleware);
server.use(express.static(publicFolderPath));

server.use("/products", productsRouter);
server.use("/carts", cartsRouter);

server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

console.log(listEndpoints(server));

server.listen(port, () =>
  console.log(`Server running on: http://localhost:${port}/`)
);
