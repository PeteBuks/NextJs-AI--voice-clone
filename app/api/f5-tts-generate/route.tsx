import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Parse the incoming request JSON
    const payload = await req.json();
    const { gen_text, ref_file, ref_text } = payload;

    console.log(payload);

    const response = await fetch(
      "https://8000-01jd7kh5gcv0j44h526wjpcxrd.cloudspaces.litng.ai/predict",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gen_text, ref_file, ref_text }),
      }
    );

    // Handle the response from the external API
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      return NextResponse.json(
        { error: `API Error: ${errorText}` },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(Buffer.from(audioBuffer), {
      headers: {
        "Content-Disposition": 'attachment; filename="output.wav"',
        "Content-Type": "audio/wav",
      },
    });
  } catch (error: unknown) {
    // Handle any internal server errors
    console.error("Error occurred:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}
