import { NextRequest, NextResponse } from "next/server";
import { EdgeTTS } from "@andresaya/edge-tts";

export const POST = async (req: NextRequest) => {
  // Delete the audio file before rendering

  try {
    const formData = await req.json();
    const { inputText, rate, pitch, voice } = formData;

    const tts = new EdgeTTS();

    await tts.synthesize(inputText, voice, {
      rate: `${rate}%`,
      pitch: `${pitch}Hz`,
    });
    const audioBase64 = tts.toBase64();

    return NextResponse.json({
      audio: audioBase64,
      message: "Voice generated successfully",
    });
  } catch (error) {
    console.error("Error synthesizing voice:", error);
    return NextResponse.json({
      status: 500,
      message: "Error synthesizing voice",
    });
  }
};
