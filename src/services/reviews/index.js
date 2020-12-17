const express = require("express");
const path = require("path");
const uniqid = require("uniqid");
const { readDB, writeDB } = require("../../lib/utilities");

const { check, validationResult } = require("express-validator");

const router = express.Router();

const reviewsFilePath = path.join(__dirname, "reviews.json");

router.get("/", async (req, res, next) => {
  try {
    const reviewsDB = await readDB(reviewsFilePath);
    if (req.query && req.query.comment) {
      const filteredreviews = reviewsDB.filter(
        (review) =>
          review.hasOwnProperty("comment") &&
          review.comment.toLowerCase() === req.query.comment.toLowerCase()
      );
      res.send(filteredreviews);
    } else {
      res.send(reviewsDB);
    }
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const reviewsDB = await readDB(reviewsFilePath);
    const review = reviewsDB.filter((review) => review._id === req.params.id);
    if (review.length > 0) {
      res.send(review);
    } else {
      const err = new Error();
      err.httpStatusCode = 404;
      err.message = "Sorry, no comment was found";
      next(err);
    }
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  [
    check("comment")
      .isLength({ min: 1 })
      .withMessage("You cannot submit an empty comment, please add a comment")
      .exists()
      .withMessage("comment field is required"),
    check("rate")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rate must be between 1 and 5 (inclusive)")
      .exists()
      .withMessage("rate field is required"),
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
        const reviewsDB = await readDB(reviewsFilePath);
        const newreview = {
          ...req.body,
          _id: uniqid(),
          createdAt: new Date(),
        };

        reviewsDB.push(newreview);

        await writeDB(reviewsFilePath, reviewsDB);

        res.status(201).send({ _id: newreview._id });
      }
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/:id",
  [
    check("comment")
      .isLength({ min: 1 })
      .withMessage("You cannot submit an empty comment, please add a comment")
      .exists()
      .withMessage("comment field is required"),
    check("rate")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rate must be between 1 and 5 (inclusive)")
      .exists()
      .withMessage("rate field is required"),
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
        const reviewsDB = await readDB(reviewsFilePath);
        const newDb = reviewsDB.filter(
          (review) => review._id !== req.params.id
        );

        const modifiedreview = {
          ...req.body,
          _id: req.params.id,
          updatedAt: new Date(),
        };

        newDb.push(modifiedreview);
        await writeDB(reviewsFilePath, newDb);

        res.send({ _id: modifiedreview._id });
      }
    } catch (error) {
      next(error);
    }
  }
);

router.delete("/:id", async (req, res, next) => {
  try {
    const reviewsDB = await readDB(reviewsFilePath);
    const newDb = reviewsDB.filter((review) => review._id !== req.params.id);
    await writeDB(reviewsFilePath, newDb);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
