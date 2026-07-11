import { Router } from "express";

import {
  createCollection,
  deleteCollection,
  getCollection,
  listCollections,
  updateCollection,
} from "../controllers/collection.controller";
import { requireDb } from "../middleware/requireDb";

const collectionRouter = Router();

collectionRouter.use(requireDb);
collectionRouter.post("/collections", createCollection);
collectionRouter.get("/collections", listCollections);
collectionRouter.get("/collections/:collectionId", getCollection);
collectionRouter.patch("/collections/:collectionId", updateCollection);
collectionRouter.delete("/collections/:collectionId", deleteCollection);

export default collectionRouter;
