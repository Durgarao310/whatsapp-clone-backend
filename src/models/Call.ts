import mongoose, { Document, Schema, Types } from 'mongoose';

export type CallStatus = 'ongoing' | 'ended' | 'missed';

export interface ICall extends Document {
  caller: Types.ObjectId;
  callee: Types.ObjectId;
  status: CallStatus;
  startedAt: Date;
  endedAt?: Date;
}

const CallSchema = new Schema<ICall>({
  caller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  callee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['ongoing', 'ended', 'missed'], required: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
});

export default mongoose.model<ICall>('Call', CallSchema);
