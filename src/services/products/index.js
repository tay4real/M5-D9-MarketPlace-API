const express = require("express");
const path = require("path");
const uniqid = require("uniqid");
const { readDB, writeDB } = require("../../lib/utilities");

const { check, validationResult } = require("express-validator");

const router = express.Router();

const productsFilePath = path.join(__dirname, "products.json");

router.get("/", async (req, res, next) => {
  try {
    const productsDB = await readDB(productsFilePath);
    if (req.query && req.query.name) {
      const filteredproducts = productsDB.filter(
        (product) =>
          product.hasOwnProperty("name") &&
          product.name.toLowerCase() === req.query.name.toLowerCase()
      );
      res.send(filteredproducts);
    } else {
      res.send(productsDB);
    }
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const productsDB = await readDB(productsFilePath);
    const product = productsDB.filter(
      (product) => product._id === req.params.id
    );
    if (product.length > 0) {
      res.send(product);
    } else {
      const err = new Error();
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  [
    check("name")
      .isLength({ min: 1 })
      .withMessage("Name cannot be empty")
      .exists()
      .withMessage("name field is required"),
    check("description")
      .isLength({ min: 1 })
      .withMessage("Description cannot be empty")
      .exists()
      .withMessage("description field is required"),
    check("brand")
      .isLength({ min: 1 })
      .withMessage("Brand cannot be empty")
      .exists()
      .withMessage("brand field is required"),
    check("price")
      .isLength({ min: 1 })
      .withMessage("Price cannot be empty")
      .exists()
      .withMessage("price field is required"),
    check("category")
      .isLength({ min: 1 })
      .withMessage("Category cannot be empty")
      .exists()
      .withMessage("category field is required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        const err = new Error();
        err.message = errors;
        err.httpStatusCode = 400;
        next(err);
      } else {
        const productsDB = await readDB(productsFilePath);
        const newproduct = {
          ...req.body,
          _id: uniqid(),
          createdAt: new Date(),
        };

        productsDB.push(newproduct);

        await writeDB(productsFilePath, productsDB);

        res.status(201).send({ _id: newproduct._id });
      }
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/:id",
  [
    check("name")
      .isLength({ min: 1 })
      .withMessage("Name cannot be empty")
      .exists()
      .withMessage("name field is required"),
    check("description")
      .isLength({ min: 1 })
      .withMessage("Description cannot be empty")
      .exists()
      .withMessage("description field is required"),
    check("brand")
      .isLength({ min: 1 })
      .withMessage("Brand cannot be empty")
      .exists()
      .withMessage("brand field is required"),
    check("price")
      .isLength({ min: 1 })
      .withMessage("Price cannot be empty")
      .exists()
      .withMessage("price field is required"),
    check("category")
      .isLength({ min: 1 })
      .withMessage("Category cannot be empty")
      .exists()
      .withMessage("category field is required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        const err = new Error();
        err.message = errors;
        err.httpStatusCode = 400;
        next(err);
      } else {
        const productsDB = await readDB(productsFilePath);
        const newDb = productsDB.filter(
          (product) => product._id !== req.params.id
        );

        const modifiedproduct = {
          ...req.body,
          _id: req.params.id,
          updatedAt: new Date(),
        };

        newDb.push(modifiedproduct);
        await writeDB(productsFilePath, newDb);

        res.send({ _id: modifiedproduct._id });
      }
    } catch (error) {
      next(error);
    }
  }
);

router.delete("/:id", async (req, res, next) => {
  try {
    const productsDB = await readDB(productsFilePath);
    const newDb = productsDB.filter((product) => product._id !== req.params.id);
    await writeDB(productsFilePath, newDb);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
