import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Microsoft Edge TTS voices - free, high quality
const EDGE_TTS_VOICES = {
  US: [
    "en-US-GuyNeural",
    "en-US-JennyNeural",
    "en-US-AriaNeural",
  ],
  GB: [
    "en-GB-RyanNeural",
    "en-GB-SoniaNeural",
    "en-GB-LibbyNeural",
  ],
  AU: [
    "en-AU-WilliamNeural",
    "en-AU-NatashaNeural",
  ],
  IN: [
    "en-IN-PrabhatNeural",
    "en-IN-NeerjaNeural",
  ],
};

const ALL_ACCENTS = Object.keys(EDGE_TTS_VOICES) as Array<keyof typeof EDGE_TTS_VOICES>;

function getVoiceForAccent(accent?: string): string {
  let accentKey: keyof typeof EDGE_TTS_VOICES = "GB"; // Default to British
  
  if (accent && EDGE_TTS_VOICES[accent as keyof typeof EDGE_TTS_VOICES]) {
    accentKey = accent as keyof typeof EDGE_TTS_VOICES;
  }
  
  const voices = EDGE_TTS_VOICES[accentKey];
  return voices[Math.floor(Math.random() * voices.length)];
}

interface TtsItem {
  key: string;
  text: string;
}

interface TtsResult {
  key: string;
  text: string;
  audioBase64: string;
  sampleRate: number;
  format: string;
}

// Generate TTS using Microsoft Edge TTS (free, high quality)
async function generateEdgeTts(
  text: string,
  voice: string
): Promise<{ audioBase64: string; sampleRate: number; format: string }> {
  // Edge TTS API endpoint (unofficial but stable)
  // Uses the same endpoint that Edge browser uses
  const EDGE_TTS_URL = "https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1";
  
  // Generate unique request ID
  const requestId = crypto.randomUUID().replace(/-/g, "");
  
  // SSML template for Edge TTS
  const ssml = `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
      <voice name="${voice}">
        <prosody rate="0%" pitch="0%">
          ${escapeXml(text)}
        </prosody>
      </voice>
    </speak>
  `.trim();

  // WebSocket connection to Edge TTS
  const wsUrl = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4&ConnectionId=${requestId}`;
  
  return new Promise((resolve, reject) => {
    const audioChunks: Uint8Array[] = [];
    let ws: WebSocket | null = null;
    
    const timeout = setTimeout(() => {
      ws?.close();
      reject(new Error("Edge TTS timeout"));
    }, 30000);

    try {
      ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        // Send configuration
        const configMessage = `X-Timestamp:${new Date().toISOString()}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`;
        ws!.send(configMessage);
        
        // Send SSML request
        const ssmlMessage = `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${new Date().toISOString()}\r\nPath:ssml\r\n\r\n${ssml}`;
        ws!.send(ssmlMessage);
      };

      ws.onmessage = (event) => {
        if (typeof event.data === "string") {
          // Text message - check for end
          if (event.data.includes("Path:turn.end")) {
            clearTimeout(timeout);
            ws?.close();
            
            // Combine audio chunks
            const totalLength = audioChunks.reduce((acc, chunk) => acc + chunk.length, 0);
            const combined = new Uint8Array(totalLength);
            let offset = 0;
            for (const chunk of audioChunks) {
              combined.set(chunk, offset);
              offset += chunk.length;
            }
            
            // Convert to base64
            const base64 = btoa(String.fromCharCode(...combined));
            resolve({ audioBase64: base64, sampleRate: 24000, format: "mp3" });
          }
        } else if (event.data instanceof Blob) {
          // Binary audio data
          event.data.arrayBuffer().then((buffer) => {
            const data = new Uint8Array(buffer);
            // Skip header (first 2 bytes are header length)
            const headerEnd = data.indexOf(0) + 1;
            if (headerEnd > 0 && headerEnd < data.length) {
              audioChunks.push(data.slice(headerEnd));
            }
          });
        }
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        reject(new Error(`Edge TTS WebSocket error: ${error}`));
      };

      ws.onclose = () => {
        clearTimeout(timeout);
      };
    } catch (err) {
      clearTimeout(timeout);
      reject(err);
    }
  });
}

// Alternative: Use REST API approach (more reliable in Deno)
async function generateEdgeTtsRest(
  text: string,
  voice: string
): Promise<{ audioBase64: string; sampleRate: number; format: string }> {
  // Use a public Edge TTS proxy/API that wraps the WebSocket
  // For production, consider hosting your own edge-tts Python service
  
  // Fallback: Use browser-compatible approach via fetch
  const requestId = crypto.randomUUID().replace(/-/g, "");
  
  const ssml = `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
      <voice name="${voice}">
        <prosody rate="0%" pitch="0%">
          ${escapeXml(text)}
        </prosody>
      </voice>
    </speak>
  `.trim();

  // Try the REST endpoint first
  try {
    const response = await fetch(
      "https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?" +
      `TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4&ConnectionId=${requestId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        body: ssml,
      }
    );

    if (!response.ok) {
      throw new Error(`Edge TTS REST failed: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
    
    return { audioBase64: base64, sampleRate: 24000, format: "mp3" };
  } catch (err) {
    console.error("Edge TTS REST error:", err);
    throw err;
  }
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { items, accent, voice: voiceOverride }: { items: TtsItem[]; accent?: string; voice?: string } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "items[] is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const voice = voiceOverride || getVoiceForAccent(accent);
    console.log(`[generate-edge-tts] Processing ${items.length} items with voice: ${voice}`);

    const clips: TtsResult[] = [];

    for (const item of items) {
      if (!item?.key || !item?.text) continue;

      try {
        // Try REST approach first (more reliable in Deno)
        const result = await generateEdgeTtsRest(item.text, voice);
        clips.push({
          key: item.key,
          text: item.text,
          ...result,
        });
        console.log(`[generate-edge-tts] Generated audio for: ${item.key}`);
      } catch (err) {
        console.error(`[generate-edge-tts] Failed for ${item.key}:`, err);
        // Continue with other items
      }
      
      // Small delay between requests to avoid rate limiting
      await new Promise(r => setTimeout(r, 200));
    }

    if (clips.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "No audio generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, clips, voice }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[generate-edge-tts] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
