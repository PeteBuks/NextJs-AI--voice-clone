import * as React from "react";
import { useState } from "react";
import { Play } from "lucide-react";
import { Pause } from "lucide-react";
import { FastForward } from "lucide-react";
import { Rewind } from "lucide-react";
import WavesurferPlayer from "@wavesurfer/react";

const AudioPlayer = ({ src }: { src: string }) => {
  const [wavesurfer, setWavesurfer] = useState<null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secondsRemainder = Math.round(seconds) % 60;
    const paddedSeconds = `0${secondsRemainder}`.slice(-2);
    if (hours > 0) {
      return `${hours}:${`0${minutes}`.slice(-2)}:${paddedSeconds}`;
    }
    return `${minutes}:${paddedSeconds}`;
  };

  const onReady = (ws) => {
    setWavesurfer(ws);
    setIsPlaying(false);

    // Set duration when the audio is ready
    setDuration(ws.getDuration());

    // Track current time with audioprocess
    ws.on("audioprocess", () => {
      setCurrentTime(ws.getCurrentTime());
    });
  };

  const forwardClick = () => wavesurfer && wavesurfer.skip(5);

  const rewindClick = () => wavesurfer && wavesurfer.skip(-5);

  const onPlayPause = () => wavesurfer && wavesurfer.playPause();

  return (
    <div className="my-3">
      <div className="flex flex-row justify-between items-center">
        {/* current time */}
        <p>{formatTime(currentTime)}</p>
        {/* Duration */}
        <p>{formatTime(duration)}</p>
      </div>
      <>
        <WavesurferPlayer
          height={70}
          waveColor={"#A9A9A9"}
          progressColor={"#000000"}
          url={src}
          barWidth={3}
          barGap={2}
          onReady={onReady}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      </>
      <div className="pt-5 flex flex-row justify-center items-center gap-5">
        <button onClick={rewindClick}>
          <Rewind />
        </button>
        <button onClick={onPlayPause} className="transition">
          {isPlaying ? <Pause /> : <Play />}
        </button>
        <button onClick={forwardClick}>
          <FastForward />
        </button>
      </div>
    </div>
  );
};

export default AudioPlayer;
