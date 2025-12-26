import { cn } from '@/lib/utils';

interface NoteItem {
  question_number: number;
  text_before: string;
  text_after: string;
}

interface NoteSection {
  heading?: string;
  items: NoteItem[];
}

interface NoteCompletionProps {
  title?: string;
  sections: NoteSection[];
  answers: Record<number, string>;
  onAnswerChange: (questionNumber: number, answer: string) => void;
  currentQuestion?: number;
  fontSize?: number;
}

export function NoteCompletion({
  title,
  sections,
  answers,
  onAnswerChange,
  currentQuestion,
  fontSize = 14,
}: NoteCompletionProps) {
  return (
    <div className="space-y-3" style={{ fontSize: `${fontSize}px` }}>
      {/* Main Title */}
      {title && (
        <h3 className="text-lg font-bold text-primary text-center">
          {title}
        </h3>
      )}

      {/* Sections */}
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="space-y-1">
          {/* Section Heading */}
          {section.heading && (
            <h4 className="font-semibold text-primary">
              {section.heading}
            </h4>
          )}

          {/* Bullet Items */}
          <ul className="space-y-1 list-none">
            {section.items.map((item) => {
              const isActive = currentQuestion === item.question_number;
              const answer = answers[item.question_number] || '';

              return (
                <li
                  key={item.question_number}
                  className={cn(
                    "flex items-start gap-2 pl-4 relative",
                    isActive && "bg-primary/5 -mx-2 px-6 py-2 rounded"
                  )}
                >
                  {/* Bullet point */}
                  <span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-foreground rounded-full" />
                  
                  {/* Text with inline input */}
                  <div className="flex flex-wrap items-center gap-1 leading-relaxed">
                    <span>{item.text_before}</span>
                    <div className="inline-flex items-center">
                      <span className="relative inline-flex items-center">
                        <input
                          value={answer}
                          onChange={(e) => onAnswerChange(item.question_number, e.target.value)}
                          aria-label={`Answer for question ${item.question_number}`}
                          className={cn(
                            "h-7 text-sm font-normal pl-7 pr-2 min-w-[174px] max-w-full rounded-[3px]",
                            "bg-[hsl(var(--ielts-input-bg,0_0%_100%))] border border-[hsl(var(--ielts-input-border))] text-foreground",
                            "focus:outline-none focus:border-[hsl(var(--ielts-input-focus))] focus:ring-0",
                            "transition-colors",
                            isActive && "border-[hsl(var(--ielts-input-focus))]"
                          )}
                        />
                        {answer ? (
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm font-bold text-foreground pointer-events-none">
                            {item.question_number}
                          </span>
                        ) : (
                          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-bold text-foreground/70 pointer-events-none">
                            {item.question_number}
                          </span>
                        )}
                      </span>
                    </div>
                    {item.text_after && <span>{item.text_after}</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
