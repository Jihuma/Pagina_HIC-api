import { Schema } from "mongoose"
import mongoose from "mongoose"

const categorySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
        },
        icon: {
            type: String,
            default: "fas fa-folder",
        },
        color: {
            type: String,
            default: "bg-blue-600 text-white",
        },
        hoverColor: {
            type: String,
            default: "hover:bg-blue-700",
        },
    },
    {timestamps: true}
);

export default mongoose.model("Category", categorySchema)