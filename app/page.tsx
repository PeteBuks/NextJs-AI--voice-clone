import EdgeTtsForm from "@/components/EdgeTTSForm";
import F5TTSForm from "@/components/F5TTSForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <div className="p-5 mx-auto">
      <div className="container flex flex-col justify-center items-center gap-4">
        <h2 className="font-bold">TTS Generation</h2>
        <div>
          <Tabs defaultValue="Edge tts" className="w-[350px] lg:w-[500px]">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="Edge tts">Edge TTS</TabsTrigger>
              <TabsTrigger value="F5 tts">F5 Voice Clone</TabsTrigger>
            </TabsList>
            <TabsContent value="Edge tts">
              <EdgeTtsForm />
            </TabsContent>
            <TabsContent value="F5 tts">
              <F5TTSForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
