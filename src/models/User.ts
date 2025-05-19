import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  password: string;
  online: boolean;
  socketIds?: string[]; // Support multiple socket IDs
  contacts?: string[]; // User IDs this user is allowed to chat with
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  online: { type: Boolean, default: false },
  socketIds: { type: [String], default: [] }, // Array of socket IDs
  contacts: { type: [Schema.Types.ObjectId], ref: 'User', default: [] }, // Permission-based contacts
});

export default mongoose.model<IUser>('User', UserSchema);
