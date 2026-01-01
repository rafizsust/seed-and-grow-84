import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Available TTS voices with accents for Listening tests
const TTS_VOICES = {
  US: ["Kore", "Charon", "Fenrir"],
  GB: ["Kore", "Aoede", "Puck"],
  AU: ["Kore", "Aoede", "Fenrir"],
  IN: ["Kore", "Charon", "Puck"],
};

const ALL_ACCENTS = Object.keys(TTS_VOICES) as Array<keyof typeof TTS_VOICES>;

function getRandomVoice(preferredAccent?: string): { voiceName: string; accent: string } {
  let accent: keyof typeof TTS_VOICES;
  
  if (preferredAccent && preferredAccent !== "random" && preferredAccent !== "mixed" && TTS_VOICES[preferredAccent as keyof typeof TTS_VOICES]) {
    accent = preferredAccent as keyof typeof TTS_VOICES;
  } else {
    accent = ALL_ACCENTS[Math.floor(Math.random() * ALL_ACCENTS.length)];
  }
  
  const voices = TTS_VOICES[accent];
  const voiceName = voices[Math.floor(Math.random() * voices.length)];
  return { voiceName, accent };
}

function getVoiceForMixedAccent(index: number): { voiceName: string; accent: string } {
  const accentIndex = index % ALL_ACCENTS.length;
  const accent = ALL_ACCENTS[accentIndex];
  const voices = TTS_VOICES[accent];
  const voiceName = voices[Math.floor(Math.random() * voices.length)];
  return { voiceName, accent };
}

// Retry helper with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.log(`Attempt ${attempt + 1} failed:`, lastError.message);
      
      if (attempt < maxRetries - 1) {
        const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 500;
        console.log(`Retrying in ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error("All retries failed");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: adminCheck } = await supabase
      .from("admin_users")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!adminCheck) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { module, topic, difficulty, quantity, accent } = await req.json();

    if (!module || !topic || !difficulty || !quantity) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!["listening", "speaking", "reading", "writing"].includes(module)) {
      return new Response(JSON.stringify({ error: "Invalid module" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!["easy", "medium", "hard"].includes(difficulty)) {
      return new Response(JSON.stringify({ error: "Invalid difficulty" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (quantity < 1 || quantity > 20) {
      return new Response(JSON.stringify({ error: "Quantity must be 1-20" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: job, error: jobError } = await supabase
      .from("bulk_generation_jobs")
      .insert({
        admin_user_id: user.id,
        module,
        topic,
        difficulty,
        quantity,
        status: "pending",
      })
      .select()
      .single();

    if (jobError) {
      console.error("Failed to create job:", jobError);
      return new Response(JSON.stringify({ error: "Failed to create job" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Start background processing
    processGenerationJob(supabase, job.id, module, topic, difficulty, quantity, accent).catch(console.error);

    return new Response(
      JSON.stringify({
        success: true,
        jobId: job.id,
        message: `Started generating ${quantity} ${module} tests for topic "${topic}"`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("bulk-generate-tests error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function processGenerationJob(
  supabase: any,
  jobId: string,
  module: string,
  topic: string,
  difficulty: string,
  quantity: number,
  accentPreference?: string
) {
  console.log(`[Job ${jobId}] Starting generation of ${quantity} ${module} tests`);

  await supabase
    .from("bulk_generation_jobs")
    .update({ status: "processing", started_at: new Date().toISOString() })
    .eq("id", jobId);

  let successCount = 0;
  let failureCount = 0;
  const errorLog: Array<{ index: number; error: string }> = [];

  for (let i = 0; i < quantity; i++) {
    try {
      console.log(`[Job ${jobId}] Processing test ${i + 1}/${quantity}`);
      
      const { voiceName, accent } = accentPreference === "mixed" 
        ? getVoiceForMixedAccent(i)
        : getRandomVoice(accentPreference);
      
      // Generate content with retry
      const content = await withRetry(() => generateContent(module, topic, difficulty), 3, 2000);
      
      if (!content) {
        throw new Error("Content generation failed - empty response");
      }

      let audioUrl: string | null = null;
      let sampleAudioUrl: string | null = null;

      // LISTENING: Generate audio using Gemini TTS with retry
      if (module === "listening") {
        const scriptText = content.script || 
          content.questions?.map((q: any) => q.text).join(". ") || 
          "";
        
        if (scriptText.trim()) {
          try {
            audioUrl = await withRetry(
              () => generateAndUploadGeminiAudio(scriptText, voiceName, jobId, i),
              3,
              3000
            );
          } catch (audioError) {
            console.error(`[Job ${jobId}] Listening audio failed for test ${i + 1}:`, audioError);
            // For Listening: DISCARD if audio fails (per requirements)
            throw new Error(`Audio generation failed: ${audioError instanceof Error ? audioError.message : "Unknown"}`);
          }
        }
      }

      // SPEAKING: Generate audio for instructions and questions
      // Uses Edge TTS (free) as primary, Gemini TTS as fallback
      if (module === "speaking") {
        console.log(`[Job ${jobId}] Speaking test - generating audio for instructions/questions`);
        
        try {
          const speakingAudioUrls = await withRetry(
            () => generateSpeakingAudio(content, voiceName, jobId, i),
            2,
            2000
          );
          
          // Store audio URLs in content
          if (speakingAudioUrls) {
            content.audioUrls = speakingAudioUrls;
          }
        } catch (audioError) {
          console.warn(`[Job ${jobId}] Speaking audio generation failed, will use browser TTS fallback:`, audioError);
          // Speaking tests can still work with browser TTS fallback, don't fail the test
          content.audioUrls = null;
          content.useBrowserTTS = true;
        }
      }

      // Save to generated_test_audio table
      const testData = {
        job_id: jobId,
        module,
        topic,
        difficulty,
        voice_id: voiceName,
        accent,
        content_payload: content,
        audio_url: audioUrl,
        sample_audio_url: sampleAudioUrl,
        transcript: content.script || null,
        status: module === "listening" && !audioUrl ? "failed" : "ready",
        is_published: false,
      };

      const { error: insertError } = await supabase
        .from("generated_test_audio")
        .insert(testData);

      if (insertError) {
        throw new Error(`Database insert failed: ${insertError.message}`);
      }

      successCount++;
      console.log(`[Job ${jobId}] Successfully created test ${i + 1}`);

      await supabase
        .from("bulk_generation_jobs")
        .update({ success_count: successCount, failure_count: failureCount })
        .eq("id", jobId);

    } catch (error) {
      failureCount++;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      errorLog.push({ index: i, error: errorMessage });
      console.error(`[Job ${jobId}] Failed test ${i + 1}:`, errorMessage);

      await supabase
        .from("bulk_generation_jobs")
        .update({ 
          success_count: successCount, 
          failure_count: failureCount,
          error_log: errorLog,
        })
        .eq("id", jobId);
    }

    // Delay between generations to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  await supabase
    .from("bulk_generation_jobs")
    .update({
      status: failureCount === quantity ? "failed" : "completed",
      success_count: successCount,
      failure_count: failureCount,
      error_log: errorLog,
      completed_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  console.log(`[Job ${jobId}] Completed: ${successCount} success, ${failureCount} failed`);
}

async function generateContent(module: string, topic: string, difficulty: string) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY not configured");
  }

  const prompts: Record<string, string> = {
    listening: `Generate an IELTS ${difficulty} difficulty Listening test about "${topic}".

Include:
1. A natural dialogue or monologue script (300-500 words) with natural pauses marked as "..." or [pause]
2. 10 questions based on the script (mix of multiple choice, fill-in-blank, matching)
3. Answer keys for all questions

Format as JSON:
{
  "script": "The full script with natural pauses...",
  "questions": [
    { "number": 1, "type": "multiple_choice", "text": "Question text", "options": ["A", "B", "C", "D"], "answer": "B" }
  ]
}`,

    speaking: `Generate an IELTS ${difficulty} difficulty Speaking test about "${topic}".

Format as JSON:
{
  "part1": {
    "questions": ["Question 1", "Question 2", "Question 3", "Question 4"],
    "sampleAnswers": ["Sample answer 1", "Sample answer 2", "Sample answer 3", "Sample answer 4"]
  },
  "part2": {
    "cueCard": "Describe a [topic]...\\nYou should say:\\n- point 1\\n- point 2\\n- point 3\\nAnd explain why...",
    "sampleAnswer": "A model answer (200-250 words)..."
  },
  "part3": {
    "questions": ["Discussion question 1", "Discussion question 2", "Discussion question 3"],
    "sampleAnswers": ["Sample answer 1", "Sample answer 2", "Sample answer 3"]
  }
}`,

    reading: `Generate an IELTS ${difficulty} difficulty Reading passage about "${topic}".

Include:
1. A passage (600-900 words) suitable for academic reading
2. 13 questions (mix of True/False/Not Given, matching headings, fill-in-blank)
3. Answer keys

Format as JSON:
{
  "title": "Passage title",
  "passage": "The full passage text...",
  "questions": [
    { "number": 1, "type": "tfng", "text": "Statement", "answer": "TRUE" }
  ]
}`,

    writing: `Generate an IELTS ${difficulty} difficulty Writing task about "${topic}".

Format as JSON:
{
  "task1": {
    "instruction": "The chart below shows...",
    "description": "Description of what to analyze",
    "modelAnswer": "A band 8-9 sample answer..."
  },
  "task2": {
    "instruction": "Some people believe that... To what extent do you agree or disagree?",
    "modelAnswer": "A band 8-9 sample essay..."
  }
}`,
  };

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: "You are an expert IELTS test creator. Generate high-quality, authentic exam content. Always respond with valid JSON only, no markdown code blocks.",
        },
        { role: "user", content: prompts[module] },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI generation failed: ${response.status} - ${errorText.slice(0, 200)}`);
  }

  const data = await response.json();
  const contentText = data.choices?.[0]?.message?.content;

  if (!contentText) {
    throw new Error("Empty AI response");
  }

  // Parse JSON from response (handle potential markdown wrapping)
  let jsonContent = contentText;
  if (contentText.includes("```json")) {
    jsonContent = contentText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
  } else if (contentText.includes("```")) {
    jsonContent = contentText.replace(/```\n?/g, "");
  }

  try {
    return JSON.parse(jsonContent.trim());
  } catch (parseError) {
    console.error("JSON parse error:", parseError, "Content:", jsonContent.slice(0, 500));
    throw new Error("Failed to parse AI response as JSON");
  }
}

// Generate speaking audio for instructions and questions
// Uses Edge TTS (free) as primary, Gemini TTS as fallback
async function generateSpeakingAudio(
  content: any,
  voiceName: string,
  jobId: string,
  index: number
): Promise<Record<string, string> | null> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  
  const audioUrls: Record<string, string> = {};
  const ttsItems: Array<{ key: string; text: string }> = [];
  
  // Collect all texts that need TTS
  // Part 1 instruction + questions
  if (content.part1) {
    if (content.part1.instruction) {
      ttsItems.push({ key: "part1_instruction", text: content.part1.instruction });
    }
    content.part1.questions?.forEach((q: string, idx: number) => {
      ttsItems.push({ key: `part1_q${idx + 1}`, text: q });
    });
  }
  
  // Part 2 instruction + cue card
  if (content.part2) {
    const part2Instruction = "Now, I'm going to give you a topic and I'd like you to talk about it for one to two minutes. Before you talk, you'll have one minute to think about what you're going to say. You can make some notes if you wish.";
    ttsItems.push({ key: "part2_instruction", text: part2Instruction });
    
    if (content.part2.cueCard) {
      const cueCardLines = content.part2.cueCard.split('\n');
      const topic = cueCardLines[0]?.replace(/^Describe\s+/i, '') || content.part2.cueCard;
      ttsItems.push({ key: "part2_cuecard_topic", text: `Your topic is: ${topic}` });
    }
    
    ttsItems.push({ 
      key: "part2_start_speaking", 
      text: "Your one minute preparation time is over. Please start speaking now. You have two minutes." 
    });
  }
  
  // Part 3 instruction + questions
  if (content.part3) {
    const part3Instruction = "We've been talking about the topic from Part 2. Now I'd like to discuss with you some more general questions related to this.";
    ttsItems.push({ key: "part3_instruction", text: part3Instruction });
    
    content.part3.questions?.forEach((q: string, idx: number) => {
      ttsItems.push({ key: `part3_q${idx + 1}`, text: q });
    });
  }
  
  // Ending message
  ttsItems.push({ 
    key: "test_ending", 
    text: "Thank you. That is the end of the speaking test." 
  });
  
  if (ttsItems.length === 0) {
    return null;
  }
  
  console.log(`[Job ${jobId}] Generating audio for ${ttsItems.length} speaking items`);
  
  // Try Edge TTS first (free)
  try {
    const edgeResponse = await fetch(`${supabaseUrl}/functions/v1/generate-edge-tts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: ttsItems,
        accent: "GB",
      }),
    });
    
    if (edgeResponse.ok) {
      const edgeData = await edgeResponse.json();
      
      if (edgeData.success && edgeData.clips?.length > 0) {
        const { uploadToR2 } = await import("../_shared/r2Client.ts");
        
        for (const clip of edgeData.clips) {
          const audioBytes = Uint8Array.from(atob(clip.audioBase64), c => c.charCodeAt(0));
          const key = `speaking-tests/${jobId}/${index}/${clip.key}.mp3`;
          
          const uploadResult = await uploadToR2(key, audioBytes, "audio/mpeg");
          if (uploadResult.success && uploadResult.url) {
            audioUrls[clip.key] = uploadResult.url;
          }
        }
        
        console.log(`[Job ${jobId}] Edge TTS generated ${Object.keys(audioUrls).length} audio files`);
        return Object.keys(audioUrls).length > 0 ? audioUrls : null;
      }
    }
    
    console.warn(`[Job ${jobId}] Edge TTS failed, trying Gemini TTS fallback`);
  } catch (edgeErr) {
    console.warn(`[Job ${jobId}] Edge TTS error:`, edgeErr);
  }
  
  // Fallback to Gemini TTS
  try {
    const geminiResponse = await fetch(`${supabaseUrl}/functions/v1/generate-gemini-tts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: ttsItems,
        voiceName,
      }),
    });
    
    if (!geminiResponse.ok) {
      throw new Error(`Gemini TTS failed: ${geminiResponse.status}`);
    }
    
    const geminiData = await geminiResponse.json();
    
    if (!geminiData.success || !geminiData.clips?.length) {
      throw new Error("No audio from Gemini TTS");
    }
    
    const { uploadToR2 } = await import("../_shared/r2Client.ts");
    
    for (const clip of geminiData.clips) {
      const pcmBytes = Uint8Array.from(atob(clip.audioBase64), c => c.charCodeAt(0));
      const wavBytes = createWavFromPcm(pcmBytes, clip.sampleRate || 24000);
      const key = `speaking-tests/${jobId}/${index}/${clip.key}.wav`;
      
      const uploadResult = await uploadToR2(key, wavBytes, "audio/wav");
      if (uploadResult.success && uploadResult.url) {
        audioUrls[clip.key] = uploadResult.url;
      }
    }
    
    console.log(`[Job ${jobId}] Gemini TTS fallback generated ${Object.keys(audioUrls).length} audio files`);
    return Object.keys(audioUrls).length > 0 ? audioUrls : null;
  } catch (geminiErr) {
    console.error(`[Job ${jobId}] Gemini TTS fallback also failed:`, geminiErr);
    throw geminiErr;
  }
}

async function generateAndUploadGeminiAudio(
  text: string,
  voiceName: string,
  jobId: string,
  index: number
): Promise<string> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  
  // Clean text for TTS
  const cleanText = text
    .replace(/\[pause\s*\d*s?\]/gi, "...")
    .replace(/\n+/g, " ")
    .slice(0, 5000) // Limit text length
    .trim();

  if (!cleanText) {
    throw new Error("Empty text for TTS");
  }

  // Call generate-gemini-tts function
  const response = await fetch(`${supabaseUrl}/functions/v1/generate-gemini-tts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${supabaseServiceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [{ key: `test_${index}`, text: cleanText }],
      voiceName,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini TTS failed: ${response.status} - ${errorText.slice(0, 200)}`);
  }

  const data = await response.json();
  
  if (!data.success || !data.clips?.[0]?.audioBase64) {
    throw new Error("No audio data in TTS response");
  }

  // Convert base64 PCM to WAV and upload to R2
  const pcmBase64 = data.clips[0].audioBase64;
  const sampleRate = data.clips[0].sampleRate || 24000;
  
  // Decode base64 to raw bytes
  const pcmBytes = Uint8Array.from(atob(pcmBase64), c => c.charCodeAt(0));
  
  // Create WAV file from PCM data
  const wavBytes = createWavFromPcm(pcmBytes, sampleRate);
  
  // Upload to R2
  const { uploadToR2 } = await import("../_shared/r2Client.ts");
  const key = `generated-tests/${jobId}/${index}.wav`;
  
  const uploadResult = await uploadToR2(key, wavBytes, "audio/wav");
  
  if (!uploadResult.success || !uploadResult.url) {
    throw new Error(uploadResult.error || "R2 upload failed");
  }

  return uploadResult.url;
}

function createWavFromPcm(pcmData: Uint8Array, sampleRate: number): Uint8Array {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmData.length;
  const headerSize = 44;
  const fileSize = headerSize + dataSize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // RIFF header
  writeString(view, 0, "RIFF");
  view.setUint32(4, fileSize - 8, true);
  writeString(view, 8, "WAVE");

  // fmt chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // audio format (PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data chunk
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  // Copy PCM data
  const wavBytes = new Uint8Array(buffer);
  wavBytes.set(pcmData, headerSize);

  return wavBytes;
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
