import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Decrypt user's Gemini API key
async function decryptApiKey(encryptedValue: string, encryptionKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  
  const combined = Uint8Array.from(atob(encryptedValue), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const encryptedData = combined.slice(12);
  
  const keyData = encoder.encode(encryptionKey);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData.slice(0, 32),
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );
  
  const decryptedData = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    encryptedData
  );
  
  return decoder.decode(decryptedData);
}

// IELTS Topics for random selection
const IELTS_TOPICS = [
  'Climate change and environmental conservation',
  'The impact of technology on modern society',
  'Education systems around the world',
  'Health and wellness in the 21st century',
  'Urbanization and city planning',
  'Wildlife conservation and biodiversity',
  'The role of art and culture in society',
  'Space exploration and scientific discovery',
  'Global tourism and its effects',
  'Sustainable energy solutions',
  'Ancient civilizations and archaeology',
  'Marine ecosystems and ocean conservation',
  'The future of transportation',
  'Digital communication and social media',
  'Food security and agriculture',
];

// Listening scenario types
const LISTENING_SCENARIOS = [
  { type: 'conversation', description: 'a casual conversation between two people' },
  { type: 'lecture', description: 'a short educational lecture or presentation' },
  { type: 'interview', description: 'an interview about a specific topic' },
  { type: 'tour', description: 'a guided tour of a facility or location' },
  { type: 'phone_call', description: 'a phone conversation about booking or inquiry' },
];

// Available TTS voices
const VOICES = {
  male: ['Kore', 'Orus', 'Fenrir', 'Charon'],
  female: ['Puck', 'Zephyr', 'Leda', 'Aoede'],
};

// Gemini models to try (with fallback)
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

async function callGemini(apiKey: string, prompt: string): Promise<string | null> {
  for (const model of GEMINI_MODELS) {
    try {
      console.log(`Trying Gemini model: ${model}`);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 8192,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Gemini ${model} failed:`, JSON.stringify(errorData));
        if (response.status === 429) continue; // Rate limited, try next
        continue;
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        console.log(`Success with ${model}`);
        return text;
      }
    } catch (err) {
      console.error(`Error with ${model}:`, err);
      continue;
    }
  }
  return null;
}

// Generate TTS audio using Gemini
async function generateAudio(apiKey: string, script: string): Promise<{ audioBase64: string; sampleRate: number } | null> {
  try {
    console.log("Generating TTS audio...");
    
    const ttsPrompt = `Read the following conversation slowly and clearly, as if for a language listening test. 
Use a moderate speaking pace with natural pauses between sentences. 
Pause briefly (about 1-2 seconds) after each speaker finishes their turn.
Speaker1 and Speaker2 should have distinct, clear voices:

${script}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: ttsPrompt }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              multiSpeakerVoiceConfig: {
                speakerVoiceConfigs: [
                  { speaker: "Speaker1", voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } },
                  { speaker: "Speaker2", voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } } },
                ],
              },
            },
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("TTS failed:", await response.text());
      return null;
    }

    const data = await response.json();
    const audioData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (audioData) {
      return { audioBase64: audioData, sampleRate: 24000 };
    }
  } catch (err) {
    console.error("TTS error:", err);
  }
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting generate-ai-practice function");
    
    // Auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get API key
    const { data: secretData } = await supabaseClient
      .from('user_secrets')
      .select('encrypted_value')
      .eq('user_id', user.id)
      .eq('secret_name', 'GEMINI_API_KEY')
      .single();

    if (!secretData) {
      return new Response(JSON.stringify({ 
        error: 'Gemini API key not found. Please add your API key in Settings.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const appEncryptionKey = Deno.env.get('app_encryption_key');
    if (!appEncryptionKey) throw new Error('Encryption key not configured');
    
    const geminiApiKey = await decryptApiKey(secretData.encrypted_value, appEncryptionKey);

    // Parse request
    const { module, questionType, difficulty, topicPreference, questionCount, timeMinutes } = await req.json();
    
    const topic = topicPreference || IELTS_TOPICS[Math.floor(Math.random() * IELTS_TOPICS.length)];
    const testId = crypto.randomUUID();

    console.log(`Generating ${module} test: ${questionType}, ${difficulty}, topic: ${topic}`);

    if (module === 'reading') {
      // Generate Reading Test
      const readingPrompt = `Generate an IELTS Academic Reading test with the following specifications:

Topic: ${topic}
Question Type: ${questionType}
Difficulty: ${difficulty} (${difficulty === 'easy' ? 'Band 5-6' : difficulty === 'medium' ? 'Band 6-7' : 'Band 7-8'})
Number of Questions: ${questionCount}

Requirements:
1. Create a reading passage of 600-800 words that is:
   - Academic in tone and style
   - Well-structured with clear paragraphs (label them A, B, C, etc.)
   - Contains specific information that can be tested
   - Appropriate for the ${difficulty} difficulty level

2. Create ${questionCount} ${questionType.replace(/_/g, ' ')} questions based on the passage

3. For each question, provide:
   - The question text
   - The correct answer
   - A brief explanation of why this is correct

Return ONLY valid JSON in this exact format:
{
  "passage": {
    "title": "The title of the passage",
    "content": "The full passage text with paragraph labels like [A], [B], etc."
  },
  "instruction": "The instruction text for this question type",
  "questions": [
    {
      "question_number": 1,
      "question_text": "The question text",
      "correct_answer": "The correct answer",
      "explanation": "Why this is the correct answer",
      "options": ["A", "B", "C", "D"] // Only for MULTIPLE_CHOICE type
    }
  ]
}`;

      const result = await callGemini(geminiApiKey, readingPrompt);
      if (!result) {
        return new Response(JSON.stringify({ error: 'Failed to generate reading test' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Parse JSON from result
      let parsed;
      try {
        // Extract JSON from potential markdown code blocks
        const jsonMatch = result.match(/```(?:json)?\s*([\s\S]*?)```/);
        const jsonStr = jsonMatch ? jsonMatch[1].trim() : result.trim();
        parsed = JSON.parse(jsonStr);
      } catch (e) {
        console.error("Failed to parse Gemini response:", e, result);
        return new Response(JSON.stringify({ error: 'Failed to parse generated content' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        testId,
        topic,
        passage: {
          id: crypto.randomUUID(),
          title: parsed.passage.title,
          content: parsed.passage.content,
          passage_number: 1,
        },
        questionGroups: [{
          id: crypto.randomUUID(),
          instruction: parsed.instruction || `Questions 1-${questionCount}`,
          question_type: questionType,
          start_question: 1,
          end_question: questionCount,
          options: questionType === 'MULTIPLE_CHOICE' ? { options: ['A', 'B', 'C', 'D'] } : undefined,
          questions: parsed.questions.map((q: any, i: number) => ({
            id: crypto.randomUUID(),
            question_number: q.question_number || i + 1,
            question_text: q.question_text,
            question_type: questionType,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
            options: q.options,
          })),
        }],
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (module === 'listening') {
      // Generate Listening Test
      const scenario = LISTENING_SCENARIOS[Math.floor(Math.random() * LISTENING_SCENARIOS.length)];
      
      const listeningPrompt = `Generate an IELTS Listening test section with the following specifications:

Topic: ${topic}
Scenario: ${scenario.description}
Question Type: ${questionType}
Difficulty: ${difficulty} (${difficulty === 'easy' ? 'Band 5-6' : difficulty === 'medium' ? 'Band 6-7' : 'Band 7-8'})
Number of Questions: ${questionCount}

Requirements:
1. Create a dialogue script between Speaker1 and Speaker2 that is:
   - 200-300 words total
   - Natural and conversational
   - Contains specific details that can be tested (names, numbers, dates, locations)
   - Format each line as: "Speaker1: dialogue text" or "Speaker2: dialogue text"

2. Create ${questionCount} ${questionType.replace(/_/g, ' ')} questions based on the dialogue

3. For each question, provide:
   - The question text
   - The correct answer (exactly as spoken in the dialogue)
   - A brief explanation

Return ONLY valid JSON in this exact format:
{
  "dialogue": "Speaker1: Hello...\\nSpeaker2: Hi...",
  "instruction": "The instruction text for this question type",
  "questions": [
    {
      "question_number": 1,
      "question_text": "The question text",
      "correct_answer": "The correct answer",
      "explanation": "Why this is the correct answer",
      "options": ["A", "B", "C", "D"] // Only for MULTIPLE_CHOICE types
    }
  ]
}`;

      const result = await callGemini(geminiApiKey, listeningPrompt);
      if (!result) {
        return new Response(JSON.stringify({ error: 'Failed to generate listening test' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let parsed;
      try {
        const jsonMatch = result.match(/```(?:json)?\s*([\s\S]*?)```/);
        const jsonStr = jsonMatch ? jsonMatch[1].trim() : result.trim();
        parsed = JSON.parse(jsonStr);
      } catch (e) {
        console.error("Failed to parse Gemini response:", e, result);
        return new Response(JSON.stringify({ error: 'Failed to parse generated content' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Generate audio
      const audio = await generateAudio(geminiApiKey, parsed.dialogue);

      return new Response(JSON.stringify({
        testId,
        topic,
        transcript: parsed.dialogue,
        audioBase64: audio?.audioBase64 || null,
        audioFormat: audio ? 'pcm' : null,
        sampleRate: audio?.sampleRate || null,
        questionGroups: [{
          id: crypto.randomUUID(),
          instruction: parsed.instruction || `Questions 1-${questionCount}`,
          question_type: questionType,
          start_question: 1,
          end_question: questionCount,
          options: questionType.includes('MULTIPLE_CHOICE') || questionType === 'MATCHING_CORRECT_LETTER' 
            ? { options: parsed.questions[0]?.options || ['A', 'B', 'C', 'D'] } 
            : undefined,
          questions: parsed.questions.map((q: any, i: number) => ({
            id: crypto.randomUUID(),
            question_number: q.question_number || i + 1,
            question_text: q.question_text,
            question_type: questionType,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
            options: q.options,
          })),
        }],
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid module' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Edge Function error:', error.message, error.stack);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
