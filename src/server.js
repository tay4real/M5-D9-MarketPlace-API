const express = require("express");
const listEndpoints = require("express-list-endpoints");
const cors = require("cors");
const { join } = require("path");
const productsRouter = require("./services/products");

const product_uploadsRouter = require("./services/product_uploads");
const cartsRouter = require("./services/carts");

const {
  badRequest,
  unauthorizedHandler,
  forbiddenHandler,
  notFoundHandler,
  catchAllHandler,
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

server.use("/product", product_uploadsRouter);
server.use("/carts", cartsRouter);

server.use(badRequest);
server.use(notFoundHandler);
server.use(unauthorizedHandler);
server.use(forbiddenHandler);
server.use(catchAllHandler);

console.log(listEndpoints(server));

server.listen(port, () =>
  console.log(`Server running on: http://localhost:${port}/`)
);
