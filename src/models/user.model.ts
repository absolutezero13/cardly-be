import { Schema, model, type InferSchemaType } from 'mongoose';

const userSchema = new Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'users',
  },
);

export type User = InferSchemaType<typeof userSchema>;

export const UserModel = model('User', userSchema);
