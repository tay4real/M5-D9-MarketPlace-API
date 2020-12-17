const express = require("express")
const { check, validationResult } = require("express-validator")
const uniqid = require("uniqid")
const { getcarts, writecarts } = require("../../lib/fsUtilities")

const cartsRouter = express.Router()

const cartsValidation = [
  check("name").exists().withMessage("Name is required!"),
  check("brand").exists().withMessage("Brand is required!"),
]

const reviewsValidation = [
  check("rate").exists().withMessage("Rate is required!"),
  check("comment").exists().withMessage("Comment is required!"),
]

cartsRouter.get("/", async (req, res, next) => {
  try {
    const carts = await getcarts()

    if (req.query && req.query.category) {
      const filteredcarts = carts.filter(
        cart =>
          cart.hasOwnProperty("category") &&
          cart.category === req.query.category
      )
      res.send(filteredcarts)
    } else {
      res.send(carts)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

cartsRouter.get("/:cartId", async (req, res, next) => {
  try {
    const carts = await getcarts()

    const cartFound = carts.find(
      cart => cart._id === req.params.cartId
    )

    if (cartFound) {
      res.send(cartFound)
    } else {
      const err = new Error()
      err.httpStatusCode = 404
      next(err)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

cartsRouter.post("/", cartsValidation, async (req, res, next) => {
  try {
    const validationErrors = validationResult(req)

    const whiteList = ["name", "description"]

    if (!validationErrors.isEmpty()) {
      const error = new Error()
      error.httpStatusCode = 400
      error.message = validationErrors
      next(error)
    } else {
      const carts = await getcarts()

      carts.push({
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
        _id: uniqid(),
        reviews: [],
      })
      await writecarts(carts)
      res.status(201).send()
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

cartsRouter.put(
  "/:cartId",
  cartsValidation,
  async (req, res, next) => {
    try {
      const validationErrors = validationResult(req)

      if (!validationErrors.isEmpty()) {
        const error = new Error()
        error.httpStatusCode = 400
        error.message = validationErrors
        next(error)
      } else {
        const carts = await getcarts()

        const cartIndex = carts.findIndex(
          cart => cart._id === req.params.cartId
        )

        if (cartIndex !== -1) {
          // cart found
          const updatedcarts = [
            ...carts.slice(0, cartIndex),
            { ...carts[cartIndex], ...req.body },
            ...carts.slice(cartIndex + 1),
          ]
          await writecarts(updatedcarts)
          res.send(updatedcarts)
        } else {
          const err = new Error()
          err.httpStatusCode = 404
          next(err)
        }
      }
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
)

cartsRouter.delete("/:cartId", async (req, res, next) => {
  try {
    const carts = await getcarts()

    const cartFound = carts.find(
      cart => cart._id === req.params.cartId
    )

    if (cartFound) {
      const filteredcarts = carts.filter(
        cart => cart._id !== req.params.cartId
      )

      await writecarts(filteredcarts)
      res.status(204).send()
    } else {
      const error = new Error()
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

cartsRouter.get("/:cartId/reviews", async (req, res, next) => {
  try {
    const carts = await getcarts()

    const cartFound = carts.find(
      cart => cart._id === req.params.cartId
    )

    if (cartFound) {
      res.send(cartFound.reviews)
    } else {
      const error = new Error()
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

cartsRouter.get("/:cartId/reviews/:reviewId", async (req, res, next) => {
  try {
    const carts = await getcarts()

    const cartFound = carts.find(
      cart => cart._id === req.params.cartId
    )

    if (cartFound) {
      const reviewFound = cartFound.reviews.find(
        review => review._id === req.params.reviewId
      )
      if (reviewFound) {
        res.send(reviewFound)
      } else {
        const error = new Error()
        error.httpStatusCode = 404
        next(error)
      }
    } else {
      const error = new Error()
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

cartsRouter.post(
  "/:cartId/reviews",
  reviewsValidation,
  async (req, res, next) => {
    try {
      const carts = await getcarts()

      const cartIndex = carts.findIndex(
        cart => cart._id === req.params.cartId
      )
      if (cartIndex !== -1) {
        // cart found
        carts[cartIndex].reviews.push({
          ...req.body,
          _id: uniqid(),
          createdAt: new Date(),
        })
        await writecarts(carts)
        res.status(201).send(carts)
      } else {
        // cart not found
        const error = new Error()
        error.httpStatusCode = 404
        next(error)
      }
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
)

cartsRouter.put(
  "/:cartId/reviews/:reviewId",
  reviewsValidation,
  async (req, res, next) => {
    try {
      const carts = await getcarts()

      const cartIndex = carts.findIndex(
        cart => cart._id === req.params.cartId
      )

      if (cartIndex !== -1) {
        const reviewIndex = carts[cartIndex].reviews.findIndex(
          review => review._id === req.params.reviewId
        )

        if (reviewIndex !== -1) {
          const previousReview = carts[cartIndex].reviews[reviewIndex]

          const updateReviews = [
            ...carts[cartIndex].reviews.slice(0, reviewIndex), // {}, {}, {}
            { ...previousReview, ...req.body, updatedAt: new Date() }, // previousReview:{ _id: 1, rate: 1, comment: "old comment"} req.body: { comment: "new comment"}, newObject: {_id, rate: 1, comment: "new comment"}
            ...carts[cartIndex].reviews.slice(reviewIndex + 1),
          ] // [before the specific review I'm trying to modify, {the modified review}, after the specified review I'm trying to modify]
          // [{}, {}, {}, {x}, {}, {}]
          carts[cartIndex].reviews = updateReviews

          await writecarts(carts)
          res.send(carts)
        } else {
          console.log("Review not found")
        }
      } else {
        console.log("cart not found")
      }
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
)

cartsRouter.delete(
  "/:cartId/reviews/:reviewId",
  async (req, res, next) => {
    try {
      const carts = await getcarts()

      const cartIndex = carts.findIndex(
        cart => cart._id === req.params.cartId
      )

      if (cartIndex !== -1) {
        carts[cartIndex].reviews = carts[cartIndex].reviews.filter(
          review => review._id !== req.params.reviewId
        )

        await writecarts(carts)
        res.send(carts)
      } else {
      }
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
)

module.exports = cartsRouter
