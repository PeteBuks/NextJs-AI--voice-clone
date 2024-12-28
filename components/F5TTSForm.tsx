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
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import AudioPlayer from "./AudioPlayer";
import Link from "next/link";
import { Loader2, AudioLines, Download } from "lucide-react";
import { Input } from "./ui/input";

const formSchema = z.object({
  gen_text: z.string().min(5, {
    message: "Generated text must be at least 5 characters.",
  }),
  ref_text: z.string().min(5, {
    message: "Generated text must be at least 5 characters.",
  }),
  ref_file: z.any(),
});

const F5TTSForm = () => {
  // State management
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [responseMessage, setResponseMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [audioSrc, setAudioSrc] = useState<string>("");

  const [success, setSuccess] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gen_text: "",
      ref_text: "",
      ref_file: null,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setProgress(0);
    setIsLoading(true);

    // Progress bar stimulation
    setTimeout(() => setProgress(20), 500);
    setTimeout(() => setProgress(60), 1500);
    setTimeout(() => setProgress(90), 2500);

    try {
      const response = await fetch("/api/f5-tts-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed with status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      setAudioSrc(url);

      setProgress(100);
      setResponseMessage("Audio Generated successful!");
      setSuccess(true);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to submit the form. Please try again.");
      setSuccess(false);
      setProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-6"
        >
          <FormField
            control={form.control}
            name="gen_text"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="pl-3">Generated Text</FormLabel>
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

          <FormField
            control={form.control}
            name="ref_file"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="pl-3">Reference Audio</FormLabel>
                <FormControl>
                  <input
                    type="file"
                    accept="audio/"
                    onChange={field.onChange}
                    required
                  />
                </FormControl>
                <FormDescription className="pl-3"></FormDescription>
                <FormMessage className="pl-3" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ref_text"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="pl-3">Reference Text</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Input your text for generation"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="pl-3"></FormDescription>
                <FormMessage className="pl-3" />
              </FormItem>
            )}
          />

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

      {/* Progress Bar */}
      <div className={`my-4 ${isLoading ? "block" : "hidden"}`}>
        <Progress
          value={progress}
          className="w-full mt-3 mx-auto bg-gray-200 h-[5px] rounded-full transition-all"
        />
      </div>

      {/* Response/Error Message */}
      <div className={`my-4 ${isLoading ? "hidden" : "block"}`}>
        {responseMessage && (
          <div className="pl-3 pb-4">
            <p>{responseMessage}</p>
          </div>
        )}
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

        {/* Audio Player */}
        {success === true && (
          <div className="w-full flex justify-center">
            <div className="w-[350px] xl:w-[500px]">
              <AudioPlayer src={audioSrc} />
              <Link href={audioSrc} download={"output.wav"}>
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

export default F5TTSForm;
