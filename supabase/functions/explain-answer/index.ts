import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      questionText, 
      userAnswer, 
      correctAnswer, 
      isCorrect,
      options,
      questionType,
      transcriptContext,
      passageContext,
      testType
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build options context if available
    let optionsText = '';
    if (options && Array.isArray(options) && options.length > 0) {
      optionsText = `\n\nAvailable Options:\n${options.map((opt: string, i: number) => 
        `${String.fromCharCode(65 + i)}. ${opt}`
      ).join('\n')}`;
    } else if (options && typeof options === 'object') {
      // Handle object format {A: "option1", B: "option2"}
      const optEntries = Object.entries(options);
      if (optEntries.length > 0) {
        optionsText = `\n\nAvailable Options:\n${optEntries.map(([key, val]) => 
          `${key}. ${val}`
        ).join('\n')}`;
      }
    }

    // Build transcript context for listening tests
    let transcriptText = '';
    if (transcriptContext && transcriptContext.trim()) {
      transcriptText = `\n\nRelevant Audio Transcript:\n"""${transcriptContext}"""`;
    }

    // Build passage context for reading tests
    let passageText = '';
    if (passageContext && passageContext.trim()) {
      passageText = `\n\nRelevant Reading Passage:\n"""${passageContext}"""`;
    }

    const testTypeLabel = testType === 'listening' ? 'IELTS Listening' : 'IELTS Reading';
    const questionTypeLabel = questionType ? ` (${questionType.replace(/_/g, ' ').toLowerCase()})` : '';

    // Special handling for Multiple Choice Multiple Answers
    const isMCQMultiple = questionType === 'MULTIPLE_CHOICE_MULTIPLE';
    
    let mcqMultipleGuidelines = '';
    if (isMCQMultiple) {
      const userAnswers: string[] = userAnswer ? userAnswer.split(',').map((a: string) => a.trim()) : [];
      const correctAnswersArr: string[] = correctAnswer ? correctAnswer.split(',').map((a: string) => a.trim()) : [];
      const correctOnes = userAnswers.filter((a: string) => correctAnswersArr.includes(a));
      const wrongOnes = userAnswers.filter((a: string) => !correctAnswersArr.includes(a));
      const missedOnes = correctAnswersArr.filter((a: string) => !userAnswers.includes(a));
      
      mcqMultipleGuidelines = `
This is a MULTIPLE CHOICE MULTIPLE ANSWERS question where the student must select ${correctAnswersArr.length} correct answers.
- Student selected: ${userAnswers.join(', ') || '(none)'}
- Correct answers are: ${correctAnswersArr.join(', ')}
- Correctly identified: ${correctOnes.join(', ') || '(none)'}
- Incorrectly selected: ${wrongOnes.join(', ') || '(none)'}
- Missed: ${missedOnes.join(', ') || '(none)'}

IMPORTANT: Address each selection individually. Explain why the correct answers are right, and if the student selected any wrong options, explain why those are incorrect.`;
    }

    const systemPrompt = `You are an expert ${testTypeLabel} tutor. Your task is to explain ${isCorrect ? 'why a student\'s answer was correct' : 'why a student\'s answer was incorrect'} in a helpful and educational way.

Guidelines:
- Be concise but thorough (4-6 sentences)
- ${isCorrect ? 'Explain what made this the correct answer and reinforce the key concept' : 'IMPORTANT: First explain specifically why the student\'s answer is wrong (what makes it incorrect, what concept they may have misunderstood). Then explain why the correct answer is right.'}
- ${!isCorrect && userAnswer ? 'Address the student\'s specific wrong answer directly - explain what that option/answer actually refers to and why it doesn\'t fit the question' : ''}
- ${testType === 'listening' ? 'If transcript context is provided, reference the specific part that contains the answer' : 'If passage context is provided, reference the specific part of the text that supports the answer'}
- If options are provided, explain why the correct option is right and briefly why the student\'s chosen option is wrong
- Provide helpful tips for similar questions in the future
- Be encouraging and supportive
- Use simple, clear language
- If the provided "correct answer" seems wrong or questionable, mention this and suggest the user report it to the admin
${mcqMultipleGuidelines}`;

    const contextReference = testType === 'listening' 
      ? (transcriptContext ? 'Reference the specific part of the transcript where the answer can be found.' : '')
      : (passageContext ? 'Reference the specific part of the passage where the answer can be found.' : '');

    const userPrompt = `Question Type: ${testTypeLabel}${questionTypeLabel}

Question: ${questionText}${optionsText}${transcriptText}${passageText}

Student's Answer: ${userAnswer || '(No answer provided)'}
Correct Answer: ${correctAnswer}

Please explain ${isCorrect ? 'why this answer is correct and what concept it demonstrates' : 'why the student\'s answer is wrong and why the correct answer is right'}. ${contextReference} Also, if you notice any issues with the provided correct answer, please mention that the user should report this issue to the admin.`;

    console.log("Generating explanation with context:", {
      questionType,
      testType,
      hasOptions: !!optionsText,
      hasTranscript: !!transcriptText,
      hasPassage: !!passageText,
      isCorrect
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const explanation = data.choices?.[0]?.message?.content || "Unable to generate explanation.";

    return new Response(
      JSON.stringify({ explanation }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in explain-answer function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
