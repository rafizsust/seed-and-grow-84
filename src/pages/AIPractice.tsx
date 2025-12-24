import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AILoadingScreen } from '@/components/common/AILoadingScreen';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  BookOpen, 
  Headphones, 
  Sparkles, 
  Clock, 
  Target, 
  Zap,
  Brain,
  
  Settings2
} from 'lucide-react';
import { 
  PracticeModule, 
  DifficultyLevel, 
  ReadingQuestionType, 
  ListeningQuestionType,
  QUESTION_COUNTS,
  getDefaultTime,
  saveGeneratedTest,
  GeneratedTest
} from '@/types/aiPractice';
import { Link } from 'react-router-dom';

// Question type options
const READING_QUESTION_TYPES: { value: ReadingQuestionType; label: string; description: string }[] = [
  { value: 'TRUE_FALSE_NOT_GIVEN', label: 'True/False/Not Given', description: 'Decide if statements match the passage' },
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice', description: 'Choose the correct answer from options' },
  { value: 'FILL_IN_BLANK', label: 'Fill in the Blank', description: 'Complete sentences with words from passage' },
  { value: 'MATCHING_HEADINGS', label: 'Matching Headings', description: 'Match paragraphs with suitable headings' },
  { value: 'MATCHING_INFORMATION', label: 'Matching Information', description: 'Match statements to paragraphs' },
  { value: 'SENTENCE_COMPLETION', label: 'Sentence Completion', description: 'Complete sentences with given words' },
  { value: 'SUMMARY_COMPLETION', label: 'Summary Completion', description: 'Fill in a summary of the passage' },
];

const LISTENING_QUESTION_TYPES: { value: ListeningQuestionType; label: string; description: string }[] = [
  { value: 'FILL_IN_BLANK', label: 'Fill in the Blank', description: 'Complete notes while listening' },
  { value: 'MULTIPLE_CHOICE_SINGLE', label: 'Multiple Choice (Single)', description: 'Choose one correct answer' },
  { value: 'MULTIPLE_CHOICE_MULTIPLE', label: 'Multiple Choice (Multiple)', description: 'Choose multiple correct answers' },
  { value: 'MATCHING_CORRECT_LETTER', label: 'Matching', description: 'Match items with options' },
  { value: 'TABLE_COMPLETION', label: 'Table Completion', description: 'Complete a table with information' },
];

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string; color: string }[] = [
  { value: 'easy', label: 'Easy', color: 'bg-success/20 text-success border-success/30' },
  { value: 'medium', label: 'Medium', color: 'bg-warning/20 text-warning border-warning/30' },
  { value: 'hard', label: 'Hard', color: 'bg-destructive/20 text-destructive border-destructive/30' },
];

export default function AIPractice() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Form state
  const [activeModule, setActiveModule] = useState<PracticeModule>('reading');
  const [readingQuestionType, setReadingQuestionType] = useState<ReadingQuestionType>('TRUE_FALSE_NOT_GIVEN');
  const [listeningQuestionType, setListeningQuestionType] = useState<ListeningQuestionType>('FILL_IN_BLANK');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [topicPreference, setTopicPreference] = useState('');
  const [timeMinutes, setTimeMinutes] = useState(10);
  const [audioSpeed, setAudioSpeed] = useState(1);

  // Loading state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  const currentQuestionType = activeModule === 'reading' ? readingQuestionType : listeningQuestionType;
  const questionCount = QUESTION_COUNTS[currentQuestionType] || 5;

  const progressSteps = activeModule === 'reading' 
    ? [
        'Analyzing topic requirements',
        'Generating IELTS passage',
        'Creating questions & answers',
        'Preparing explanations',
        'Finalizing test'
      ]
    : [
        'Analyzing topic requirements',
        'Generating dialogue script',
        'Creating audio with AI voices',
        'Generating questions',
        'Finalizing test'
      ];

  const handleGenerate = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to generate AI practice tests',
        variant: 'destructive',
      });
      navigate('/auth?returnTo=/ai-practice');
      return;
    }

    setIsGenerating(true);
    setGenerationStep(0);

    // Simulate progress steps
    const stepInterval = setInterval(() => {
      setGenerationStep(prev => {
        if (prev < progressSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 3000);

    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-practice', {
        body: {
          module: activeModule,
          questionType: currentQuestionType,
          difficulty,
          topicPreference: topicPreference.trim() || undefined,
          questionCount,
          timeMinutes,
        },
      });

      clearInterval(stepInterval);

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      // Save to localStorage
      const generatedTest: GeneratedTest = {
        id: data.testId || crypto.randomUUID(),
        module: activeModule,
        questionType: currentQuestionType,
        difficulty,
        topic: data.topic || topicPreference || 'Random Topic',
        timeMinutes,
        passage: data.passage,
        audioBase64: data.audioBase64,
        audioFormat: data.audioFormat,
        sampleRate: data.sampleRate,
        transcript: data.transcript,
        questionGroups: data.questionGroups,
        totalQuestions: questionCount,
        generatedAt: new Date().toISOString(),
      };

      saveGeneratedTest(generatedTest);

      toast({
        title: 'Test Generated!',
        description: `Your ${activeModule} practice test is ready`,
      });

      // Navigate to the practice test
      navigate(`/ai-practice/test/${generatedTest.id}`);

    } catch (err: any) {
      console.error('Generation error:', err);
      clearInterval(stepInterval);
      toast({
        title: 'Generation Failed',
        description: err.message || 'Failed to generate practice test. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setGenerationStep(0);
    }
  };

  if (isGenerating) {
    return (
      <AILoadingScreen
        title="Generating Your Practice Test"
        description={`Creating a personalized ${activeModule} test with ${questionCount} ${currentQuestionType.replace(/_/g, ' ').toLowerCase()} questions.`}
        progressSteps={progressSteps}
        currentStepIndex={generationStep}
        estimatedTime={activeModule === 'listening' ? '30-60 seconds' : '15-30 seconds'}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="container max-w-5xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered Practice</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Generate Custom Practice Tests
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Create personalized IELTS practice questions tailored to your needs. 
              AI generates unique questions, answers, and explanations instantly.
            </p>
          </div>

          {!user && (
            <Card className="mb-6 border-warning/50 bg-warning/5">
              <CardContent className="py-4 flex items-center gap-4">
                <Brain className="w-8 h-8 text-warning shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">Login Required</p>
                  <p className="text-sm text-muted-foreground">
                    Please log in and add your Gemini API key in Settings to generate practice tests.
                  </p>
                </div>
                <Link to="/auth?returnTo=/ai-practice">
                  <Button>Get Started</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Module Tabs */}
          <Tabs value={activeModule} onValueChange={(v) => setActiveModule(v as PracticeModule)} className="mb-6">
            <TabsList className="grid w-full grid-cols-2 h-auto p-1">
              <TabsTrigger value="reading" className="flex items-center gap-2 py-3">
                <BookOpen className="w-5 h-5" />
                <span>Reading</span>
              </TabsTrigger>
              <TabsTrigger value="listening" className="flex items-center gap-2 py-3">
                <Headphones className="w-5 h-5" />
                <span>Listening</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reading" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Reading Practice Configuration
                  </CardTitle>
                  <CardDescription>
                    Generate a reading passage with questions tailored to your skill level
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Question Type Selection */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Question Type</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {READING_QUESTION_TYPES.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setReadingQuestionType(type.value)}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            readingQuestionType === type.value
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-muted-foreground">{type.description}</div>
                          <Badge variant="secondary" className="mt-2">
                            {QUESTION_COUNTS[type.value]} questions
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="listening" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Headphones className="w-5 h-5 text-primary" />
                    Listening Practice Configuration
                  </CardTitle>
                  <CardDescription>
                    Generate audio dialogue with questions matching real IELTS format
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Question Type Selection */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Question Type</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {LISTENING_QUESTION_TYPES.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setListeningQuestionType(type.value)}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            listeningQuestionType === type.value
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-muted-foreground">{type.description}</div>
                          <Badge variant="secondary" className="mt-2">
                            {QUESTION_COUNTS[type.value]} questions
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Audio Speed */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">Audio Speed</Label>
                      <span className="text-sm text-muted-foreground">{audioSpeed}x</span>
                    </div>
                    <Slider
                      value={[audioSpeed]}
                      onValueChange={([v]) => setAudioSpeed(v)}
                      min={0.75}
                      max={1.25}
                      step={0.05}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Slower</span>
                      <span>Normal</span>
                      <span>Faster</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Common Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="w-5 h-5" />
                Practice Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Difficulty */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Difficulty Level
                </Label>
                <div className="flex gap-3">
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDifficulty(opt.value)}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                        difficulty === opt.value
                          ? opt.color + ' border-current'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic Preference */}
              <div className="space-y-3">
                <Label htmlFor="topic" className="text-base font-medium">
                  Topic Preference (Optional)
                </Label>
                <Input
                  id="topic"
                  value={topicPreference}
                  onChange={(e) => setTopicPreference(e.target.value.slice(0, 100))}
                  placeholder="e.g., Environmental science, Technology, Education..."
                  maxLength={100}
                />
                <p className="text-sm text-muted-foreground">
                  Leave empty for a random IELTS-standard topic. Max 100 characters.
                </p>
              </div>

              {/* Time Setting */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Time Limit
                  </Label>
                  <span className="font-medium">{timeMinutes} minutes</span>
                </div>
                <Slider
                  value={[timeMinutes]}
                  onValueChange={([v]) => setTimeMinutes(v)}
                  min={5}
                  max={30}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5 min</span>
                  <span>Recommended: {getDefaultTime(questionCount)} min</span>
                  <span>30 min</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="py-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h3 className="font-bold text-lg mb-1">Ready to Practice?</h3>
                  <p className="text-muted-foreground">
                    {questionCount} {currentQuestionType.replace(/_/g, ' ').toLowerCase()} questions • {timeMinutes} minutes • {difficulty} difficulty
                  </p>
                </div>
                <Button 
                  size="lg" 
                  className="btn-ai gap-2 min-w-[200px]"
                  onClick={handleGenerate}
                  disabled={!user}
                >
                  <Zap className="w-5 h-5" />
                  Generate Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
