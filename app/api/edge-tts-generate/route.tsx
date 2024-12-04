import { NextRequest, NextResponse } from "next/server";
import { EdgeTTS } from "@andresaya/edge-tts";

export const POST = async (req: NextRequest) => {
  // Delete the audio file before rendering

  try {
    const formData = await req.json();
    const { inputText, rate, pitch, voice } = formData;

    const tts = new EdgeTTS();
    const outputPath = "public/output"; // Ensure the file path is correct

    await tts.synthesize(inputText, voice, {
      rate: `${rate}%`,
      pitch: `${pitch}Hz`,
    });
    await tts.toFile(outputPath);

    return NextResponse.json({
      status: 200,
      message: "Audio Generated successfully",
      headers: {
        "Content-Type": "audio/mpeg",
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
