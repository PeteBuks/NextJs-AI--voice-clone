"use client";

import React, { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { Button } from "./ui/button";
import { FormDataProps } from "@/types/types";

const FormComponent: React.FC = () => {
  const [formData, setFormData] = useState<FormDataProps>({
    text: "",
    rate: "0",
    volume: "50",
    pitch: "0",
  });

  const [responseMessage, setResponseMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [Submitted, setSubmitted] = useState<boolean>(false);

  const [audioKey, setAudioKey] = useState<number>(0);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    try {
      // Fetch API
      const response = await fetch("/api/submit", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.log("falling over");
        throw new Error(`Response status: ${response.status}`);
      }
      if (response.ok) {
        setSubmitted(true);
      }
      const responseData = await response.json();
      setResponseMessage(responseData.message);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to submit the form. Please try again.");
    } finally {
      setIsLoading(false);
      // Update audio key to refresh audio after handling submission
      setAudioKey((prevKey) => prevKey + 1);
    }
  };

  useEffect(() => {
    if (responseMessage) {
      // When the responseMessage is set, it means the form was successfully submitted,
      // so we refresh the audio key to force the audio element to re-render.
      setAudioKey((prevKey) => prevKey + 1);
    }
  }, [responseMessage]);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          className="border-[#cecece] w-[300px] h-[100px] p-3 border-2 rounded-lg mb-5"
          type="text"
          name="text"
          required
        />
        <div className="flex flex-col gap-1 mb-5">
          <label htmlFor="rate">Speech Rate: {formData.rate}</label>
          <input
            type="range"
            min={-100}
            max={100}
            name="rate"
            onChange={handleChange}
            value={formData.rate}
            id="rate"
            required
          />
        </div>
        <div className="flex flex-col gap-1 mb-5">
          <label htmlFor="volume">Volume: {formData.volume}</label>
          <input
            type="range"
            min={0}
            max={100}
            name="volume"
            onChange={handleChange}
            value={formData.volume}
            id="volume"
            required
          />
        </div>
        <div className="flex flex-col gap-1 mb-5">
          <label htmlFor="pitch">Pitch: {formData.pitch}</label>
          <input
            type="range"
            min={-100}
            max={100}
            name="pitch"
            onChange={handleChange}
            value={formData.pitch}
            id="pitch"
            required
          />
        </div>
        <Button type="submit" className="mb-5" disabled={isLoading}>
          {isLoading ? "Loading..." : "Submit"}
        </Button>
      </form>
      <div className={`${isLoading ? "hidden" : "block"}`}>
        {responseMessage && (
          <div>
            <p>{responseMessage}</p>
          </div>
        )}
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

        {Submitted && (
          <div>
            <audio key={audioKey} controls>
              <source
                src={`/output.mp3?key=${audioKey}`}
                type="audio/mpeg"
              ></source>
            </audio>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormComponent;
