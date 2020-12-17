const express = require("express");
const multer = require("multer");
const { writeFile, createReadStream } = require("fs-extra");
const { pipeline } = require("stream");
const zlib = require("zlib");
const { join } = require("path");
const { readDB, writeDB } = require("../../lib/utilities");

const router = express.Router();

const upload = multer({});

const productsFolderPath = join(__dirname, "../../../public/img/products");
const productsFilePath = join(__dirname, "../products/products.json");

// router.post("/:id/upload", upload.single("avatar"), async (req, res, next) => {
//   try {
//     console.log(productsFilePath);
//     await writeFile(
//       join(productsFilePath, req.file.originalname),
//       req.file.buffer
//     );
//     res.send("ok");
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// });

router.post("/:id/upload", upload.single("avatar"), async (req, res, next) => {
  try {
    console.log(join(productsFolderPath, req.file.originalname));
    await writeFile(
      join(productsFolderPath, req.file.originalname),
      req.file.buffer
    );

    const productsDB = await readDB(productsFilePath);
    const productItem = productsDB.filter(
      (product) => product._id === req.params.id
    );
    res.send("ok");

    console.log(productItem);

    if (productItem.length > 0) {
      const newDb = productsDB.filter(
        (product) => product._id !== req.params.id
      );

      console.log(productItem[0]);

      productItem[0].imageUrl = join(productsFolderPath, req.file.originalname);

      productItem[0]._id = req.params.id;
      productItem[0].updatedAt = new Date();
      newDb.push(productItem[0]);
      await writeDB(productsFilePath, newDb);

      res.send("ok");
    } else {
      const err = new Error();
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post(
  "/uploadMultiple",
  upload.array("multipleAvatar", 2),
  async (req, res, next) => {
    try {
      const arrayOfPromises = req.files.map((file) =>
        writeFile(join(projectsFolderPath, file.originalname), file.buffer)
      );
      await Promise.all(arrayOfPromises);
      res.send("ok");
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

router.get("/:name/download", (req, res, next) => {
  const source = createReadStream(
    join(projectsFolderPath, `${req.params.name}`)
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${req.params.name}.gz`
  );
  pipeline(source, zlib.createGzip(), res, (error) => next(error));
});

module.exports = router;
