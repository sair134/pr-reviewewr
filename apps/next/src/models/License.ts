import mongoose, {Schema, model, models} from 'mongoose';
const licenseSchema = new Schema({
    UserId : {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    planName : {
        type: String,
        required: true,
    },
    createdAt : {
        type: Date,
        default: Date.now,
    },
    expiresAt : {
        type: Date,
        required: true,
    },
}, {
    timestamps: true,
});

const License = models.License || model('License', licenseSchema);

export default License;