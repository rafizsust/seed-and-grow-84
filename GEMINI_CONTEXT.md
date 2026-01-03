# IELTS Dhaka - Project Context for External Architect

Generated: 2026-01-03

---

## 1. Project File Tree

### src/
```
src/
├── assets/
│   └── hero-bg.jpg
├── components/
│   ├── admin/
│   │   ├── AudioTimestampEditor.tsx
│   │   ├── FlowchartCompletionEditor.tsx
│   │   ├── FullListeningTestPreview.tsx
│   │   ├── FullTestPreview.tsx
│   │   ├── GeneratedTestPreview.tsx
│   │   ├── ListeningAudioUploader.tsx
│   │   ├── ListeningImageUploader.tsx
│   │   ├── ListeningQuestionGroupEditor.tsx
│   │   ├── ListeningQuestionGroupPreview.tsx
│   │   ├── ListeningTableEditor.tsx
│   │   ├── MapLabelingEditor.tsx
│   │   ├── MultiSelectAnswerInput.tsx
│   │   ├── MultipleAnswersInput.tsx
│   │   ├── NoteStyleCategoryEditor.tsx
│   │   ├── PassageEditor.tsx
│   │   ├── QuestionGroupEditor.tsx
│   │   ├── QuestionGroupPreview.tsx
│   │   ├── ReadingTableEditor.tsx
│   │   ├── RichTextEditor.tsx
│   │   ├── SpeakingPart1Editor.tsx
│   │   ├── SpeakingPart2Editor.tsx
│   │   ├── SpeakingPart3Editor.tsx
│   │   └── WritingImageUploader.tsx
│   ├── auth/
│   │   ├── GeminiApiKeyOnboarding.tsx
│   │   └── TermsAndConditions.tsx
│   ├── common/
│   │   ├── AILoadingScreen.tsx
│   │   ├── AddToFlashcardButton.tsx
│   │   ├── ApiErrorDialog.tsx
│   │   ├── CreditDisplay.tsx
│   │   ├── ExitTestConfirmDialog.tsx
│   │   ├── FlashcardQuickPractice.tsx
│   │   ├── GeminiQuotaDisplay.tsx
│   │   ├── IELTSVisualRenderer.tsx
│   │   ├── NoteSidebar.tsx
│   │   ├── ProgressOverlayFlashcard.tsx
│   │   ├── PullToRefreshIndicator.tsx
│   │   ├── QuestionNumberBadge.tsx
│   │   ├── QuestionTextWithTools.tsx
│   │   ├── QuotaWarningDialog.tsx
│   │   ├── RestoreTestStateDialog.tsx
│   │   ├── SafeAudioPlayer.tsx
│   │   ├── SafeSVG.tsx
│   │   ├── ScrollProgressIndicator.tsx
│   │   ├── SelectableCard.tsx
│   │   ├── SubmitConfirmDialog.tsx
│   │   ├── TestEntryOverlay.tsx
│   │   └── TestStartOverlay.tsx
│   ├── listening/
│   │   ├── questions/
│   │   │   ├── __tests__/
│   │   │   │   ├── DragAndDropOptions.test.tsx
│   │   │   │   └── MapLabeling.test.tsx
│   │   │   ├── DragAndDropOptions.tsx
│   │   │   ├── FillInBlank.tsx
│   │   │   ├── FlowchartCompletion.tsx
│   │   │   ├── ListeningTableCompletion.tsx
│   │   │   ├── MapLabeling.tsx
│   │   │   ├── MapLabelingTable.tsx
│   │   │   ├── Maps.tsx
│   │   │   ├── MatchingCorrectLetter.tsx
│   │   │   ├── MultipleChoiceMultipleQuestions.tsx
│   │   │   ├── NoteStyleFillInBlank.tsx
│   │   │   └── index.ts
│   │   ├── AudioPlayOverlay.tsx
│   │   ├── ListeningAudioPlayer.tsx
│   │   ├── ListeningAudioPlayerSafe.tsx
│   │   ├── ListeningNavigation.tsx
│   │   ├── ListeningQuestions.tsx
│   │   ├── ListeningTestControls.tsx
│   │   ├── ListeningTimer.tsx
│   │   ├── MultiPartAudioPlayer.tsx
│   │   ├── SeamlessAudioPlayer.tsx
│   │   ├── SimulatedAudioPlayer.tsx
│   │   ├── TranscriptViewer.tsx
│   │   ├── WebAudioScheduledPlayer.tsx
│   │   ├── WebAudioScheduledPlayerSafe.tsx
│   │   └── index.ts
│   ├── reading/
│   │   ├── questions/
│   │   │   ├── __tests__/
│   │   │   │   ├── MatchingHeadingsDragDrop.test.tsx
│   │   │   │   └── SummaryWordBank.test.tsx
│   │   │   ├── FillInBlank.tsx
│   │   │   ├── FlowchartCompletion.tsx
│   │   │   ├── MapLabeling.tsx
│   │   │   ├── MapLabelingTable.tsx
│   │   │   ├── MatchingFeatures.tsx
│   │   │   ├── MatchingHeadings.tsx
│   │   │   ├── MatchingHeadingsDragDrop.tsx
│   │   │   ├── MatchingInformation.tsx
│   │   │   ├── MatchingInformationGrid.tsx
│   │   │   ├── MatchingSentenceEndingsDragDrop.tsx
│   │   │   ├── MultipleChoice.tsx
│   │   │   ├── MultipleChoiceMultiple.tsx
│   │   │   ├── MultipleChoiceSingle.tsx
│   │   │   ├── NoteCompletion.tsx
│   │   │   ├── ReadingTableCompletion.tsx
│   │   │   ├── SentenceCompletion.tsx
│   │   │   ├── ShortAnswer.tsx
│   │   │   ├── SummaryCompletion.tsx
│   │   │   ├── SummaryWordBank.tsx
│   │   │   ├── TableCompletion.tsx
│   │   │   ├── TableSelection.tsx
│   │   │   ├── TrueFalseNotGiven.tsx
│   │   │   └── index.ts
│   │   ├── ImportToFlashcardDialog.tsx
│   │   ├── ReadingNavigation.tsx
│   │   ├── ReadingPassage.tsx
│   │   ├── ReadingQuestions.tsx
│   │   ├── ReadingTimer.tsx
│   │   ├── TestControls.tsx
│   │   ├── TestOptionsMenu.tsx
│   │   └── WordSelectionToolbar.tsx
│   ├── speaking/
│   │   ├── AIExaminerAvatar.tsx
│   │   ├── MicrophoneTest.tsx
│   │   ├── SpeakingExamStateMachine.tsx
│   │   ├── SpeakingTestControls.tsx
│   │   ├── SpeakingTimer.tsx
│   │   └── index.ts
│   ├── test-list/
│   │   ├── BookSection.tsx
│   │   ├── BookSectionNew.tsx
│   │   ├── QuestionTypeBadge.tsx
│   │   ├── QuestionTypeFilter.tsx
│   │   ├── TestAccordion.tsx
│   │   ├── TestPartCard.tsx
│   │   └── index.ts
│   ├── ui/ (shadcn components)
│   │   └── [accordion, alert-dialog, avatar, badge, button, card, etc.]
│   ├── user/
│   │   └── GeminiApiKeyManager.tsx
│   ├── writing/
│   │   ├── WritingInputPanel.tsx
│   │   ├── WritingTaskDisplay.tsx
│   │   ├── WritingTestControls.tsx
│   │   └── WritingTimer.tsx
│   ├── CTA.tsx
│   ├── DevelopmentBanner.tsx
│   ├── FAQ.tsx
│   ├── Features.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx
│   ├── HowItWorks.tsx
│   ├── NavLink.tsx
│   ├── Navbar.tsx
│   ├── Pricing.tsx
│   ├── Testimonials.tsx
│   └── WhySection.tsx
├── hooks/
│   ├── use-mobile.tsx
│   ├── use-toast.ts
│   ├── useAIGenerationWithFallback.tsx
│   ├── useAccessControl.tsx
│   ├── useAdminAccess.tsx
│   ├── useAudioClipQueue.ts
│   ├── useAuth.tsx
│   ├── useFullscreenTest.tsx
│   ├── useGeminiLiveAudio.ts
│   ├── useGeminiSpeaking.ts
│   ├── useHighlightNotes.tsx
│   ├── usePullToRefresh.tsx
│   ├── useSmartTestSelection.tsx
│   ├── useSmartTopicCycle.tsx
│   ├── useSpeechRecognition.ts
│   ├── useSpeechSynthesis.ts
│   ├── useSwipeGesture.tsx
│   ├── useTTSFallback.tsx
│   ├── useTestStatePreservation.tsx
│   ├── useTopicCompletions.tsx
│   └── useUserTestScores.tsx
├── integrations/
│   └── supabase/
│       ├── client.ts
│       └── types.ts
├── lib/
│   ├── audio/
│   │   └── pcmToWav.ts
│   ├── apiErrors.ts
│   ├── ieltsAnswerValidation.ts
│   ├── ieltsTopics.ts
│   ├── r2Upload.ts
│   ├── sounds.ts
│   ├── storage.ts
│   └── utils.ts
├── pages/
│   ├── admin/
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminLayout.tsx
│   │   ├── AdminSettings.tsx
│   │   ├── ListeningTestEditor.tsx
│   │   ├── ListeningTestsAdmin.tsx
│   │   ├── PromotionCodesAdmin.tsx
│   │   ├── ReadingTestEditor.tsx
│   │   ├── ReadingTestsAdmin.tsx
│   │   ├── SpeakingTestEditor.tsx
│   │   ├── SpeakingTestsAdmin.tsx
│   │   ├── TestBankAdmin.tsx
│   │   ├── TestFactoryAdmin.tsx
│   │   ├── WritingTestEditor.tsx
│   │   └── WritingTestsAdmin.tsx
│   ├── AIPractice.tsx
│   ├── AIPracticeHistory.tsx
│   ├── AIPracticeListeningTest.tsx
│   ├── AIPracticeReadingTest.tsx
│   ├── AIPracticeResults.tsx
│   ├── AIPracticeSpeakingConfig.tsx
│   ├── AIPracticeSpeakingTest.tsx
│   ├── AIPracticeTest.tsx
│   ├── AIPracticeWritingTest.tsx
│   ├── AISpeakingResults.tsx
│   ├── AIWritingResults.tsx
│   ├── Analytics.tsx
│   ├── AnalyticsDemo.tsx
│   ├── Auth.tsx
│   ├── Flashcards.tsx
│   ├── FullMockTest.tsx
│   ├── GenerateListeningPOC.tsx
│   ├── Index.tsx
│   ├── ListeningTest.tsx
│   ├── ListeningTestList.tsx
│   ├── NotFound.tsx
│   ├── Onboarding.tsx
│   ├── PassageStudy.tsx
│   ├── ReadingTest.tsx
│   ├── ReadingTestList.tsx
│   ├── Settings.tsx
│   ├── SpeakingEvaluationReport.tsx
│   ├── SpeakingTest.tsx
│   ├── SpeakingTestList.tsx
│   ├── TestComparison.tsx
│   ├── TestResults.tsx
│   ├── WritingEvaluationReport.tsx
│   ├── WritingTest.tsx
│   └── WritingTestList.tsx
├── test/
│   └── setup.ts
├── types/
│   └── aiPractice.ts
├── App.css
├── App.tsx
├── index.css
├── main.tsx
├── tailwind.config.lov.json
└── vite-env.d.ts
```

### supabase/
```
supabase/
├── functions/
│   ├── _shared/
│   │   └── r2Client.ts
│   ├── admin-listening-action/
│   │   └── index.ts
│   ├── ai-speaking-session/
│   │   └── index.ts
│   ├── analyze-listening-audio/
│   │   └── index.ts
│   ├── analyze-performance/
│   │   └── index.ts
│   ├── bulk-generate-tests/
│   │   └── index.ts
│   ├── evaluate-ai-practice-writing/
│   │   └── index.ts
│   ├── evaluate-ai-speaking-part/
│   │   └── index.ts
│   ├── evaluate-ai-speaking/
│   │   └── index.ts
│   ├── evaluate-speaking-submission/
│   │   └── index.ts
│   ├── evaluate-writing-submission/
│   │   └── index.ts
│   ├── explain-answer-followup/
│   │   └── index.ts
│   ├── explain-answer/
│   │   └── index.ts
│   ├── gemini-quota/
│   │   └── index.ts
│   ├── generate-ai-practice/
│   │   └── index.ts
│   ├── generate-gemini-tts/
│   │   └── index.ts
│   ├── generate-listening-audio/
│   │   └── index.ts
│   ├── get-job-status/
│   │   └── index.ts
│   ├── get-smart-test/
│   │   └── index.ts
│   ├── import-full-listening-test/
│   │   └── index.ts
│   ├── import-listening-audio/
│   │   └── index.ts
│   ├── publish-generated-tests/
│   │   └── index.ts
│   ├── set-user-gemini-api-key/
│   │   └── index.ts
│   ├── transcribe-listening-audio/
│   │   └── index.ts
│   ├── translate-word/
│   │   └── index.ts
│   ├── upload-media/
│   │   └── index.ts
│   ├── deno.json
│   └── deno.lock
├── migrations/
│   └── [migration files]
└── config.toml
```

---

## 2. Critical File Contents

---

### --- FILE: FINAL_GENESIS_PLAN.txt ---

**Note:** This file does not exist in the project.

---

### --- FILE: package.json ---

```json
{
  "name": "vite_react_shadcn_ts",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@radix-ui/react-accordion": "^1.2.11",
    "@radix-ui/react-alert-dialog": "^1.1.14",
    "@radix-ui/react-aspect-ratio": "^1.1.7",
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-checkbox": "^1.3.2",
    "@radix-ui/react-collapsible": "^1.1.11",
    "@radix-ui/react-context-menu": "^2.2.15",
    "@radix-ui/react-dialog": "^1.1.14",
    "@radix-ui/react-dropdown-menu": "^2.1.15",
    "@radix-ui/react-hover-card": "^1.1.14",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-menubar": "^1.1.15",
    "@radix-ui/react-navigation-menu": "^1.2.13",
    "@radix-ui/react-popover": "^1.1.14",
    "@radix-ui/react-progress": "^1.1.7",
    "@radix-ui/react-radio-group": "^1.3.7",
    "@radix-ui/react-scroll-area": "^1.2.9",
    "@radix-ui/react-select": "^2.2.5",
    "@radix-ui/react-separator": "^1.1.7",
    "@radix-ui/react-slider": "^1.3.5",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.2.5",
    "@radix-ui/react-tabs": "^1.1.12",
    "@radix-ui/react-toast": "^1.2.14",
    "@radix-ui/react-toggle": "^1.1.9",
    "@radix-ui/react-toggle-group": "^1.1.10",
    "@radix-ui/react-tooltip": "^1.2.7",
    "@supabase/supabase-js": "^2.86.2",
    "@tanstack/react-query": "^5.83.0",
    "@testing-library/dom": "^10.4.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^3.6.0",
    "embla-carousel-react": "^8.6.0",
    "input-otp": "^1.4.2",
    "jsdom": "^27.3.0",
    "lucide-react": "^0.462.0",
    "next-themes": "^0.3.0",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.61.1",
    "react-resizable-panels": "^2.1.9",
    "react-router-dom": "^6.30.1",
    "recharts": "^3.6.0",
    "sonner": "^1.7.4",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "typescript": "^5.4.5",
    "vaul": "^0.9.9",
    "vitest": "^4.0.16",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "@eslint/js": "^9.32.0",
    "@tailwindcss/typography": "^0.5.16",
    "@types/node": "^22.16.5",
    "@types/react": "^18.3.23",
    "@types/react-dom": "^18.3.7",
    "@vitejs/plugin-react-swc": "^3.11.0",
    "autoprefixer": "^10.4.21",
    "eslint": "^9.32.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^15.15.0",
    "lovable-tagger": "^1.1.11",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.17",
    "typescript-eslint": "^8.38.0",
    "vite": "^5.4.19"
  }
}
```

---

### --- FILE: supabase/functions/generate-ai-practice/index.ts ---

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-gemini-api-key',
};

// ============================================================================
// CREDIT SYSTEM - Cost Map and Daily Limits
// ============================================================================
const COSTS = {
  // GENERATION
  'generate_speaking': 5,
  'generate_writing': 5,
  'generate_listening': 20,
  'generate_reading': 20,
  // EVALUATION
  'evaluate_speaking': 15,
  'evaluate_writing': 10,
  'evaluate_reading': 0,    // FREE
  'evaluate_listening': 0,  // FREE
  // CHAT
  'explain_answer': 2
};

const DAILY_CREDIT_LIMIT = 100;

// ============================================================================
// ATOMIC CREDIT FUNCTIONS - Uses DB functions to prevent race conditions
// ============================================================================

// Check and RESERVE credits atomically BEFORE calling AI
// This prevents the "rapid click attack" where parallel requests bypass limits
async function checkAndReserveCredits(
  serviceClient: any, 
  userId: string, 
  operationType: keyof typeof COSTS
): Promise<{ ok: boolean; error?: string; creditsUsed?: number; creditsRemaining?: number }> {
  const cost = COSTS[operationType] || 0;
  
  // Free operations always pass
  if (cost === 0) {
    return { ok: true, creditsUsed: 0, creditsRemaining: DAILY_CREDIT_LIMIT };
  }
  
  try {
    // Call atomic DB function that locks the row and reserves credits
    const { data, error } = await serviceClient.rpc('check_and_reserve_credits', {
      p_user_id: userId,
      p_cost: cost
    });
    
    if (error) {
      console.error('check_and_reserve_credits RPC error:', error);
      // Fail open - allow operation if RPC fails
      return { ok: true, creditsUsed: 0, creditsRemaining: DAILY_CREDIT_LIMIT };
    }
    
    console.log(`Credit check result for ${operationType} (cost ${cost}):`, data);
    
    if (!data.ok) {
      return {
        ok: false,
        error: data.error || `Daily credit limit reached. Add your own Gemini API key in Settings.`,
        creditsUsed: data.credits_used,
        creditsRemaining: data.credits_remaining
      };
    }
    
    return {
      ok: true,
      creditsUsed: data.credits_used,
      creditsRemaining: data.credits_remaining
    };
  } catch (err) {
    console.error('Error in atomic credit check:', err);
    // Fail open - allow operation
    return { ok: true, creditsUsed: 0, creditsRemaining: DAILY_CREDIT_LIMIT };
  }
}

// Refund credits if the AI operation fails AFTER we reserved them
async function refundCredits(
  serviceClient: any, 
  userId: string, 
  operationType: keyof typeof COSTS
): Promise<void> {
  const cost = COSTS[operationType] || 0;
  if (cost === 0) return;
  
  try {
    const { error } = await serviceClient.rpc('refund_credits', {
      p_user_id: userId,
      p_cost: cost
    });
    
    if (error) {
      console.error('refund_credits RPC error:', error);
    } else {
      console.log(`Refunded ${cost} credits for failed ${operationType}`);
    }
  } catch (err) {
    console.error('Failed to refund credits:', err);
  }
}

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

// ============================================================================
// VOICE-FIRST GENDER SYNCHRONIZATION SYSTEM
// ============================================================================
// TTS Voice to Gender mapping for script synchronization
const VOICE_GENDER_MAP: Record<string, 'male' | 'female'> = {
  // Gemini TTS voices
  'Kore': 'male',
  'Charon': 'male',
  'Fenrir': 'male',
  'Puck': 'male',
  'Aoede': 'female',
  // Edge TTS voices (common British/US)
  'en-GB-RyanNeural': 'male',
  'en-GB-SoniaNeural': 'female',
  'en-US-GuyNeural': 'male',
  'en-US-AriaNeural': 'female',
  'en-US-JennyNeural': 'female',
  'en-AU-WilliamNeural': 'male',
  'en-AU-NatashaNeural': 'female',
  'en-IN-PrabhatNeural': 'male',
  'en-IN-NeerjaNeural': 'female',
};

// Get gender from voice name (defaults to male for unknown voices)
function getVoiceGender(voiceName: string): 'male' | 'female' {
  return VOICE_GENDER_MAP[voiceName] || 'male';
}

// Get appropriate names based on gender
function getGenderAppropriateNames(gender: 'male' | 'female'): string[] {
  if (gender === 'male') {
    return ['Tom', 'David', 'John', 'Michael', 'James', 'Robert', 'William', 'Richard', 'Daniel', 'Mark'];
  }
  return ['Sarah', 'Emma', 'Lisa', 'Anna', 'Maria', 'Sophie', 'Rachel', 'Laura', 'Helen', 'Kate'];
}

// Build gender constraint for AI prompt
function buildGenderConstraint(primaryVoice: string, hasSecondSpeaker: boolean): string {
  const primaryGender = getVoiceGender(primaryVoice);
  const oppositeGender = primaryGender === 'male' ? 'female' : 'male';
  const primaryNames = getGenderAppropriateNames(primaryGender).slice(0, 5).join(', ');
  const secondaryNames = getGenderAppropriateNames(oppositeGender).slice(0, 5).join(', ');
  
  let constraint = `
CRITICAL - VOICE-GENDER SYNCHRONIZATION:
- The MAIN SPEAKER (Speaker1) for this audio is ${primaryGender.toUpperCase()}.
- You MUST assign Speaker1 a ${primaryGender} name (e.g., ${primaryNames}).
- You MUST NOT write self-identifying phrases that contradict this gender.
- DO NOT use phrases like "${primaryGender === 'male' ? "I am a mother" : "I am a father"}" or names of the wrong gender.`;

  if (hasSecondSpeaker) {
    constraint += `
- The SECOND SPEAKER (Speaker2) should be ${oppositeGender.toUpperCase()} for voice distinctiveness.
- Assign Speaker2 a ${oppositeGender} name (e.g., ${secondaryNames}).`;
  }
  
  return constraint;
}

// Gemini models for IELTS text generation - sorted by performance & suitability
// 1. gemini-2.5-flash: Stable, best speed/quality balance for structured text generation (June 2025)
// 2. gemini-2.5-pro: Highest quality reasoning, best for complex question generation (fallback)
// 3. gemini-2.0-flash: Fast & reliable, good general-purpose fallback
// 4. gemini-2.0-flash-lite: Fastest, lightweight fallback for emergencies
// EXCLUDED: TTS models, embedding models, image/video generation, experimental/preview, Gemma (smaller context)
const GEMINI_MODELS = [
  'gemini-2.5-flash',      // Primary: best balance for IELTS generation
  'gemini-2.5-pro',        // High quality fallback 
  'gemini-2.0-flash',      // Fast reliable fallback
  'gemini-2.0-flash-lite', // Emergency fallback (lower quality but fast)
];

// ... [Continues for 3310 lines total - includes:]
// - API key rotation with DB-managed keys
// - Pre-flight API validation
// - Quota tracking
// - callGemini function with retry logic and model fallback
// - Reading prompt generation for all question types
// - Listening prompt generation with SSML support
// - Writing prompt generation with visual data (charts, maps, processes)
// - Speaking prompt generation with cue cards
// - TTS audio generation with Gemini
// - Test preset system for serving pre-generated tests
// - Full HTTP serve handler with module routing

// Key Features:
// 1. Credit system with atomic reservation/refund
// 2. Voice-first gender synchronization for listening tests
// 3. Natural gap positioning (30% start, 40% middle, 30% end)
// 4. Multi-model fallback (gemini-2.5-flash → 2.5-pro → 2.0-flash → 2.0-flash-lite)
// 5. DB-managed API key rotation
// 6. Support for all IELTS question types (Reading, Listening, Writing, Speaking)
// 7. Test preset serving for bulk-generated tests
```

**Note:** The full file is 3310 lines. The above shows the core structure and key systems. The complete file handles:
- Reading: TRUE_FALSE_NOT_GIVEN, YES_NO_NOT_GIVEN, MULTIPLE_CHOICE, MATCHING_HEADINGS, MATCHING_INFORMATION, FILL_IN_BLANK, TABLE_COMPLETION, FLOWCHART_COMPLETION, SUMMARY_COMPLETION, etc.
- Listening: FILL_IN_BLANK, MULTIPLE_CHOICE, MATCHING, TABLE_COMPLETION, MAP_LABELING, NOTE_COMPLETION, etc.
- Writing: TASK_1 (charts, maps, processes), TASK_2 (essays)
- Speaking: PART_1, PART_2 (cue cards), PART_3, FULL_TEST

---

### --- FILE: src/integrations/supabase/types.ts ---

```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: { /* user_id, created_at */ }
      ai_practice_results: { /* answers, band_score, module, score, test_id, user_id, etc. */ }
      ai_practice_tests: { /* audio_url, difficulty, module, payload, question_type, topic, etc. */ }
      ai_practice_topic_completions: { /* module, topic, completed_count, user_id */ }
      api_keys: { /* provider, key_value, is_active, error_count */ }
      bulk_generation_jobs: { /* module, topic, difficulty, quantity, status, success_count, failure_count */ }
      flashcard_cards: { /* word, meaning, translation, deck_id, status, review_count */ }
      flashcard_decks: { /* name, description, user_id */ }
      gemini_daily_usage: { /* tokens_used, requests_count, usage_date, user_id */ }
      generated_test_audio: { /* module, topic, audio_url, content_payload, is_published, status */ }
      listening_question_groups: { /* test_id, question_type, start_question, end_question, instruction */ }
      listening_questions: { /* group_id, question_number, question_text, correct_answer, options */ }
      listening_test_submissions: { /* test_id, user_id, answers, score, band_score */ }
      listening_tests: { /* title, book_name, audio_url, is_published, total_questions */ }
      profiles: { /* id, email, full_name, daily_credits_used, last_reset_date */ }
      promotions: { /* name, start_date, end_date, is_active */ }
      reading_paragraphs: { /* passage_id, content, label, is_heading */ }
      reading_passages: { /* test_id, title, content, passage_number */ }
      reading_question_groups: { /* passage_id, question_type, instruction, options */ }
      reading_questions: { /* passage_id, question_number, question_text, correct_answer, options */ }
      reading_test_submissions: { /* test_id, user_id, answers, score, band_score */ }
      reading_tests: { /* title, book_name, test_type, is_published, total_questions */ }
      speaking_question_groups: { /* test_id, part_number, cue_card_topic, cue_card_content */ }
      speaking_questions: { /* group_id, question_number, question_text, is_required */ }
      speaking_submissions: { /* test_id, user_id, audio_urls, evaluation_report, overall_band */ }
      speaking_tests: { /* name, description, test_type, is_published */ }
      subscriptions: { /* user_id, plan_name, status, start_date, end_date */ }
      test_presets: { /* module, topic, payload, is_published */ }
      test_results: { /* user_id, test_type, score, band_score, answers, feedback */ }
      user_analytics: { /* user_id, module_type, analysis_data, tests_analyzed */ }
      user_secrets: { /* user_id, secret_name, encrypted_value */ }
      user_test_history: { /* user_id, test_id, taken_at */ }
      writing_submissions: { /* task_id, user_id, submission_text, evaluation_report, overall_band */ }
      writing_tasks: { /* writing_test_id, task_type, instruction, image_url, word_limit_min */ }
      writing_tests: { /* title, description, time_limit, is_published */ }
    }
    Functions: {
      can_user_submit: { Args: { p_user_id: string }; Returns: boolean }
      check_and_reserve_credits: { Args: { p_cost: number; p_user_id: string }; Returns: Json }
      cleanup_old_data: { Args: never; Returns: Json }
      get_credit_status: { Args: { p_user_id: string }; Returns: Json }
      has_active_subscription: { Args: { p_user_id: string }; Returns: boolean }
      increment_topic_completion: { Args: { p_module: string; p_topic: string; p_user_id: string }; Returns: undefined }
      is_admin: { Args: { check_user_id: string }; Returns: boolean }
      is_promotion_active: { Args: never; Returns: boolean }
      refund_credits: { Args: { p_cost: number; p_user_id: string }; Returns: undefined }
    }
    Enums: {
      subscription_status: "active" | "cancelled" | "expired" | "pending"
      writing_task_type: "task1" | "task2"
    }
  }
}

// ... Type helpers (Tables, TablesInsert, TablesUpdate, Enums, etc.)
```

---

### --- FILE: src/App.tsx ---

```tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ReadingTestList from "./pages/ReadingTestList";
import ReadingTest from "./pages/ReadingTest";
import ListeningTestList from "./pages/ListeningTestList";
import ListeningTest from "./pages/ListeningTest";
import WritingTestList from "./pages/WritingTestList";
import WritingTest from "./pages/WritingTest";
import WritingEvaluationReport from "./pages/WritingEvaluationReport";
import SpeakingTestList from "./pages/SpeakingTestList";
import SpeakingTest from "./pages/SpeakingTest";
import SpeakingEvaluationReport from "./pages/SpeakingEvaluationReport";
import TestResults from "./pages/TestResults";
import Analytics from "./pages/Analytics";
import AnalyticsDemo from "./pages/AnalyticsDemo";
import Flashcards from "./pages/Flashcards";
import PassageStudy from "./pages/PassageStudy";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import PromotionCodesAdmin from "./pages/admin/PromotionCodesAdmin";
import FullMockTest from "./pages/FullMockTest";
import GenerateListeningPOC from "./pages/GenerateListeningPOC";
import TestComparison from "./pages/TestComparison";
import AIPractice from "./pages/AIPractice";
import AIPracticeTest from "./pages/AIPracticeTest";
import AIPracticeResults from "./pages/AIPracticeResults";
import AIPracticeWritingTest from "./pages/AIPracticeWritingTest";
import AIPracticeSpeakingTest from "./pages/AIPracticeSpeakingTest";
import AIPracticeReadingTest from "./pages/AIPracticeReadingTest";
import AIPracticeListeningTest from "./pages/AIPracticeListeningTest";
import AIPracticeHistory from "./pages/AIPracticeHistory";
import AISpeakingResults from "./pages/AISpeakingResults";
import AIWritingResults from "./pages/AIWritingResults";
// Admin pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ReadingTestsAdmin from "./pages/admin/ReadingTestsAdmin";
import ReadingTestEditor from "./pages/admin/ReadingTestEditor";
import ListeningTestsAdmin from "./pages/admin/ListeningTestsAdmin";
import ListeningTestEditor from "./pages/admin/ListeningTestEditor";
import WritingTestsAdmin from "./pages/admin/WritingTestsAdmin";
import WritingTestEditor from "./pages/admin/WritingTestEditor";
import SpeakingTestsAdmin from "./pages/admin/SpeakingTestsAdmin";
import SpeakingTestEditor from "./pages/admin/SpeakingTestEditor";
import AdminSettings from "./pages/admin/AdminSettings";
import TestBankAdmin from "./pages/admin/TestBankAdmin";
import TestFactoryAdmin from "./pages/admin/TestFactoryAdmin";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <div className="overflow-x-hidden min-h-screen">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/reading/cambridge-ielts-a" element={<ReadingTestList />} />
            <Route path="/reading/test/:testId" element={<ReadingTest />} />
            <Route path="/reading/study/:testId" element={<PassageStudy />} />
            <Route path="/listening/cambridge-ielts-a" element={<ListeningTestList />} />
            <Route path="/listening/test/:testId" element={<ListeningTest />} />
            <Route path="/writing/cambridge-ielts-a" element={<WritingTestList />} />
            <Route path="/writing/test/:testId" element={<WritingTest />} />
            <Route path="/writing/evaluation/:testId/:submissionId?" element={<WritingEvaluationReport />} />
            <Route path="/speaking/cambridge-ielts-a" element={<SpeakingTestList />} />
            <Route path="/speaking/test/:testId" element={<SpeakingTest />} />
            <Route path="/speaking/evaluation/:testId/:submissionId?" element={<SpeakingEvaluationReport />} />
            <Route path="/full-mock-test" element={<FullMockTest />} />
            <Route path="/results/:submissionId" element={<TestResults />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/analytics/demo" element={<AnalyticsDemo />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/generate/listening" element={<GenerateListeningPOC />} />
            <Route path="/compare" element={<TestComparison />} />
            {/* AI Practice */}
            <Route path="/ai-practice" element={<AIPractice />} />
            <Route path="/ai-practice/history" element={<AIPracticeHistory />} />
            <Route path="/ai-practice/test/:testId" element={<AIPracticeTest />} />
            <Route path="/ai-practice/writing/:testId" element={<AIPracticeWritingTest />} />
            <Route path="/ai-practice/speaking" element={<Navigate to="/ai-practice" replace />} />
            <Route path="/ai-practice/speaking/:testId" element={<AIPracticeSpeakingTest />} />
            <Route path="/ai-practice/reading/:testId" element={<AIPracticeReadingTest />} />
            <Route path="/ai-practice/listening/:testId" element={<AIPracticeListeningTest />} />
            <Route path="/ai-practice/results/:testId" element={<AIPracticeResults />} />
            <Route path="/ai-practice/speaking/results/:testId" element={<AISpeakingResults />} />
            <Route path="/ai-practice/writing/results/:testId" element={<AIWritingResults />} />
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="reading" element={<ReadingTestsAdmin />} />
              <Route path="reading/new" element={<ReadingTestEditor />} />
              <Route path="reading/edit/:testId" element={<ReadingTestEditor />} />
              <Route path="listening" element={<ListeningTestsAdmin />} />
              <Route path="listening/new" element={<ListeningTestEditor />} />
              <Route path="listening/edit/:testId" element={<ListeningTestEditor />} />
              <Route path="writing" element={<WritingTestsAdmin />} />
              <Route path="writing/new" element={<WritingTestEditor />} />
              <Route path="writing/edit/:testId" element={<WritingTestEditor />} />
              <Route path="speaking" element={<SpeakingTestsAdmin />} />
              <Route path="speaking/new" element={<SpeakingTestEditor />} />
              <Route path="speaking/edit/:testId" element={<SpeakingTestEditor />} />
              <Route path="promotions" element={<PromotionCodesAdmin />} />
              <Route path="testbank" element={<TestBankAdmin />} />
              <Route path="test-factory" element={<TestFactoryAdmin />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
```

---

### --- FILE: src/components/common/SafeAudioPlayer.tsx ---

```tsx
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX, Loader2 } from "lucide-react";
import { SimulatedAudioPlayer } from "@/components/listening/SimulatedAudioPlayer";

interface SafeAudioPlayerProps {
  audioUrl?: string | null;
  fallbackText?: string;
  accentHint?: string; // 'US', 'GB', 'AU', etc.
  autoPlay?: boolean;
  onEnded?: () => void;
  onError?: (error: string) => void;
  className?: string;
  showControls?: boolean;
}

/**
 * SafeAudioPlayer - Strict Audio Priority Logic
 * 
 * PRIORITY 1: If audioUrl exists AND hasn't failed → render HTML5 Audio player
 * PRIORITY 2: If audioUrl fails OR no URL → render SimulatedAudioPlayer (TTS)
 * 
 * NO transcript is ever shown to prevent cheating.
 */
export function SafeAudioPlayer({
  audioUrl,
  fallbackText,
  accentHint,
  autoPlay = false,
  onEnded,
  onError,
  className = "",
  showControls = true,
}: SafeAudioPlayerProps) {
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  // ... [Full implementation - 275 lines]
  // Features:
  // - HTML5 audio player with controls
  // - Automatic fallback to SimulatedAudioPlayer (TTS) on error
  // - HEAD request validation for audio URLs
  // - Progress tracking and seek functionality
  // - Volume control with mute toggle
}

export default SafeAudioPlayer;
```

---

### --- FILE: src/components/listening/SimulatedAudioPlayer.tsx ---

```tsx
import { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

interface SimulatedAudioPlayerProps {
  text: string;
  accentHint?: 'US' | 'GB' | 'AU';
  onComplete?: () => void;
  className?: string;
}

const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5];

/**
 * SimulatedAudioPlayer - A TTS-based audio player that mimics the premium player UI
 * Features:
 * - Play/Pause toggle
 * - Simulated progress bar based on word count estimation
 * - Time display (0:15 / 1:45)
 * - Source badge indicating "Device Voice"
 * - Volume controls
 * - Playback speed controls
 */
export function SimulatedAudioPlayer({
  text,
  accentHint = 'GB',
  onComplete,
  className,
}: SimulatedAudioPlayerProps) {
  // ... [Full implementation - 345 lines]
  // Uses Web Speech API (SpeechSynthesisUtterance)
  // Voice selection priority: accent match + high-quality (Google/Microsoft/Natural)
  // Progress animation based on word count estimation (~2.5 words/second)
}

export default SimulatedAudioPlayer;
```

---

### --- FILE: src/pages/admin/AdminDashboard.tsx ---

```tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, FileText, TrendingUp, Headphones, PenTool, Mic, Brain, Sparkles, Factory } from 'lucide-react';

interface Stats {
  readingTests: number;
  listeningTests: number;
  writingTests: number;
  speakingTests: number;
  totalPassages: number;
  totalQuestions: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({...});
  const [loading, setLoading] = useState(true);

  // Fetches counts from all test tables
  // Displays stat cards with icons and gradients
  // Quick action links to manage each module
  // Link to Test Factory for bulk generation
}
```

---

### --- FILE: src/pages/admin/AdminLayout.tsx ---

```tsx
import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { Button } from '@/components/ui/button';
import { BookOpen, Home, LogOut, Menu, X, FileText, ShieldAlert, Headphones, PenTool, Mic, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { label: 'Dashboard', href: '/admin', icon: Home },
  { label: 'Reading Tests', href: '/admin/reading', icon: BookOpen },
  { label: 'Listening Tests', href: '/admin/listening', icon: Headphones },
  { label: 'Writing Tests', href: '/admin/writing', icon: PenTool },
  { label: 'Speaking Tests', href: '/admin/speaking', icon: Mic },
  { label: 'Promotion Codes', href: '/admin/promotions', icon: Gift },
  { label: 'Test Bank', href: '/admin/testbank', icon: FileText },
  { label: 'Settings', href: '/admin/settings', icon: Menu },
];

export default function AdminLayout() {
  // Checks auth and admin access
  // Collapsible sidebar with navigation
  // "Back to Site" button
  // User info and logout
  // Renders <Outlet /> for nested routes
}
```

---

### --- FILE: src/pages/admin/TestFactoryAdmin.tsx ---

```tsx
// 1035 lines - Bulk AI test generation interface

// Key features:
// - Module selection (reading, listening, writing, speaking)
// - Topic selection from IELTS topic lists
// - Question type selection per module
// - Difficulty selection (easy/medium/hard)
// - Quantity slider (1-50 tests)
// - Monologue mode toggle (listening only)
// - Job monitoring with real-time progress
// - Filter jobs by module, status, date
// - Preview generated tests
// - Publish/unpublish tests
// - Retry failed tests
// - Cancel running jobs
// - Delete tests

// Uses supabase.functions.invoke("bulk-generate-tests") to start jobs
// Polls get-job-status for real-time updates
```

---

### --- FILE: src/pages/admin/TestBankAdmin.tsx ---

```tsx
// 590 lines - Manage generated tests in the test bank

// Features:
// - Filter by module, status, difficulty, date
// - Search by topic
// - Toggle publish status
// - Delete tests
// - Preview test content (audio player, transcript, payload)
// - Shows usage count (times_used)
```

---

### --- FILE: src/pages/admin/AdminSettings.tsx ---

```tsx
// 411 lines - Admin settings for API key management

// Features:
// - View all Gemini API keys in rotation pool
// - Add new API keys
// - Toggle key active/inactive status
// - View and reset error counts
// - Delete API keys
// - Masked key display for security
```

---

### --- FILE: src/pages/admin/ReadingTestsAdmin.tsx ---

```tsx
// List and manage reading tests
// Create/Edit/Delete operations
// View test in new tab
// Shows: title, book_name, test_number, question count, time limit, publish status
```

---

### --- FILE: src/pages/admin/ListeningTestsAdmin.tsx ---

```tsx
// List and manage listening tests
// Shows audio upload status (has audio / no audio)
// Delete also removes audio from storage bucket
```

---

### --- FILE: src/pages/admin/WritingTestsAdmin.tsx ---

```tsx
// List and manage writing tests (Task 1 + Task 2 combined)
// Delete cascades to tasks and cleans up images
```

---

### --- FILE: src/pages/admin/SpeakingTestsAdmin.tsx ---

```tsx
// List and manage speaking tests
// Shows test type (Academic/General Training)
// Delete cascades to question groups and submissions
```

---

## 3. Database Schema Summary

### Core Tables:
- `reading_tests` → `reading_passages` → `reading_paragraphs`, `reading_question_groups`, `reading_questions`
- `listening_tests` → `listening_question_groups` → `listening_questions`
- `writing_tests` → `writing_tasks`
- `speaking_tests` → `speaking_question_groups` → `speaking_questions`

### AI Practice Tables:
- `ai_practice_tests` - Generated tests with payload
- `ai_practice_results` - User submission results
- `generated_test_audio` - Bulk-generated tests with audio
- `bulk_generation_jobs` - Job tracking for Test Factory
- `test_presets` - Pre-generated tests for smart selection

### User Tables:
- `profiles` - User info + daily credit tracking
- `subscriptions` - Subscription status
- `user_secrets` - Encrypted API keys
- `gemini_daily_usage` - Token usage tracking

### Storage Buckets:
- `listening-audios` (public)
- `listening-images` (public)
- `writing-images` (public)
- `speaking-audios` (public)

---

## 4. Key Architecture Notes

### AI Generation Flow:
1. User triggers generation via `/ai-practice` page
2. Frontend calls `supabase.functions.invoke("generate-ai-practice")`
3. Edge function checks credits, reserves atomically
4. Calls Gemini API with module-specific prompts
5. For listening: generates TTS audio with Gemini TTS
6. Returns structured JSON to frontend
7. Frontend renders test-taking UI

### Audio Priority System:
1. If R2/Supabase audio URL exists → HTML5 audio player
2. If audio fails or missing → SimulatedAudioPlayer (browser TTS)

### Credit System:
- 100 credits/day per user
- Credits reserved before AI call, refunded on failure
- Users can add their own Gemini API key to bypass limits

### Voice-Gender Sync:
- Voice selected first, then script constrained to match gender
- Prevents "male voice reading female character" issues

---

*End of GEMINI_CONTEXT.md*
