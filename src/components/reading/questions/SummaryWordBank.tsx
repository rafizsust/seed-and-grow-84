import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface WordBankItem {
  id: string; // A, B, C...
  text: string;
}

interface SummaryWordBankProps {
  title?: string;
  // Content with gaps marked as {{31}}, {{32}}, etc.
  content: string;
  wordBank: Array<string | WordBankItem>;
  answers: Record<number, string>;
  onAnswerChange: (questionNumber: number, answer: string) => void;
  onQuestionFocus?: (questionNumber: number) => void;
  currentQuestion?: number;
  fontSize?: number;
}

export function SummaryWordBank({
  title,
  content,
  wordBank,
  answers,
  onAnswerChange,
  onQuestionFocus,
  currentQuestion,
  fontSize = 14,
}: SummaryWordBankProps) {
  const [draggedWord, setDraggedWord] = useState<string | null>(null);
  const [draggedFromGap, setDraggedFromGap] = useState<number | null>(null);
  const [isDragOverList, setIsDragOverList] = useState(false);
  const [dragOverGap, setDragOverGap] = useState<number | null>(null);
  // Click-to-select state
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  // Parse content to identify gaps
  const parseContent = useCallback(() => {
    const parts: Array<{ type: 'text' | 'gap'; value: string; questionNumber?: number }> = [];
    const regex = /\{\{(\d+)\}\}/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      // Add text before the gap
      if (match.index > lastIndex) {
        parts.push({ type: 'text', value: content.slice(lastIndex, match.index) });
      }
      // Add the gap
      parts.push({ type: 'gap', value: match[1], questionNumber: parseInt(match[1]) });
      lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({ type: 'text', value: content.slice(lastIndex) });
    }

    return parts;
  }, [content]);

  const normalizeWordBankItem = (item: string | WordBankItem) => {
    if (typeof item === 'string') {
      // Back-compat: treat string as both id and text
      return { id: item, text: item };
    }
    return { id: item.id, text: item.text };
  };

  // Get word bank item by ID for display
  const getWordById = (wordId: string): WordBankItem | null => {
    const item = wordBank.find(w => normalizeWordBankItem(w).id === wordId);
    return item ? normalizeWordBankItem(item) : null;
  };

  const handleDragStart = (wordId: string, fromGap?: number) => {
    setDraggedWord(wordId);
    setDraggedFromGap(fromGap ?? null);
    setSelectedWord(null); // Clear click selection on drag
  };

  const handleDragEnd = () => {
    setDraggedWord(null);
    setDraggedFromGap(null);
    setIsDragOverList(false);
    setDragOverGap(null);
  };

  const handleGapDragOver = (e: React.DragEvent, questionNumber: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverGap(questionNumber);
  };

  const handleGapDragLeave = () => {
    setDragOverGap(null);
  };

  const handleDrop = (questionNumber: number) => {
    if (draggedWord) {
      // If dragging from another gap, clear that gap first
      if (draggedFromGap !== null && draggedFromGap !== questionNumber) {
        onAnswerChange(draggedFromGap, '');
      }
      onAnswerChange(questionNumber, draggedWord);
      onQuestionFocus?.(questionNumber);
    }
    setDraggedWord(null);
    setDraggedFromGap(null);
    setDragOverGap(null);
  };

  // Handle dropping word back to the list (remove from gap)
  const handleListDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOverList(true);
  };

  const handleListDragLeave = () => {
    setIsDragOverList(false);
  };

  const handleListDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverList(false);
    // If dragged from a gap, remove it
    if (draggedFromGap !== null) {
      onAnswerChange(draggedFromGap, '');
    }
    setDraggedWord(null);
    setDraggedFromGap(null);
  };

  const handleClear = (questionNumber: number) => {
    onAnswerChange(questionNumber, '');
  };

  // Handle click selection (like MatchingHeadingsDragDrop)
  const handleWordClick = (wordId: string) => {
    if (selectedWord === wordId) {
      // Deselect if clicking same word
      setSelectedWord(null);
    } else {
      setSelectedWord(wordId);
    }
  };

  // Handle clicking on a gap when a word is selected
  const handleGapClick = (questionNumber: number, currentAnswer: string) => {
    if (selectedWord) {
      // Place selected word in this gap
      onAnswerChange(questionNumber, selectedWord);
      onQuestionFocus?.(questionNumber);
      setSelectedWord(null);
    } else if (currentAnswer) {
      // Click to remove
      handleClear(questionNumber);
    }
  };

  // Clear selection when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.summary-word-bank-container')) {
        setSelectedWord(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const parts = parseContent();

  // Only treat words as "used" within THIS summary's gap question numbers (prevents cross-group ghosting)
  const gapQuestionNumbers = new Set(
    parts
      .filter((p) => p.type === 'gap')
      .map((p) => p.questionNumber!)
  );

  const usedWords = Object.entries(answers)
    .filter(([qNum]) => gapQuestionNumbers.has(Number(qNum)))
    .map(([, val]) => val)
    .filter(Boolean);

  return (
    <div className="summary-word-bank-container flex gap-4" style={{ fontSize: `${fontSize}px` }}>
      {/* Summary Content */}
      <div className="flex-1">
        {title && (
          <h3 className="text-lg font-bold text-primary text-center mb-3">
            {title}
          </h3>
        )}

        <div className="leading-relaxed">
          {parts.map((part, index) => {
            if (part.type === 'text') {
              return <span key={index}>{part.value}</span>;
            }

            const questionNumber = part.questionNumber!;
            const answer = answers[questionNumber] || '';
            const isActive = currentQuestion === questionNumber;
            const isDragOver = dragOverGap === questionNumber;
            const canClickToPlace = !!selectedWord && !answer;
            const assignedWord = answer ? getWordById(answer) : null;
            const isDragging = draggedFromGap === questionNumber;

            // Filled state: show draggable word chip
            if (assignedWord) {
              return (
                <span
                  key={index}
                  draggable
                  onDragStart={() => handleDragStart(assignedWord.id, questionNumber)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleGapDragOver(e, questionNumber)}
                  onDragLeave={handleGapDragLeave}
                  onDrop={() => handleDrop(questionNumber)}
                  onClick={() => handleClear(questionNumber)}
                  title="Click to remove, or drag to move"
                  className={cn(
                    "inline-flex items-center justify-center min-w-24 h-8 mx-1 px-2 border-2 rounded cursor-pointer transition-all align-middle",
                    "border-primary bg-primary/10 border-solid",
                    "hover:border-[hsl(var(--ielts-drag-hover))]",
                    isDragging && "opacity-40 scale-95",
                    isDragOver && "border-[hsl(var(--ielts-drag-hover))] border-2"
                  )}
                >
                  <span className="font-medium text-sm">{assignedWord.text}</span>
                </span>
              );
            }

            // Empty state: drop zone
            return (
              <span
                key={index}
                onDragOver={(e) => handleGapDragOver(e, questionNumber)}
                onDragLeave={handleGapDragLeave}
                onDrop={() => handleDrop(questionNumber)}
                onClick={() => handleGapClick(questionNumber, answer)}
                className={cn(
                  "inline-flex items-center justify-center min-w-24 h-8 mx-1 border-2 rounded cursor-pointer transition-all align-middle",
                  "border-muted-foreground/40 border-dashed",
                  isDragOver && "border-[hsl(var(--ielts-drag-hover))] bg-[hsl(var(--ielts-input-focus)/0.15)]",
                  isActive && !isDragOver && "border-primary border-dashed bg-primary/5",
                  canClickToPlace && "border-[hsl(var(--ielts-drag-hover))] cursor-pointer hover:bg-[hsl(var(--ielts-input-focus)/0.15)]",
                  !isDragOver && !isActive && !canClickToPlace && "hover:border-primary/50"
                )}
              >
                {isDragOver ? (
                  <span className="text-[hsl(var(--ielts-input-focus))] text-sm font-medium">Drop here</span>
                ) : canClickToPlace ? (
                  <span className="text-[hsl(var(--ielts-input-focus))] text-sm font-medium">Click to place</span>
                ) : (
                  <span className="text-muted-foreground font-bold text-sm">
                    {questionNumber}
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>

      {/* Word Bank Sidebar */}
      <div className="w-44 flex-shrink-0">
        <div 
          className={cn(
            "sticky top-4 space-y-1.5 p-2 transition-colors rounded",
            isDragOverList && "bg-[hsl(var(--ielts-ghost))]"
          )}
          onDragOver={handleListDragOver}
          onDragLeave={handleListDragLeave}
          onDrop={handleListDrop}
        >
          {selectedWord && (
            <p className="text-xs text-muted-foreground mb-2">
              Click on a gap to place the selected word.
            </p>
          )}

          {wordBank.map((item, index) => {
            const wb = normalizeWordBankItem(item);
            const isUsed = usedWords.includes(wb.id);
            const isDragging = draggedWord === wb.id;
            const isSelected = selectedWord === wb.id;

            return (
              <div
                key={`${wb.id}-${index}`}
                className="min-h-[36px]"
              >
                {!isUsed ? (
                  <div
                    draggable
                    onDragStart={() => handleDragStart(wb.id)}
                    onDragEnd={handleDragEnd}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWordClick(wb.id);
                    }}
                    className={cn(
                      "px-2 py-1.5 border rounded text-center cursor-pointer transition-all text-sm",
                      "bg-background hover:border-primary hover:bg-primary/5 active:bg-primary/10",
                      isDragging && "opacity-40 scale-95",
                      isSelected && "border-2 border-[hsl(var(--ielts-drag-hover))] bg-[hsl(var(--ielts-input-focus)/0.1)] shadow-sm"
                    )}
                  >
                    <span>{wb.text}</span>
                  </div>
                ) : (
                  // Empty placeholder to maintain position, matching Matching Headings behavior
                  <div className="h-full" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
