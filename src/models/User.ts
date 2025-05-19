import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  password: string;
  online: boolean;
  socketIds?: string[]; // Support multiple socket IDs
  contacts?: string[]; // User IDs this user is allowed to chat with
  friendRequests?: string[]; // Incoming friend requests
  sentRequests?: string[]; // Outgoing friend requests
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  online: { type: Boolean, default: false },
  socketIds: { type: [String], default: [] }, // Array of socket IDs
  contacts: { type: [Schema.Types.ObjectId], ref: 'User', default: [] }, // Permission-based contacts
  friendRequests: { type: [Schema.Types.ObjectId], ref: 'User', default: [] }, // Incoming friend requests
  sentRequests: { type: [Schema.Types.ObjectId], ref: 'User', default: [] }, // Outgoing friend requests
});

// Add indexes to contacts, friendRequests, and sentRequests
UserSchema.index({ contacts: 1 });
UserSchema.index({ friendRequests: 1 });
UserSchema.index({ sentRequests: 1 });

// Exclude password from query results by default
UserSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  }
});
UserSchema.set('toObject', {
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  }
});

export default mongoose.model<IUser>('User', UserSchema);
