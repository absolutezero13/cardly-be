import { Router } from "express";

import {
  createCollection,
  deleteCollection,
  getCollection,
  listCollections,
  updateCollection,
} from "../controllers/collection.controller";
import { requireDb } from "../middleware/requireDb";
import { verifyIdToken } from "../middleware/verifyIdToken";

const collectionRouter = Router();

collectionRouter.use(verifyIdToken, requireDb);
collectionRouter.post("/collections", createCollection);
collectionRouter.get("/collections", listCollections);
collectionRouter.get("/collections/:collectionId", getCollection);
collectionRouter.patch("/collections/:collectionId", updateCollection);
collectionRouter.delete("/collections/:collectionId", deleteCollection);

export default collectionRouter;
