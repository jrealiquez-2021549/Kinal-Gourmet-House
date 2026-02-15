'use strict';

import { Schema, model } from 'mongoose';

const eventSchema = Schema({
    title: { 
        type: String, 
        required: [true, 'El título del evento es obligatorio'],
        trim: true 
    },
    description: { 
        type: String, 
        required: [true, 'La descripción es obligatoria'] 
    },
    date: { 
        type: Date, 
        required: [true, 'La fecha es obligatoria'] 
    },
    restaurant: { 
        type: Schema.Types.ObjectId, 
        ref: 'Restaurant', 
        required: [true, 'El evento debe estar vinculado a un restaurante'] 
    },
    status: { 
        type: String, 
        enum: ['UPCOMING', 'ONGOING', 'FINISHED'], 
        default: 'UPCOMING' 
    }
}, { timestamps: true, versionKey: false });

export default model('Event', eventSchema);