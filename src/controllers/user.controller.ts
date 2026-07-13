import type { Request, Response } from "express";

import { UserCollectionModel } from "../models/user-collection.model";
import { UserModel } from "../models/user.model";
import { getAuthUid } from "../types/auth";

const DEFAULT_COLLECTION_NAMES = ["Football", "Basketball", "Baseball"];

const createDefaultCollections = async (ownerId: string): Promise<void> => {
  const bulk = DEFAULT_COLLECTION_NAMES.map((name) => ({
    updateOne: {
      filter: { ownerId, name },
      update: {
        $setOnInsert: {
          ownerId,
          name,
          isDefault: true,
        },
      },
      upsert: true,
    },
  }));

  await UserCollectionModel.bulkWrite(bulk);
};

export const saveUser = async (
  request: Request,
  response: Response,
): Promise<void> => {
  try {
    const uid = getAuthUid(request);

    const result = await UserModel.findOneAndUpdate(
      { uid },
      { $setOnInsert: { uid } },
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
        includeResultMetadata: true,
      },
    );

    const user = result.value;

    if (!user) {
      throw new Error("User upsert did not return a user");
    }

    if (result.lastErrorObject?.upserted) {
      await createDefaultCollections(uid);
    }

    response.status(201).json(user);
  } catch (error) {
    console.error("Failed to save user:", error);
    response.status(500).json({ error: "Failed to save user" });
  }
};

export const getUser = async (
  request: Request,
  response: Response,
): Promise<void> => {
  try {
    const authUid = getAuthUid(request);
    const { uid } = request.params;

    if (uid !== authUid) {
      response.status(403).json({ error: "Forbidden" });
      return;
    }

    const user = await UserModel.findOne({ uid: authUid });

    if (!user) {
      response.status(404).json({ error: "User not found" });
      return;
    }

    response.status(200).json(user);
  } catch (error) {
    console.error("Failed to get user:", error);
    response.status(500).json({ error: "Failed to get user" });
  }
};
