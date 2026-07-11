import type { Request, Response } from "express";

import { UserModel } from "../models/user.model";

export const saveUser = async (
  request: Request,
  response: Response,
): Promise<void> => {
  try {
    const { uid } = request.body as { uid?: unknown };

    if (typeof uid !== "string" || uid.trim() === "") {
      response
        .status(400)
        .json({ error: "uid is required and must be a non-empty string" });
      return;
    }

    const user = await UserModel.findOneAndUpdate(
      { uid },
      { $setOnInsert: { uid } },
      { upsert: true, returnDocument: "after", runValidators: true },
    );

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
    const { uid } = request.params;

    const user = await UserModel.findOne({ uid });

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
