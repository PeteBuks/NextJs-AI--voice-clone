import io, base64, torch 
import numpy as np
import time, os
import soundfile as sf
import litserve as ls
from f5_tts import api
from fastapi import Response, Request
from fastapi.middleware.cors import CORSMiddleware

LANGUAGE = "en"

class F5TTSLitAPI(ls.LitAPI):
    def setup(self, device):
        self.f5tts = api.F5TTS(device=device)
        print('setup complete...')

    async def decode_request(self, request: Request):
        # Decode the incoming JSON payload
        payload = await request.json()
        text = payload.get("gen_text", "")
        ref_file = payload.get("ref_file", "")
        ref_text = payload.get("ref_text", "")
        return text, ref_file, ref_text

    async def predict(self, params):
        text, ref_file, ref_text = params  # Unpack the tuple returned from decode_request

        # Validate the ref_file path
        if not os.path.isfile(ref_file):
            raise FileNotFoundError(f"Reference file not found: {ref_file}")

        # Perform the inference
        wav, s, t = self.f5tts.infer(
            ref_file=ref_file,
            ref_text=ref_text,
            gen_text=text,
            seed=-1,  # random seed = -1
        )

        # Prepare the audio data
        audio_buffer = io.BytesIO()
        sf.write(audio_buffer, wav, samplerate=22050, format='WAV')
        audio_buffer.seek(0)
        audio_data = audio_buffer.getvalue()
        audio_buffer.close()

        return audio_data

    async def encode_response(self, prediction):
        return Response(content=prediction, headers={"Content-Type": "audio/wav"})

    async def handle_request(self, request: Request):
        # Decode request, predict, and encode response
        params = await self.decode_request(request)
        prediction = await self.predict(params)
        return await self.encode_response(prediction)

if __name__ == "__main__":
    api = F5TTSLitAPI()
    server = ls.LitServer(api)

    # Add CORS middleware
    server.app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Replace "*" with specific origins like your Next.js domain
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    server.run(port=8000)
