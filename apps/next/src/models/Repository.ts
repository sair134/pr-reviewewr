import mongoose from 'mongoose';

export interface IRepository extends mongoose.Document {
  id: string; // Repository ID from the platform (GitHub/Bitbucket)
  name: string;
  fullName: string; // e.g., "owner/repo-name"
  description?: string;
  private: boolean;
  defaultBranch: string;
  htmlUrl: string;
  cloneUrl?: string;
  language?: string;
  provider: 'github' | 'bitbucket';
  workspace?: string; // For Bitbucket workspaces
  webhookId?: string; // Webhook ID from the platform
  webhookUrl?: string; // Our webhook endpoint URL
  webhookSecret?: string; // Webhook secret for verification
  userId: mongoose.Types.ObjectId; // Reference to the user who owns this repository
  isActive: boolean; // Whether webhook is active and monitoring PRs
  createdAt: Date;
  updatedAt: Date;
}

const RepositorySchema = new mongoose.Schema<IRepository>({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  private: {
    type: Boolean,
    required: true,
  },
  defaultBranch: {
    type: String,
    required: true,
  },
  htmlUrl: {
    type: String,
    required: true,
  },
  cloneUrl: {
    type: String,
  },
  language: {
    type: String,
  },
  provider: {
    type: String,
    enum: ['github', 'bitbucket'],
    required: true,
  },
  workspace: {
    type: String, // For Bitbucket workspaces
  },
  webhookId: {
    type: String,
  },
  webhookUrl: {
    type: String,
  },
  webhookSecret: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Create compound index to ensure unique repositories per user
RepositorySchema.index({ id: 1, provider: 1, userId: 1 }, { unique: true });

export default mongoose.models.Repository || mongoose.model<IRepository>('Repository', RepositorySchema);
