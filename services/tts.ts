import { Client } from "@gradio/client";

export enum TTSVoice {
  // American Female voices
  BELLA = "af_bella",
  NOVA = "af_nova",
  ALLOY = "af_alloy",
  AOEDE = "af_aoede",
  JESSICA = "af_jessica",
  KORE = "af_kore",
  NICOLE = "af_nicole",
  RIVER = "af_river",
  SARAH = "af_sarah",
  SKY = "af_sky",
  // American Male voices
  ADAM = "am_adam",
  ECHO = "am_echo",
  ERIC = "am_eric",
  FENRIR = "am_fenrir",
  LIAM = "am_liam",
  MICHAEL = "am_michael",
  ONYX = "am_onyx",
  PUCK = "am_puck",
  // Japanese voices
  ALPHA = "jf_alpha",
  GONGITSUNE = "jf_gongitsune",
  NEZUMI = "jf_nezumi",
  TEBUKURO = "jf_tebukuro",
  KUMO = "jm_kumo"
}


export class TTSService {
  private static client: any = null;

  private static async getClient() {
    if (!this.client) {
      try {
        this.client = await Client.connect("http://localhost:7860");
      } catch {
        this.client = null;
      }
    }
    return this.client;
  }

  // Fallback to browser TTS
  private static browserSpeak(text: string, rate: number = 1, voiceName?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!("speechSynthesis" in window)) return reject(new Error("Browser TTS not supported"));
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = rate;

      if (voiceName) {
        const voices = window.speechSynthesis.getVoices();
        const selected = voices.find(v => v.name === voiceName);
        if (selected) utter.voice = selected;
      }

      utter.onend = () => resolve();
      utter.onerror = (e) => reject(e.error || new Error("Browser TTS failed"));
      window.speechSynthesis.speak(utter);
    });
  }

  static async speak(text: string, voice: TTSVoice = TTSVoice.BELLA, speed: number = 1) {
    if (!text || typeof text !== "string") throw new Error("Invalid text input");
    speed = Math.max(0.5, Math.min(2.0, speed));
    const client = await this.getClient();

    if (client) {
      try {
        const result = await client.predict(
          "/generate_speech",
          [text.trim(), voice, speed],
          { api_name: "/generate_speech" }
        );
        const url = result?.data?.[1]?.url;
        if (!url) throw new Error("Invalid audio response");
        const audio = new Audio(url);
        return new Promise<void>((resolve, reject) => {
          audio.onloadeddata = () => {
            audio.play().then(() => {
              audio.onended = () => resolve();
            }).catch(reject);
          };
          audio.onerror = () => reject(new Error("Audio playback failed"));
          audio.play().then(() => {
            audio.onended = () => resolve();
          }).catch(() => { /* Wait for onloadeddata */ });
        });
      } catch (error) {
        console.warn("Remote TTS failed, falling back to browser TTS:", error);
        return this.browserSpeak(text, speed);
      }
    } else {
      return this.browserSpeak(text, speed);
    }
  }

  static async testVoice(voice: TTSVoice) {
    const client = await this.getClient();
    if (client) {
      try {
        const result = await client.predict(
          "/generate_speech",
          ["Test message", voice, 1.0],
          { api_name: "/generate_speech" }
        );
        console.log("Test result:", result);
        return result;
      } catch (error) {
        console.warn("Remote TTS test failed, falling back to browser TTS:", error);
        return this.browserSpeak("Test message", 1.0);
      }
    } else {
      return this.browserSpeak("Test message", 1.0);
    }
  }
}