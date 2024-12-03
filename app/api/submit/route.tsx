import { NextRequest, NextResponse } from "next/server";
import { EdgeTTS } from "@andresaya/edge-tts";
import fs from "fs";
import path from "path";

// Function to delete the audio file
const deleteAudioFile = (filePath: string) => {
  const fullPath = path.join(process.cwd(), filePath);
  fs.unlink(fullPath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error("Error deleting file:", err);
    } else {
      console.log("File deleted successfully");
    }
  });
};

export const POST = async (req: NextRequest) => {
  // Delete the audio file before rendering
  deleteAudioFile("public/output");
  try {
    const formData = await req.formData();
    const text = formData.get("text") as string;
    const rate = formData.get("rate") as string;
    const volume = formData.get("volume") as string;
    const pitch = formData.get("pitch") as string;

    console.log("Received Data:", {
      text,
      rate,
      volume,
      pitch,
    });

    // Validate input data
    if (!text || !rate || !volume || !pitch) {
      return NextResponse.json({
        status: 400,
        message: "All fields are required",
      });
    }

    const tts = new EdgeTTS();
    const outputPath = "public/output"; // Ensure the file path is correct

    await tts.synthesize(`${text}`, "en-US-AvaMultilingualNeural", {
      rate: `${rate}%`,
      volume: `${volume}%`,
      pitch: `${pitch}Hz`,
    });

    await tts.toFile(outputPath);

    return NextResponse.json({
      status: 200,
      message: "Form submitted successfully",
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
