import axios from "axios";
import Chat from "../models/chat.js";
import imagekit from "../config/imagekit.js";
import openai from "../config/openai.js";

export const textMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId, prompt } = req.body;

    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) return res.json({ success: false, message: "Chat not found" });

    // Save user message
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    const { choices } = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const reply = {
      ...choices[0].message,
      timestamp: Date.now(),
      isImage: false,
    };

    chat.messages.push(reply);
    await chat.save();

    res.json({ success: true, reply });
  } catch (error) {
    console.error("Error in textMessageController:", error.message);
    res.json({ success: false, message: error.message });
  }
};

// image generation message controller

export const imageMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { prompt, chatId, isPublished } = req.body;

    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) return res.json({ success: false, message: "Chat not found" });

    // Add user message
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    // Encode the prompt properly
    const encodedPrompt = encodeURIComponent(prompt);

    const generativeImageUrl = `${
      process.env.IMAGEKIT_URL_ENDPOINT
    }/ik-genimg-prompt-${encodedPrompt}/${Date.now()}.png?tr=w-800,h-800}`;

    // Fetch the generated image (binary)
    const aiImageResponse = await axios.get(generativeImageUrl, {
      responseType: "arraybuffer",
    });

    const base64Image = Buffer.from(aiImageResponse.data, "binary").toString(
      "base64"
    );

    const uploadResponse = await imagekit.upload({
      file: base64Image,
      fileName: `${Date.now()}.png`,
      folder: "ChatBot",
    });

    // AI assistant reply
    const reply = {
      role: "assistant",
      content: uploadResponse.url,
      timestamp: Date.now(),
      isImage: true,
      isPublished: true,
    };

    // Respond immediately
    res.json({ success: true, reply });

    // Save message in chat
    chat.messages.push(reply);
    await chat.save();
  } catch (error) {
    console.error("Error in imageMessageController:", error.message);
    res.json({ success: false, message: error.message });
  }
};
