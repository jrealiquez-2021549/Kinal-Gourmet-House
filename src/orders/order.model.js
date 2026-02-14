import mongoose from "mongoose";

const orderDetailSchema = new mongoose.Schema(
    {
        dish: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Menu",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        unitPrice: {
            type: Number,
            required: true
        }
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            required: true
        },

        table: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Table"
        },

        details: {
            type: [orderDetailSchema],
            required: true
        },

        totalPrice: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: ["PENDIENTE", "CONFIRMADO", "CANCELADO"],
            default: "PENDIENTE"
        }

    },
    {
        timestamps: true,
        versionKey: false
    }
);

export default mongoose.model("Order", orderSchema);
