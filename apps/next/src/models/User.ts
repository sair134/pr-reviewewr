import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  email: string;
  name: string;
  image?: string;
  githubToken?: string; // This will store encrypted token
  bitbucketToken?: string; // This will store encrypted token
  githubUsername?: string;
  bitbucketUsername?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    githubToken: {
      type: String,
    },
    bitbucketToken: {
      type: String,
    },
    githubUsername: {
      type: String,
    },
    bitbucketUsername: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
