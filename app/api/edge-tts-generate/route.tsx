import fs from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { EdgeTTS } from "@andresaya/edge-tts";

export const POST = async (req: NextRequest) => {
  // Delete the audio file before rendering

  try {
    const formData = await req.json();
    const { inputText, rate, volume, pitch, voice } = formData;

    const stringifiedFormData = {
      inputText: String(inputText),
      rate: `${rate}%`, // Use template literals to format as required
      volume: `${volume}%`,
      pitch: `${pitch}Hz`,
      voice: String(voice),
    };

    const tts = new EdgeTTS();
    const outputPath = "/tmp/output.mp3"; // changr the path to public instead of tmp for local solution

    await tts.synthesize(
      stringifiedFormData.inputText,
      stringifiedFormData.voice,
      {
        rate: stringifiedFormData.rate,
        volume: stringifiedFormData.volume,
        pitch: stringifiedFormData.pitch,
      }
    );
    await tts.toFile(outputPath);

    const fileContent = await fs.readFile(outputPath);

    return NextResponse.json(fileContent, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": "attachment; filename=output.mp3",
      },
    });
  } catch (error) {
    console.error("Error synthesizing voice:", error);
    return NextResponse.json({
      status: 500,
      message: "Internal Server Error: ",
    });
  }
};
