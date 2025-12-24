import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  loadGeneratedTest, 
  savePracticeResult,
  GeneratedTest,
  PracticeResult,
  QuestionResult 
} from '@/types/aiPractice';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause,
  Send,
  BookOpen,
  Headphones,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AIPracticeTest() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [test, setTest] = useState<GeneratedTest | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  
  // Audio state (for listening)
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioSpeed, setAudioSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  // Load test from localStorage
  useEffect(() => {
    if (!testId) {
      navigate('/ai-practice');
      return;
    }
    
    const loadedTest = loadGeneratedTest(testId);
    if (!loadedTest) {
      toast({
        title: 'Test Not Found',
        description: 'The practice test could not be found.',
        variant: 'destructive',
      });
      navigate('/ai-practice');
      return;
    }
    
    setTest(loadedTest);
    setTimeLeft(loadedTest.timeMinutes * 60);
    startTimeRef.current = Date.now();

    // Setup audio for listening tests
    if (loadedTest.module === 'listening' && loadedTest.audioBase64) {
      // Convert PCM to WAV
      const pcmBytes = Uint8Array.from(atob(loadedTest.audioBase64), c => c.charCodeAt(0));
      const wavBlob = pcmToWav(pcmBytes, loadedTest.sampleRate || 24000);
      const url = URL.createObjectURL(wavBlob);
      audioUrlRef.current = url;
      
      const audio = new Audio(url);
      audio.playbackRate = audioSpeed;
      audioRef.current = audio;

      audio.addEventListener('timeupdate', () => {
        setAudioProgress((audio.currentTime / audio.duration) * 100 || 0);
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, [testId, navigate, toast]);

  // Timer
  useEffect(() => {
    if (isPaused || !test) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, test]);

  // PCM to WAV conversion
  const pcmToWav = (pcmData: Uint8Array, sampleRate: number): Blob => {
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = pcmData.length;
    const bufferSize = 44 + dataSize;
    
    const buffer = new ArrayBuffer(bufferSize);
    const view = new DataView(buffer);
    
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);
    
    const wavData = new Uint8Array(buffer);
    wavData.set(pcmData, 44);
    
    return new Blob([buffer], { type: 'audio/wav' });
  };

  const handleAnswerChange = useCallback((questionNumber: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionNumber]: value }));
  }, []);

  const toggleAudio = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSpeedChange = useCallback((speed: number) => {
    setAudioSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, []);

  const handleMuteToggle = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleSubmit = useCallback(() => {
    if (!test) return;

    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
    
    // Calculate results
    const allQuestions = test.questionGroups.flatMap(g => g.questions);
    const questionResults: QuestionResult[] = allQuestions.map(q => {
      const userAnswer = answers[q.question_number] || '';
      const correctAnswer = q.correct_answer;
      
      // Normalize answers for comparison
      const normalize = (s: string) => s.toLowerCase().trim().replace(/[^\w\s]/g, '');
      const isCorrect = normalize(userAnswer) === normalize(correctAnswer);
      
      return {
        questionNumber: q.question_number,
        userAnswer,
        correctAnswer,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const score = questionResults.filter(r => r.isCorrect).length;
    const totalQuestions = test.totalQuestions;
    
    // Calculate band score (approximate)
    const percentage = (score / totalQuestions) * 100;
    let bandScore = 5;
    if (percentage >= 90) bandScore = 9;
    else if (percentage >= 80) bandScore = 8;
    else if (percentage >= 70) bandScore = 7;
    else if (percentage >= 60) bandScore = 6.5;
    else if (percentage >= 50) bandScore = 6;
    else if (percentage >= 40) bandScore = 5.5;
    else if (percentage >= 30) bandScore = 5;
    else bandScore = 4.5;

    const result: PracticeResult = {
      testId: test.id,
      answers,
      score,
      totalQuestions,
      bandScore,
      completedAt: new Date().toISOString(),
      timeSpent,
      questionResults,
    };

    savePracticeResult(result);
    navigate(`/ai-practice/results/${test.id}`);
  }, [test, answers, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).filter(k => answers[parseInt(k)]?.trim()).length;
  const isLowTime = timeLeft < 60;

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const allQuestions = test.questionGroups.flatMap(g => g.questions);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-background border-b border-border px-4 py-3">
        <div className="container max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {test.module === 'reading' ? (
              <BookOpen className="w-5 h-5 text-primary" />
            ) : (
              <Headphones className="w-5 h-5 text-primary" />
            )}
            <div>
              <h1 className="font-semibold text-sm md:text-base line-clamp-1">
                {test.topic}
              </h1>
              <p className="text-xs text-muted-foreground">
                {test.questionType.replace(/_/g, ' ')} • {test.difficulty}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Progress */}
            <Badge variant="secondary" className="hidden sm:flex">
              {answeredCount}/{test.totalQuestions}
            </Badge>

            {/* Timer */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold",
                isPaused 
                  ? "bg-warning/20 text-warning border border-warning/30 animate-pulse"
                  : isLowTime 
                    ? "bg-destructive/10 text-destructive border border-destructive/30"
                    : "bg-muted"
              )}
            >
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
              {isPaused && <span className="text-xs">PAUSED</span>}
            </button>

            {/* Submit */}
            <Button onClick={() => setShowSubmitConfirm(true)} className="gap-2">
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Submit</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Left: Passage or Audio */}
          <Card className="h-fit lg:sticky lg:top-24">
            <CardContent className="p-4 md:p-6">
              {test.module === 'reading' && test.passage && (
                <ScrollArea className="h-[400px] lg:h-[calc(100vh-200px)]">
                  <h2 className="text-xl font-bold mb-4">{test.passage.title}</h2>
                  <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                    {test.passage.content}
                  </div>
                </ScrollArea>
              )}

              {test.module === 'listening' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Audio Player</h2>
                  
                  {!test.audioBase64 ? (
                    <div className="flex items-center gap-2 p-4 bg-warning/10 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-warning" />
                      <p className="text-sm">Audio generation failed. You can still practice with the transcript below.</p>
                    </div>
                  ) : (
                    <>
                      {/* Audio Controls */}
                      <div className="flex items-center gap-4">
                        <Button
                          size="lg"
                          variant="outline"
                          className="w-14 h-14 rounded-full p-0"
                          onClick={toggleAudio}
                        >
                          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                        </Button>

                        <div className="flex-1">
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all"
                              style={{ width: `${audioProgress}%` }}
                            />
                          </div>
                        </div>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleMuteToggle}
                        >
                          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </Button>
                      </div>

                      {/* Speed Control */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">Speed:</span>
                        <div className="flex gap-1">
                          {[0.75, 1, 1.25].map(speed => (
                            <Button
                              key={speed}
                              size="sm"
                              variant={audioSpeed === speed ? 'default' : 'ghost'}
                              onClick={() => handleSpeedChange(speed)}
                            >
                              {speed}x
                            </Button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Transcript (collapsible) */}
                  {test.transcript && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                        Show Transcript
                      </summary>
                      <ScrollArea className="h-[300px] mt-2 p-3 bg-muted/50 rounded-lg">
                        <pre className="text-sm whitespace-pre-wrap font-sans">
                          {test.transcript}
                        </pre>
                      </ScrollArea>
                    </details>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right: Questions */}
          <Card>
            <CardContent className="p-4 md:p-6">
              <ScrollArea className="h-[calc(100vh-250px)]">
                {test.questionGroups.map((group, groupIndex) => (
                  <div key={group.id} className="mb-8">
                    <div className="mb-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">{group.instruction}</p>
                    </div>

                    <div className="space-y-6">
                      {group.questions.map((question) => (
                        <div key={question.id} className="space-y-3">
                          <div className="flex gap-3">
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "shrink-0 w-8 h-8 rounded-full flex items-center justify-center p-0",
                                answers[question.question_number] 
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : ""
                              )}
                            >
                              {question.question_number}
                            </Badge>
                            <p className="text-sm leading-relaxed pt-1">
                              {question.question_text}
                            </p>
                          </div>

                          {/* Answer Input based on question type */}
                          {question.options && question.options.length > 0 ? (
                            <RadioGroup
                              value={answers[question.question_number] || ''}
                              onValueChange={(v) => handleAnswerChange(question.question_number, v)}
                              className="ml-11 space-y-2"
                            >
                              {question.options.map((option, i) => (
                                <div key={i} className="flex items-center space-x-2">
                                  <RadioGroupItem value={option} id={`q${question.question_number}-${i}`} />
                                  <Label htmlFor={`q${question.question_number}-${i}`} className="cursor-pointer">
                                    {option}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          ) : test.questionType === 'TRUE_FALSE_NOT_GIVEN' ? (
                            <RadioGroup
                              value={answers[question.question_number] || ''}
                              onValueChange={(v) => handleAnswerChange(question.question_number, v)}
                              className="ml-11 flex gap-4"
                            >
                              {['TRUE', 'FALSE', 'NOT GIVEN'].map((opt) => (
                                <div key={opt} className="flex items-center space-x-2">
                                  <RadioGroupItem value={opt} id={`q${question.question_number}-${opt}`} />
                                  <Label htmlFor={`q${question.question_number}-${opt}`} className="cursor-pointer text-sm">
                                    {opt}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          ) : (
                            <Input
                              value={answers[question.question_number] || ''}
                              onChange={(e) => handleAnswerChange(question.question_number, e.target.value)}
                              placeholder="Type your answer..."
                              className="ml-11 max-w-sm"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Practice Test?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {answeredCount} out of {test.totalQuestions} questions.
              {answeredCount < test.totalQuestions && (
                <span className="block mt-2 text-warning">
                  Warning: {test.totalQuestions - answeredCount} questions are unanswered.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Test</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              Submit Answers
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
