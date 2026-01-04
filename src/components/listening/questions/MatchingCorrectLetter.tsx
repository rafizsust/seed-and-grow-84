import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { QuestionTextWithTools } from '@/components/common/QuestionTextWithTools';

interface Question {
  id: string;
  question_number: number;
  question_text: string;
  instruction?: string | null;
  is_given: boolean;
  heading?: string | null;
  correct_answer: string;
}

interface MatchingCorrectLetterProps {
  testId: string;
  question: Question;
  answer: string | undefined;
  onAnswerChange: (answer: string) => void;
  groupOptions: string[]; // e.g., ['A', 'B', 'C'] or ['i', 'ii', 'iii']
  groupOptionFormat: string; // e.g., 'A' or 'i'
  fontSize: number;
  renderRichText: (text: string) => string;
  isActive: boolean;
}

export function MatchingCorrectLetter({
  testId,
  question,
  answer,
  onAnswerChange,
  groupOptions,
  groupOptionFormat,
  fontSize,
  renderRichText,
  isActive: _isActive,
}: MatchingCorrectLetterProps) {

  const getOptionLabel = (index: number, format: string) => {
    if (format === '1') return String(index + 1);
    if (format === 'i') {
      const romanNumerals = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii'];
      return romanNumerals[index] || String(index + 1);
    }
    return String.fromCharCode(65 + index);
  };

  return (
    <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
      {/* Question Heading (if any) */}
      {question.heading && (
        <div className="mb-2">
          <QuestionTextWithTools
            testId={testId}
            contentId={`${question.id}-heading`}
            text={question.heading}
            fontSize={fontSize}
            renderRichText={renderRichText}
            isActive={false} 
          />
        </div>
      )}

      {/* Question text first, then dropdown with question number on right */}
      <div className="flex items-center flex-wrap gap-2">
        {/* Question text only (no number before it) */}
        <QuestionTextWithTools
          testId={testId}
          contentId={question.id}
          text={question.question_text}
          fontSize={fontSize}
          renderRichText={renderRichText}
          isActive={false}
          as="span"
        />
        
        {/* Dropdown with question number inside - matching Maps style */}
        <Select
          value={answer || ''}
          onValueChange={onAnswerChange}
          disabled={question.is_given}
        >
          <SelectTrigger
            className={cn(
              "w-28 h-7 text-sm flex-shrink-0 rounded-[3px]",
              "bg-[hsl(var(--ielts-input-bg,0_0%_100%))] border border-[hsl(var(--ielts-input-border))] text-foreground",
              "focus:border-[hsl(var(--ielts-input-focus))] focus:ring-0",
              "data-[state=open]:border-[hsl(var(--ielts-input-focus))]"
            )}
            style={{ fontFamily: 'var(--font-ielts)' }}
          >
            <div className="flex items-center gap-1.5 w-full">
              <span className="font-semibold text-foreground">{question.question_number}</span>
              {answer ? (
                <span>{answer}</span>
              ) : (
                <span className="text-muted-foreground"></span>
              )}
            </div>
          </SelectTrigger>
          <SelectContent className="bg-background border border-[hsl(var(--ielts-input-border))] shadow-md z-50 rounded-[3px]">
            {groupOptions.map((_optionText, idx) => {
              const optionValue = getOptionLabel(idx, groupOptionFormat);
              return (
                <SelectItem 
                  key={optionValue} 
                  value={optionValue}
                  className="cursor-pointer"
                  style={{ fontFamily: 'var(--font-ielts)' }}
                >
                  {optionValue}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}