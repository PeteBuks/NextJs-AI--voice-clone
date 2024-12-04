"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { voices } from "@/constants";

import { Download, Loader2 } from "lucide-react";
import { AudioLines } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import AudioPlayer from "./AudioPlayer";
import Link from "next/link";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getUniqueLanguages = (voices: { language: string | any[] }[]) => {
  const languages = new Set<string>();
  voices.forEach((voice) => {
    if (Array.isArray(voice.language)) {
      voice.language.forEach((lang) => languages.add(lang));
    } else {
      languages.add(voice.language);
    }
  });
  return Array.from(languages);
};

// Define form validation schema using Zod
const formSchema = z.object({
  inputText: z.string().min(5, {
    message: "Generated text must be at least 10 characters.",
  }),
  language: z.string().min(3, { message: "Please select a voice" }),
  voice: z.string().min(3, { message: "Please select a voice" }),
  rate: z.number().min(-100).max(100),
  volume: z.number().min(-100).max(100),
  pitch: z.number().min(-100).max(100),
});

const EdgeTTSForm = () => {
  // State management
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [, setSelectedVoice] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const [progress, setProgress] = useState<number>(0);

  const [audioKey, setAudioKey] = useState<number>(0);

  const languages = getUniqueLanguages(voices);

  // Filter voices based on selected language
  const filteredVoices =
    selectedLanguage !== null
      ? voices.filter((voice) =>
          Array.isArray(voice.language)
            ? voice.language.includes(selectedLanguage)
            : voice.language === selectedLanguage
        )
      : [];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inputText: "",
      language: "",
      voice: "",
      rate: 0,
      volume: 0,
      pitch: 0,
    },
  });

  // OnSubmit function
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setProgress(0);
    setIsLoading(true);
    console.log(data);
    // Simulate intermediate steps for feedback
    setTimeout(() => setProgress(20), 500);
    setTimeout(() => setProgress(60), 1500);
    setTimeout(() => setProgress(90), 2500);

    try {
      const response = await fetch("/api/edge-tts-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data), // Ensure JSON payload
      });

      if (!response.ok) {
        throw new Error(`Failed with status: ${response.status}`);
      }

      const responseData = await response.json();
      setProgress(100);
      setResponseMessage(responseData.message);
      setSuccess(true);
    } catch (error) {
      console.error("Error submitting the form:", error);
      setErrorMessage("Failed to submit the form. Please try again.");
      setProgress(0);
      setSuccess(false);
    } finally {
      setIsLoading(false);
      setAudioKey((prevKey) => prevKey + 1);
    }
  };

  useEffect(() => {
    if (responseMessage) {
      // after form is submitted, this refreshes the audio key to force the audio element to re-render.
      setAudioKey((prevKey) => prevKey + 1);
    }
  }, [responseMessage]);

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-6"
        >
          {/* input text field */}
          <FormField
            control={form.control}
            name="inputText"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="pl-3">Input Text</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Input your text for generation"
                    className="resize-none"
                    rows={7}
                    {...field}
                  />
                </FormControl>
                <FormDescription className="pl-3">
                  <strong>NB:</strong> Longer text takes longer time to generate
                </FormDescription>
                <FormMessage className="pl-3" />
              </FormItem>
            )}
          />

          {/* language select field */}
          <div className="w-full flex flex-col xl:flex-row gap-4">
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem className="w-full xl:w-[180px]">
                  <FormLabel className="pl-3">Language</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedLanguage(value);
                      setSelectedVoice(null); // Reset voice selection
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {languages.map((language) => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="pl-3" />
                </FormItem>
              )}
            />

            {/* voice select field */}
            <FormField
              control={form.control}
              name="voice"
              render={({ field }) => (
                <FormItem className="w-full xl:w-[320px]">
                  <FormLabel className="pl-3">Select Voice</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a voice" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredVoices.map((voice) => (
                        <SelectItem
                          key={voice.shortName}
                          value={voice.shortName}
                        >
                          {voice.name} ({voice.gender}) {voice.accent}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="pl-3" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col xl:flex-row gap-5 justify-center items-center">
            {/* Rate Field */}
            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="pl-3">Rate: {field.value}</FormLabel>
                  <FormControl>
                    <Slider
                      value={[field.value]} // Slider value
                      onValueChange={(value) => field.onChange(value[0])} // Update form state
                      min={-100}
                      max={100}
                      step={1}
                    />
                  </FormControl>
                  <FormMessage className="pl-3" />
                </FormItem>
              )}
            />

            {/* Volume Field */}
            <FormField
              control={form.control}
              name="volume"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="pl-3">Volume: {field.value}</FormLabel>
                  <FormControl>
                    <Slider
                      value={[field.value]} // Slider value
                      onValueChange={(value) => field.onChange(value[0])} // Update form state
                      min={-100}
                      max={100}
                      step={1}
                    />
                  </FormControl>
                  <FormMessage className="pl-3" />
                </FormItem>
              )}
            />

            {/* Pitch Field */}
            <FormField
              control={form.control}
              name="pitch"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="pl-3">Pitch: {field.value}</FormLabel>
                  <FormControl>
                    <Slider
                      value={[field.value]} // Slider value
                      onValueChange={(value) => field.onChange(value[0])} // Update form state
                      min={-100}
                      max={100}
                      step={1}
                    />
                  </FormControl>
                  <FormMessage className="pl-3" />
                </FormItem>
              )}
            />
          </div>

          {/* Submit button */}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <AudioLines />
                Generate
              </>
            )}
          </Button>
        </form>
      </Form>
      <div className={`my-4 ${isLoading ? "block" : "hidden"}`}>
        <Progress
          value={progress}
          className="w-full mt-3 mx-auto bg-gray-200 h-[5px] rounded-full transition-all"
        />
      </div>
      <div className={`my-4 ${isLoading ? "hidden" : "block"}`}>
        {responseMessage && (
          <div className="pl-3 pb-4">
            <p>{responseMessage}</p>
          </div>
        )}
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

        {success && (
          <div className="w-full flex justify-center">
            <div className="w-[350px] xl:w-[500px]">
              <AudioPlayer src={`/output.mp3?key=${audioKey}`} />
              <Link href={`/output.mp3?key=${audioKey}`}>
                <Button>
                  <Download />
                  Download
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EdgeTTSForm;
