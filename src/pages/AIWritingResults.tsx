import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { IELTSVisualRenderer, IELTSChartData } from '@/components/common/IELTSVisualRenderer';
import {
  RotateCcw,
  Home,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CriterionScore {
  band: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  examples?: string[];
  vocabulary_upgrades?: Array<{ original: string; suggested: string; context?: string }>;
  error_corrections?: Array<{ error: string; correction: string; explanation?: string }>;
}

interface TaskEvaluation {
  task_achievement?: CriterionScore;
  task_response?: CriterionScore;
  coherence_cohesion: CriterionScore;
  lexical_resource: CriterionScore;
  grammatical_accuracy: CriterionScore;
  overall_feedback: string;
  key_strengths: string[];
  priority_improvements: string[];
  model_paragraph?: string;
}

interface WritingEvaluationReport {
  overall_band: number;
  task1_band?: number;
  task2_band?: number;
  task1_evaluation?: TaskEvaluation;
  task2_evaluation?: TaskEvaluation;
  evaluation_report?: TaskEvaluation;
  combined_feedback?: {
    overall_assessment: string;
    writing_style_notes: string;
    time_management_tips: string;
    next_steps: string[];
  };
}

interface WritingResult {
  id: string;
  test_id: string;
  overall_band: number;
  evaluation_report: WritingEvaluationReport | null;
  task1_text?: string;
  task2_text?: string;
  task1_image_base64?: string;
  task1_chart_data?: object; // JSON chart data for Task 1 visual
  task1_visual_type?: string;
  created_at: string;
}

function normalizeEvaluationReport(raw: any): WritingEvaluationReport {
  if (!raw) return { overall_band: 0 };

  const toNumber = (v: any, fallback = 0) => {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string') {
      const n = Number(v);
      return Number.isFinite(n) ? n : fallback;
    }
    return fallback;
  };

  const asArray = <T,>(v: any): T[] => (Array.isArray(v) ? v : []);

  const normalizeCriterion = (v: any): CriterionScore => ({
    band: toNumber(v?.band ?? v?.score, 0),
    feedback: String(v?.feedback ?? ''),
    strengths: asArray<string>(v?.strengths),
    weaknesses: asArray<string>(v?.weaknesses),
    examples: asArray<string>(v?.examples),
    vocabulary_upgrades: asArray<any>(v?.vocabulary_upgrades),
    error_corrections: asArray<any>(v?.error_corrections),
  });

  const normalizeTaskEval = (t: any): TaskEvaluation | undefined => {
    if (!t) return undefined;
    return {
      task_achievement: t.task_achievement ? normalizeCriterion(t.task_achievement) : undefined,
      task_response: t.task_response ? normalizeCriterion(t.task_response) : undefined,
      coherence_cohesion: normalizeCriterion(t.coherence_cohesion),
      lexical_resource: normalizeCriterion(t.lexical_resource),
      grammatical_accuracy: normalizeCriterion(t.grammatical_accuracy),
      overall_feedback: String(t.overall_feedback ?? ''),
      key_strengths: asArray<string>(t.key_strengths),
      priority_improvements: asArray<string>(t.priority_improvements),
      model_paragraph: t.model_paragraph,
    };
  };

  // Handle both full test and single task formats
  const overallBand = toNumber(raw.overall_band ?? raw.overallBand, 0);
  
  return {
    overall_band: overallBand,
    task1_band: toNumber(raw.task1_band, undefined),
    task2_band: toNumber(raw.task2_band, undefined),
    task1_evaluation: normalizeTaskEval(raw.task1_evaluation),
    task2_evaluation: normalizeTaskEval(raw.task2_evaluation),
    evaluation_report: normalizeTaskEval(raw.evaluation_report),
    combined_feedback: raw.combined_feedback,
  };
}

export default function AIWritingResults() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [result, setResult] = useState<WritingResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!testId) {
      navigate('/ai-practice');
      return;
    }

    if (authLoading) return;

    if (!user) {
      toast.error('Please sign in to view your results');
      navigate('/ai-practice');
      return;
    }

    const loadResults = async () => {
      // Load the test payload to get Task 1 image
      const { data: testRow } = await supabase
        .from('ai_practice_tests')
        .select('payload')
        .eq('id', testId)
        .eq('user_id', user.id)
        .maybeSingle();

      const payload = testRow?.payload as any;
      const task1ImageBase64 = payload?.writingTask?.task1?.image_base64 || payload?.writingTask?.image_base64;
      const task1ChartData = payload?.writingTask?.task1?.chartData || payload?.writingTask?.chartData;
      const task1VisualType = payload?.writingTask?.task1?.visual_type || payload?.writingTask?.visual_type;

      // Load the result
      const { data, error } = await supabase
        .from('ai_practice_results')
        .select('*')
        .eq('test_id', testId)
        .eq('user_id', user.id)
        .eq('module', 'writing')
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Failed to load writing results:', error);
        toast.error('Failed to load results');
        navigate('/ai-practice');
        return;
      }

      if (!data) {
        toast.info('Results are still being processed. Please wait...');
        setTimeout(loadResults, 3000);
        return;
      }

      const answers = data.answers as any;
      const report = normalizeEvaluationReport(data.question_results);

      setResult({
        id: data.id,
        test_id: data.test_id,
        overall_band: data.band_score || report.overall_band || 0,
        evaluation_report: report,
        task1_text: answers?.['1'] || answers?.task1,
        task2_text: answers?.['2'] || answers?.task2,
        task1_image_base64: task1ImageBase64,
        task1_chart_data: task1ChartData,
        task1_visual_type: task1VisualType,
        created_at: data.completed_at,
      });
      setLoading(false);
    };

    loadResults();
  }, [testId, navigate, user, authLoading]);

  const getBandColor = (band: number) => {
    if (band >= 7) return 'text-success';
    if (band >= 6) return 'text-warning';
    return 'text-destructive';
  };

  const getBandBg = (band: number) => {
    if (band >= 7) return 'bg-success/20 border-success/30';
    if (band >= 6) return 'bg-warning/20 border-warning/30';
    return 'bg-destructive/20 border-destructive/30';
  };

  if (loading || !result) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your writing evaluation...</p>
          </div>
        </main>
      </div>
    );
  }

  const report = result.evaluation_report;
  const isFullTest = report?.task1_evaluation && report?.task2_evaluation;
  const singleTaskEval = report?.evaluation_report;

  // Get criteria for a task evaluation
  const getCriteria = (taskEval: TaskEvaluation | undefined, isTask1: boolean) => {
    if (!taskEval) return [];
    const mainCriterion = isTask1 ? taskEval.task_achievement : taskEval.task_response;
    return [
      { key: isTask1 ? 'task_achievement' : 'task_response', label: isTask1 ? 'Task Achievement' : 'Task Response', data: mainCriterion },
      { key: 'coherence_cohesion', label: 'Coherence & Cohesion', data: taskEval.coherence_cohesion },
      { key: 'lexical_resource', label: 'Lexical Resource', data: taskEval.lexical_resource },
      { key: 'grammatical_accuracy', label: 'Grammatical Range & Accuracy', data: taskEval.grammatical_accuracy },
    ].filter(c => c.data);
  };

  const renderCriteriaCard = (criterion: { key: string; label: string; data: CriterionScore | undefined }) => {
    if (!criterion.data) return null;
    const data = criterion.data;

    return (
      <Card key={criterion.key} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{criterion.label}</CardTitle>
            <Badge className={cn("text-lg font-bold px-3", getBandBg(data.band))}>
              {data.band.toFixed(1)}
            </Badge>
          </div>
          <Progress value={(data.band || 0) / 9 * 100} className="h-2 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {data.feedback && (
            <p className="text-sm text-muted-foreground">{data.feedback}</p>
          )}

          {data.strengths && data.strengths.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-success mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium text-sm">Strengths</span>
              </div>
              <ul className="space-y-1 pl-6">
                {data.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-muted-foreground list-disc">{s}</li>
                ))}
              </ul>
            </div>
          )}

          {data.weaknesses && data.weaknesses.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-destructive mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium text-sm">Areas to Improve</span>
              </div>
              <ul className="space-y-1 pl-6">
                {data.weaknesses.map((w, i) => (
                  <li key={i} className="text-sm text-muted-foreground list-disc">{w}</li>
                ))}
              </ul>
            </div>
          )}

          {data.vocabulary_upgrades && data.vocabulary_upgrades.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-primary mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium text-sm">Vocabulary Upgrades</span>
              </div>
              <div className="space-y-2">
                {data.vocabulary_upgrades.map((u, i) => (
                  <div key={i} className="text-sm p-2 bg-muted/50 rounded">
                    <span className="line-through text-muted-foreground">{u.original}</span>
                    <span className="mx-2">→</span>
                    <span className="font-medium text-primary">{u.suggested}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.error_corrections && data.error_corrections.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-warning mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium text-sm">Error Corrections</span>
              </div>
              <div className="space-y-2">
                {data.error_corrections.map((e, i) => (
                  <div key={i} className="text-sm p-2 bg-muted/50 rounded">
                    <span className="line-through text-destructive">{e.error}</span>
                    <span className="mx-2">→</span>
                    <span className="font-medium text-success">{e.correction}</span>
                    {e.explanation && <p className="text-xs text-muted-foreground mt-1">{e.explanation}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderTaskEvaluation = (taskEval: TaskEvaluation | undefined, taskNumber: 1 | 2, taskBand?: number) => {
    if (!taskEval) return null;
    const isTask1 = taskNumber === 1;
    const criteria = getCriteria(taskEval, isTask1);

    return (
      <div className="space-y-4">
        {/* Task Band Score */}
        {taskBand !== undefined && (
          <div className="text-center mb-6">
            <Badge className={cn("text-3xl font-bold px-6 py-2", getBandBg(taskBand))}>
              {taskBand.toFixed(1)}
            </Badge>
            <p className="text-sm text-muted-foreground mt-2">Task {taskNumber} Band Score</p>
          </div>
        )}

        {/* Task 1 Visual Context */}
        {isTask1 && (result.task1_chart_data || result.task1_image_base64) && (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Task 1 Visual ({result.task1_visual_type?.replace(/_/g, ' ') || 'Chart/Graph'})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                {result.task1_chart_data ? (
                  <IELTSVisualRenderer 
                    chartData={result.task1_chart_data as IELTSChartData}
                    fallbackDescription={`${result.task1_visual_type?.replace(/_/g, ' ') || 'Visual'} diagram`}
                    maxWidth={500}
                    maxHeight={300}
                  />
                ) : result.task1_image_base64 ? (
                  <img
                    src={result.task1_image_base64.startsWith('data:') 
                      ? result.task1_image_base64 
                      : `data:image/png;base64,${result.task1_image_base64}`}
                    alt="Task 1 Visual"
                    className="max-w-full max-h-[300px] object-contain rounded border"
                  />
                ) : null}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Criteria Breakdown */}
        {criteria.map(c => renderCriteriaCard(c))}

        {/* Overall Feedback */}
        {taskEval.overall_feedback && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Overall Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{taskEval.overall_feedback}</p>
            </CardContent>
          </Card>
        )}

        {/* Key Strengths */}
        {taskEval.key_strengths && taskEval.key_strengths.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-success">
                <CheckCircle2 className="w-4 h-4" />
                Key Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {taskEval.key_strengths.map((s, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-success">•</span> {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Priority Improvements */}
        {taskEval.priority_improvements && taskEval.priority_improvements.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-primary">
                <Lightbulb className="w-4 h-4" />
                Priority Improvements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {taskEval.priority_improvements.map((s, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">{i + 1}.</span> {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Model Paragraph */}
        {taskEval.model_paragraph && (
          <Card className="border-primary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-primary">
                <FileText className="w-4 h-4" />
                Model Paragraph
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm italic bg-primary/5 p-4 rounded-lg border border-primary/10">
                {taskEval.model_paragraph}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="container max-w-5xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI Writing Evaluation</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Writing Test Results
            </h1>
            <p className="text-muted-foreground">
              Comprehensive analysis based on official IELTS 2025 criteria
            </p>
          </div>

          {/* Overall Band Score */}
          <Card className="mb-6 overflow-hidden">
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8">
              <div className="text-center">
                <Badge className="text-5xl md:text-6xl font-bold px-8 py-4 mb-4 bg-primary/20 text-primary border-primary/30">
                  {(result.overall_band || report?.overall_band || 0).toFixed(1)}
                </Badge>
                <p className="text-lg text-muted-foreground">Overall Band Score</p>
              </div>
              
              {/* Task Band Overview for Full Test */}
              {isFullTest && (
                <div className="grid grid-cols-2 gap-4 mt-8 max-w-md mx-auto">
                  <div className="text-center">
                    <div className={cn("text-2xl font-bold mb-1", getBandColor(report?.task1_band || 0))}>
                      {report?.task1_band?.toFixed(1) || 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground">Task 1 (Report)</p>
                  </div>
                  <div className="text-center">
                    <div className={cn("text-2xl font-bold mb-1", getBandColor(report?.task2_band || 0))}>
                      {report?.task2_band?.toFixed(1) || 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground">Task 2 (Essay)</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Evaluation Tabs */}
          {isFullTest ? (
            <Tabs defaultValue="task1" className="mb-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="task1">Task 1 Report</TabsTrigger>
                <TabsTrigger value="task2">Task 2 Essay</TabsTrigger>
                <TabsTrigger value="combined">Combined Feedback</TabsTrigger>
              </TabsList>

              <TabsContent value="task1" className="mt-6">
                {renderTaskEvaluation(report?.task1_evaluation, 1, report?.task1_band)}
              </TabsContent>

              <TabsContent value="task2" className="mt-6">
                {renderTaskEvaluation(report?.task2_evaluation, 2, report?.task2_band)}
              </TabsContent>

              <TabsContent value="combined" className="mt-6 space-y-4">
                {report?.combined_feedback && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Overall Assessment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {report.combined_feedback.overall_assessment}
                        </p>
                      </CardContent>
                    </Card>

                    {report.combined_feedback.writing_style_notes && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Writing Style Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {report.combined_feedback.writing_style_notes}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {report.combined_feedback.time_management_tips && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Time Management Tips</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {report.combined_feedback.time_management_tips}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {report.combined_feedback.next_steps && report.combined_feedback.next_steps.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <ArrowUpRight className="w-4 h-4" />
                            Next Steps
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {report.combined_feedback.next_steps.map((step, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="font-bold text-primary">{i + 1}.</span> {step}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            // Single task evaluation
            <div className="mb-6">
              {renderTaskEvaluation(singleTaskEval, 1)}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Button variant="outline" asChild>
              <Link to="/ai-practice">
                <Home className="w-4 h-4 mr-2" />
                Back to Practice
              </Link>
            </Button>
            <Button asChild>
              <Link to="/ai-practice?module=writing">
                <RotateCcw className="w-4 h-4 mr-2" />
                Practice Again
              </Link>
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
