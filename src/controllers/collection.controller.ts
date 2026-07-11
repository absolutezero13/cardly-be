import type { Request, Response } from "express";
import { Error as MongooseError } from "mongoose";

import { CardModel } from "../models/card.model";
import { UserCollectionModel } from "../models/user-collection.model";

const handleCollectionError = (
  response: Response,
  error: unknown,
  action: string,
): void => {
  if (
    error instanceof MongooseError.ValidationError ||
    error instanceof MongooseError.CastError
  ) {
    response.status(400).json({ error: error.message });
    return;
  }

  console.error(`Failed to ${action} collection:`, error);
  response.status(500).json({ error: `Failed to ${action} collection` });
};

export const createCollection = async (
  request: Request,
  response: Response,
): Promise<void> => {
  try {
    const { ownerId, name } = request.body;

    const collection = await UserCollectionModel.create({
      ownerId,
      name,
      isDefault: false,
    });

    response.status(201).json(collection);
  } catch (error) {
    handleCollectionError(response, error, "create");
  }
};

export const listCollections = async (
  request: Request,
  response: Response,
): Promise<void> => {
  try {
    const ownerId = request.query.ownerId as string;

    const collections = await UserCollectionModel.find({ ownerId }).sort({
      isDefault: -1,
      createdAt: 1,
    });

    response.status(200).json(collections);
  } catch (error) {
    handleCollectionError(response, error, "list");
  }
};

export const getCollection = async (
  request: Request,
  response: Response,
): Promise<void> => {
  try {
    const ownerId = request.query.ownerId as string;
    const { collectionId } = request.params;

    const collection = await UserCollectionModel.findOne({
      _id: collectionId,
      ownerId,
    });

    if (!collection) {
      response.status(404).json({ error: "Collection not found" });
      return;
    }

    response.status(200).json(collection);
  } catch (error) {
    handleCollectionError(response, error, "get");
  }
};

export const updateCollection = async (
  request: Request,
  response: Response,
): Promise<void> => {
  try {
    const ownerId = request.query.ownerId as string;
    const { collectionId } = request.params;
    const { name } = request.body;

    const collection = await UserCollectionModel.findOneAndUpdate(
      { _id: collectionId, ownerId },
      { $set: { name } },
      { returnDocument: "after", runValidators: true },
    );

    if (!collection) {
      response.status(404).json({ error: "Collection not found" });
      return;
    }

    response.status(200).json(collection);
  } catch (error) {
    handleCollectionError(response, error, "update");
  }
};

export const deleteCollection = async (
  request: Request,
  response: Response,
): Promise<void> => {
  try {
    const ownerId = request.query.ownerId as string;
    const { collectionId } = request.params;

    const collection = await UserCollectionModel.findOne({
      _id: collectionId,
      ownerId,
    });

    if (!collection) {
      response.status(404).json({ error: "Collection not found" });
      return;
    }

    await CardModel.updateMany(
      { ownerId, collectionId },
      { $set: { collectionId: null } },
    );
    await collection.deleteOne();

    response.status(204).send();
  } catch (error) {
    handleCollectionError(response, error, "delete");
  }
};
