import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ImageSize, VoiceName } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Audio Decoding Utils ---
function atobHelper(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- API Functions ---

export const generateMeditationScript = async (
  ageGroup: string,
  mood: string,
  visualStyle: string,
  duration: string
): Promise<{ title: string; script: string; visualPrompt: string }> => {
  const isKid = ageGroup !== "Adult";
  const prompt = `
    You are an expert meditation guide and content creator for ${isKid ? 'children' : 'adults'}.
    Create a custom guided meditation session.
    
    Target Audience Age: ${ageGroup}
    Goal/Mood: ${mood}
    Visual Theme: ${visualStyle}
    Duration: ${duration}
    
    Return the response in JSON format with the following schema:
    {
      "title": "A creative title for the session",
      "script": "The full meditation script, written to be spoken. Approx ${duration === 'Short' ? '150' : '300'} words.",
      "visualPrompt": "A detailed image generation prompt describing a scene that matches the script and visual theme. Focus on lighting, atmosphere, and style."
    }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          script: { type: Type.STRING },
          visualPrompt: { type: Type.STRING }
        },
        required: ["title", "script", "visualPrompt"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No script generated");
  return JSON.parse(text);
};

export const generateMeditationImage = async (
  prompt: string,
  size: ImageSize
): Promise<string> => {
  // Using gemini-3-pro-image-preview for high quality images
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size // 1K, 2K, or 4K
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

export const generateMeditationAudio = async (
  text: string,
  voiceName: VoiceName,
  audioContext: AudioContext
): Promise<AudioBuffer> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName }
        }
      }
    }
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio generated");

  const audioBytes = atobHelper(base64Audio);
  return await decodeAudioData(audioBytes, audioContext);
};

export const chatWithBot = async (
  message: string,
  history: { role: 'user' | 'model'; text: string }[],
  isKid: boolean
): Promise<string> => {
  const systemInstruction = isKid 
    ? "You are a friendly, magical meditation buddy. Keep answers short, encouraging, and use simple language. Use emojis!" 
    : "You are a professional meditation coach. Provide helpful, calming advice about mindfulness and stress relief.";

  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: { systemInstruction },
    history: history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }))
  });

  const result = await chat.sendMessage({ message });
  return result.text || "I'm having a little trouble thinking right now. Let's take a deep breath.";
};
