import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import { Webhook } from "svix";

export const clerkWebHook = async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Webhook secret needed!");
  }

  const payload = req.body;
  const headers = req.headers;

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;
  try {
    evt = wh.verify(payload, headers);
  } catch (err) {
    res.status(400).json({
      message: "Webhook verification failed!",
    });
  }

  // console.log(evt.data);

  if (evt.type === "user.created") {
    console.log("Received user.created event. Full data:", JSON.stringify(evt.data, null, 2));
    console.log("Clerk User ID from event data:", evt.data.id); // ¡Muy importante!

    const clerkIdFromEvent = evt.data.id;
    const emailFromEvent = evt.data.email_addresses[0].email_address;
    let usernameFromEvent = evt.data.username;

    if (!usernameFromEvent) {
        // Si evt.data.username es null o undefined, intenta extraerlo del email
        usernameFromEvent = emailFromEvent.split('@')[0];
    }
    
    console.log(`Attempting to save user with clerkUserId: ${clerkIdFromEvent}, username: ${usernameFromEvent}, email: ${emailFromEvent}`);

    const newUser = new User({
        clerkUserId: clerkIdFromEvent,
        username: usernameFromEvent, // Asegúrate que esto también sea único si el esquema lo requiere
        email: emailFromEvent,       // Asegúrate que esto también sea único si el esquema lo requiere
        // img: evt.data.profile_image_url || evt.data.image_url, // Comenta temporalmente si sospechas
    });

    try {
        await newUser.save();
        console.log("User saved successfully with clerkUserId:", newUser.clerkUserId);
        return res.status(200).json({ message: "Webhook received and user created" });
    } catch (saveError) {
        console.error("Error saving new user:", saveError);
        console.error("Data attempted to save:", newUser.toObject ? newUser.toObject() : newUser); // Logea el objeto que se intentó guardar
        return res.status(500).json({ message: "Failed to save user", error: saveError.message, detail: saveError });
    }
  }

  if (evt.type === "user.deleted") {
    const deletedUser = await User.findOneAndDelete({
      clerkUserId: evt.data.id,
    });

    await Post.deleteMany({user:deletedUser._id})
    await Comment.deleteMany({user:deletedUser._id})
  }

  return res.status(200).json({
    message: "Webhook received",
  });
};