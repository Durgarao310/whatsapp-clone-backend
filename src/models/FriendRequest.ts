import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFriendRequest extends Document {
  from: Types.ObjectId; // sender
  to: Types.ObjectId;   // receiver
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

const FriendRequestSchema = new Schema<IFriendRequest>({
  from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

FriendRequestSchema.index({ from: 1 });
FriendRequestSchema.index({ to: 1 });
FriendRequestSchema.index({ status: 1 });

export default mongoose.model<IFriendRequest>('FriendRequest', FriendRequestSchema);
