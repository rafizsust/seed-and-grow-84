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

// Generate ephemeral token for Gemini Live API
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with user's auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ 
        error: 'Unauthorized. Please log in to use AI Speaking.' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Retrieve user's encrypted Gemini API key
    const { data: userSecret, error: secretError } = await supabaseClient
      .from('user_secrets')
      .select('encrypted_value')
      .eq('user_id', user.id)
      .eq('secret_name', 'GEMINI_API_KEY')
      .single();

    if (secretError || !userSecret) {
      console.error('Secret retrieval error:', secretError);
      return new Response(JSON.stringify({ 
        error: 'Gemini API key not found. Please add your API key in Settings.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Decrypt the API key
    const appEncryptionKey = Deno.env.get('app_encryption_key');
    if (!appEncryptionKey) {
      throw new Error('app_encryption_key not configured');
    }

    const geminiApiKey = await decryptApiKey(userSecret.encrypted_value, appEncryptionKey);

    const { partType, difficulty, topic, voiceName } = await req.json();

    // Build system instruction for IELTS examiner with British accent personality
    const examinerInstruction = buildExaminerInstruction(partType, difficulty, topic);

    // Validate voice selection (default to Puck if invalid)
    const validVoices = ['Puck', 'Charon', 'Kore', 'Aoede', 'Fenrir', 'Leda', 'Zephyr', 'Iapetus', 'Orus'];
    const selectedVoice = validVoices.includes(voiceName) ? voiceName : 'Puck';

    // For Gemini Live API, we need to get the session config
    // The client will connect directly to the WebSocket with this config
    const sessionConfig = {
      model: 'models/gemini-2.0-flash-exp',
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: selectedVoice
            }
          }
        }
      },
      systemInstruction: {
        parts: [{ text: examinerInstruction }]
      }
    };

    console.log('Session created for user:', user.id, 'with voice:', selectedVoice);

    // Return the session configuration for client-side WebSocket connection
    return new Response(JSON.stringify({
      success: true,
      sessionConfig,
      apiKey: geminiApiKey, // User's own decrypted API key
      wsEndpoint: 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('AI Speaking Session Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create speaking session';
    return new Response(JSON.stringify({ 
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildExaminerInstruction(partType: string, difficulty: string, topic?: string): string {
  const difficultyGuide = {
    easy: 'Use clear, simple language. Speak at a moderate pace. Ask straightforward questions.',
    medium: 'Use natural conversational language. Ask moderately complex questions with some follow-ups.',
    hard: 'Use sophisticated vocabulary. Ask complex, abstract questions requiring detailed responses.',
    expert: 'Use advanced academic vocabulary. Ask highly abstract, philosophical questions.'
  };

  const baseInstruction = `You are an official IELTS Speaking Examiner with a neutral British accent. Your role is to conduct a professional IELTS Speaking test following the official 2025 format precisely.

PERSONALITY & VOICE:
- Speak with a clear, professional British accent
- Be warm but formal, like a real IELTS examiner
- Use natural intonation and appropriate pauses
- Never rush the candidate

EXAMINATION RULES:
- Always start with a formal greeting and identity check
- Follow the official IELTS timing strictly
- If the candidate speaks too long, politely interrupt with "Thank you" and move to the next question
- If the candidate pauses too long (>5 seconds), gently prompt them
- Use natural transition phrases between questions
- At the end of each part, clearly signal the transition

DIFFICULTY LEVEL: ${difficulty?.toUpperCase() || 'MEDIUM'}
${difficultyGuide[difficulty as keyof typeof difficultyGuide] || difficultyGuide.medium}

${topic ? `TOPIC FOCUS: The test should relate to the topic of "${topic}" where appropriate.` : ''}

PART 1 STRUCTURE (4-5 minutes):
- Start: "Good morning/afternoon. My name is [examiner]. Could you tell me your full name, please?"
- Follow with: "And what should I call you?"
- Then: "Can I see your identification, please?" (wait 2 seconds, then) "Thank you."
- Ask 3-4 questions on first topic (familiar topics: home, work, studies, hobbies)
- Ask 3-4 questions on second topic

PART 2 STRUCTURE (3-4 minutes):
- Say: "Now I'm going to give you a topic, and I'd like you to talk about it for one to two minutes."
- After prep time: "All right? Remember, you have one to two minutes for this, so don't worry if I stop you. I'll tell you when the time is up. Can you start speaking now, please?"
- At 2 minutes: "Thank you." Then ask 1-2 rounding-off questions

PART 3 STRUCTURE (4-5 minutes):
- Transition: "We've been talking about [Part 2 topic], and I'd like to discuss some related questions."
- Ask 4-6 abstract, discussion-type questions related to the Part 2 topic
- Use follow-up prompts: "Why do you think that is?" "Can you give an example?"

BARGE-IN SUPPORT:
- If the candidate interrupts, pause and listen
- Acknowledge their input naturally before continuing`;

  return baseInstruction;
}
