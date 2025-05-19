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

// Normalize username to lowercase before saving
UserSchema.pre('save', function (next) {
  if (this.isModified('username') && typeof this.username === 'string') {
    this.username = this.username.toLowerCase();
  }
  next();
});

// Add indexes to contacts
UserSchema.index({ contacts: 1 });

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
