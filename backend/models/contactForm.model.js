import { Schema, model } from "mongoose"

const contactFormSchema = new Schema(
  {
    parentName: {
      type: String,
      required: true,
    },
    parentSurname: {
      type: String,
      required: true,
    },
    childName: {
      type: String,
      required: true,
    },
    childGender: {
      type: String,
      required: true,
    },
    childAge: {
      type: String,
      required: true,
    },
    childBirthDate: {
      type: String,
      required: true,
    },
    contactPhone: {
      type: String,
      required: true,
    },
    contactEmail: {
      type: String,
      required: true,
    },
    consultationReason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'contacted'],
      default: 'pending'
    },
    relatedPost: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      default: null
    }
  },
  { timestamps: true }
);

export default model("ContactForm", contactFormSchema);