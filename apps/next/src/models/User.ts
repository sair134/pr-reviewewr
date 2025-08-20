import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  email?: string;
  name: string;
  image?: string;
  githubToken?: string; // This will store encrypted token
  bitbucketToken?: string; // This will store encrypted token
  githubUsername?: string;
  githubId?: string; // GitHub user ID for authentication
  bitbucketUsername?: string;
  bitbucketId?: string; // Bitbucket user ID for authentication
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: false, // Make email optional
      unique: true,
      sparse: true, // Allow multiple documents without email
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
    githubId: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple documents without githubId
    },
    bitbucketUsername: {
      type: String,
    },
    bitbucketId: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple documents without bitbucketId
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
