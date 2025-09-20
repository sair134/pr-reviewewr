import {Schema, model, models} from 'mongoose';

const PlansSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    features: {
        type: [String],
        required: true,
    },
});

export default models.Plans || model('Plans', PlansSchema);