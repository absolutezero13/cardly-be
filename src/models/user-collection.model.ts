import { Schema, model, type InferSchemaType } from "mongoose";

const userCollectionSchema = new Schema(
  {
    ownerId: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "user-collections",
  },
);

userCollectionSchema.index({ ownerId: 1, name: 1 }, { unique: true });

export type UserCollection = InferSchemaType<typeof userCollectionSchema>;

export const UserCollectionModel = model(
  "UserCollection",
  userCollectionSchema,
);
