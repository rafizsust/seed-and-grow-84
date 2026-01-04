import { cn } from '@/lib/utils';
import { QuestionTextWithTools } from '@/components/common/QuestionTextWithTools';
import { TableCell as TableCellData, TableData } from '@/components/admin/ListeningQuestionGroupEditor';

interface ListeningTableCompletionProps {
  testId: string;
  questionId: string;
  tableData: TableData;
  answers: Record<number, string>;
  onAnswerChange: (questionNumber: number, answer: string) => void;
  fontSize: number;
  renderRichText: (text: string) => string;
  tableHeading?: string;
  tableHeadingAlignment?: 'left' | 'center' | 'right';
}

export function ListeningTableCompletion({
  testId,
  questionId,
  tableData,
  answers,
  onAnswerChange,
  fontSize,
  renderRichText,
  tableHeading,
  tableHeadingAlignment = 'left',
}: ListeningTableCompletionProps) {
  // HYBRID FIX: Support both Legacy Arrays (Cambridge) and New Objects (AI)
  let rawRows: any[] = [];

  if (Array.isArray(tableData)) {
    // SCENARIO 1: Legacy/Cambridge (Already an Array) -> KEEP AS IS
    rawRows = tableData;
  } else if (typeof tableData === 'object' && tableData !== null) {
    // SCENARIO 2: AI/New (Object with 'rows') -> Extract rows
    rawRows = (tableData as any).rows || [];
  }

  // Normalization: Ensure keys are consistent (camelCase vs snake_case)
  const normalizedRows = rawRows.map((row: any[]) =>
    row.map((cell: any) => ({
      ...cell,
      hasQuestion: cell.hasQuestion ?? cell.has_question,
      questionNumber: cell.questionNumber ?? cell.question_number,
      content: cell.content ?? cell.text ?? ''
    }))
  );

  // Use normalizedRows for rendering
  const headerRow = normalizedRows.length > 0 ? normalizedRows[0] : [];
  const bodyRows = normalizedRows.length > 1 ? normalizedRows.slice(1) : [];

  // Get alignment class
  const getAlignmentClass = (alignment?: string) => {
    switch (alignment) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  return (
    <div className="mt-4">
      {/* Optional Table Heading */}
      {tableHeading && (
        <div 
          className={cn(
            "mb-2 font-bold text-foreground",
            getAlignmentClass(tableHeadingAlignment)
          )}
          style={{ fontSize: `${fontSize}px` }}
        >
          <QuestionTextWithTools
            testId={testId}
            contentId={`${questionId}-table-heading`}
            text={tableHeading}
            fontSize={fontSize}
            renderRichText={renderRichText}
            isActive={false}
          />
        </div>
      )}

      {/* Table - Official IELTS Style */}
      <div className="overflow-x-auto">
        <table
          className="border-collapse w-full table-fixed"
          style={{
            borderTop: '1px solid #000',
            borderLeft: '1px solid #000',
          }}
        >
          {/* Header Row - White background, bold text, black borders */}
          {headerRow.length > 0 && (
            <thead>
              <tr>
                {headerRow.map((cell: TableCellData, colIndex) => (
                  <th
                    key={colIndex}
                    className={cn(
                      "bg-white px-3 py-2 font-bold text-black",
                      getAlignmentClass(cell.alignment)
                    )}
                    style={{
                      borderRight: '1px solid #000',
                      borderBottom: '1px solid #000',
                      fontSize: `${fontSize}px`,
                      minWidth: '120px',
                    }}
                  >
                    <QuestionTextWithTools
                      testId={testId}
                      contentId={`${questionId}-header-${colIndex}`}
                      text={cell.content}
                      fontSize={fontSize}
                      renderRichText={renderRichText}
                      isActive={false}
                    />
                  </th>
                ))}
              </tr>
            </thead>
          )}

          {/* Body Rows */}
          <tbody>
            {bodyRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell: any, colIndex) => {
                  const isQuestionCell = Boolean(cell?.has_question ?? cell?.hasQuestion);
                  const questionNumber = Number(cell?.question_number ?? cell?.questionNumber ?? 0) || undefined;

                  // Inline blanks use 2+ underscores
                  const hasInlineBlank = /_{2,}/.test(String(cell?.content ?? ''));
                  const parts = hasInlineBlank ? String(cell?.content ?? '').split(/_{2,}/) : [String(cell?.content ?? '')];

                  const currentAnswerString = (questionNumber ? answers[questionNumber] : '') || '';
                  const currentAnswers = parts.length - 1 > 1 ? currentAnswerString.split(',') : [currentAnswerString];

                  return (
                    <td
                      key={colIndex}
                      className={cn(
                        "bg-white px-3 py-2 text-black align-top break-words",
                        getAlignmentClass(cell.alignment)
                      )}
                      style={{
                        borderRight: '1px solid #000',
                        borderBottom: '1px solid #000',
                        fontSize: `${fontSize}px`,
                        minWidth: '120px',
                        maxWidth: '300px',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                      }}
                    >
                      {isQuestionCell ? (
                        <span className="text-black" style={{ lineHeight: '2.2' }}>
                          {hasInlineBlank ? (
                            parts.map((part, partIndex) => (
                              <span key={partIndex}>
                                {part && (
                                  <QuestionTextWithTools
                                    testId={testId}
                                    contentId={`${questionId}-row-${rowIndex}-col-${colIndex}-part-${partIndex}`}
                                    text={part}
                                    fontSize={fontSize}
                                    renderRichText={renderRichText}
                                    isActive={false}
                                    as="span"
                                  />
                                )}

                                {partIndex < parts.length - 1 && (
                                  <input
                                    type="text"
                                    value={currentAnswers[partIndex] || ''}
                                    onChange={(e) => {
                                      const newAnswers = [...currentAnswers];
                                      newAnswers[partIndex] = e.target.value;

                                       const updatedAnswer = parts.length - 1 > 1 ? newAnswers.join(',') : newAnswers[0];
                                       if (questionNumber) onAnswerChange(questionNumber, updatedAnswer);
                                     }}
                                     placeholder={questionNumber ? String(questionNumber) : ''}
                                    className={cn(
                                      "ielts-input h-7 text-sm font-normal px-2 w-28 rounded-[3px] text-center placeholder:text-center placeholder:font-bold placeholder:text-foreground/70",
                                      "bg-background border border-[hsl(var(--ielts-input-border))] text-foreground",
                                      "focus:outline-none focus:border-[hsl(var(--ielts-input-focus))] focus:ring-0",
                                      "transition-colors inline align-middle mx-1"
                                    )}
                                  />
                                )}
                              </span>
                            ))
                          ) : (
                            <>
                              {cell.content ? (
                                <QuestionTextWithTools
                                  testId={testId}
                                  contentId={`${questionId}-row-${rowIndex}-col-${colIndex}-text`}
                                  text={cell.content}
                                  fontSize={fontSize}
                                  renderRichText={renderRichText}
                                  isActive={false}
                                  as="span"
                                />
                              ) : null}{' '}
                              <input
                                type="text"
                                 value={currentAnswers[0] || ''}
                                 onChange={(e) => questionNumber && onAnswerChange(questionNumber, e.target.value)}
                                 placeholder={questionNumber ? String(questionNumber) : ''}
                                 className={cn(
                                   "ielts-input h-7 text-sm font-normal px-2 w-28 rounded-[3px] text-center placeholder:text-center placeholder:font-bold placeholder:text-foreground/70",
                                   "bg-background border border-[hsl(var(--ielts-input-border))] text-foreground",
                                   "focus:outline-none focus:border-[hsl(var(--ielts-input-focus))] focus:ring-0",
                                   "transition-colors inline align-middle"
                                 )}
                              />
                            </>
                          )}
                        </span>
                      ) : (
                        <QuestionTextWithTools
                          testId={testId}
                          contentId={`${questionId}-row-${rowIndex}-col-${colIndex}`}
                          text={cell.content}
                          fontSize={fontSize}
                          renderRichText={renderRichText}
                          isActive={false}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
