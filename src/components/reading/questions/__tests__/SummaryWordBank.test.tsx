import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { SummaryWordBank } from '../SummaryWordBank';

describe('SummaryWordBank', () => {
  const defaultProps = {
    content: 'The {{31}} was found in the {{32}} area.',
    wordBank: ['artifact', 'ancient', 'modern', 'temple'],
    answers: {} as Record<number, string>,
    onAnswerChange: vi.fn(),
  };

  describe('cross-group scoping', () => {
    it('should not ghost words used in OTHER question groups', () => {
      // Simulate answers from another group (questions 1-10) alongside this group (31-32)
      const answersFromMultipleGroups = {
        1: 'artifact',  // Answer from a DIFFERENT group
        2: 'ancient',   // Answer from a DIFFERENT group
        31: '',         // This group - empty
        32: '',         // This group - empty
      };

      render(
        <SummaryWordBank
          {...defaultProps}
          answers={answersFromMultipleGroups}
        />
      );

      // "artifact" and "ancient" should NOT be ghosted since they're used in a different group
      // They should be visible and draggable in the word bank
      const artifactWord = screen.getByText('artifact');
      const ancientWord = screen.getByText('ancient');
      
      // Words should be rendered (not replaced by empty placeholders)
      expect(artifactWord).toBeInTheDocument();
      expect(ancientWord).toBeInTheDocument();
      // They should be draggable
      expect(artifactWord.closest('[draggable]')).toHaveAttribute('draggable', 'true');
      expect(ancientWord.closest('[draggable]')).toHaveAttribute('draggable', 'true');
    });

    it('should ghost words used within THIS question group', () => {
      const answersWithinThisGroup = {
        31: 'artifact',  // Used in THIS group
        32: '',          // Empty in this group
      };

      render(
        <SummaryWordBank
          {...defaultProps}
          answers={answersWithinThisGroup}
        />
      );

      // When a word is used in this group, the word bank slot should be empty (placeholder)
      // The word "artifact" should appear in the filled gap, not in the word bank as draggable
      const artifactElements = screen.getAllByText('artifact');
      
      // Only one instance should exist (in the gap), not in the word bank
      expect(artifactElements.length).toBe(1);
      
      // The artifact in the gap should be part of a filled drop zone (has border-primary class)
      expect(artifactElements[0].closest('.border-primary')).toBeInTheDocument();
    });

    it('should correctly identify gap question numbers from content', () => {
      const customContent = 'Question {{15}} and {{16}} are in this group.';
      const mixedAnswers = {
        1: 'word1',   // Different group
        15: 'temple', // This group
        16: '',       // This group - empty
        20: 'word2',  // Different group
      };

      render(
        <SummaryWordBank
          {...defaultProps}
          content={customContent}
          answers={mixedAnswers}
        />
      );

      // "temple" used in question 15 should be in the gap, not in the word bank
      const templeElements = screen.getAllByText('temple');
      expect(templeElements.length).toBe(1); // Only in the gap, not word bank
      
      // "artifact" should still be draggable in the word bank (not used in questions 15-16)
      const artifactWord = screen.getByText('artifact');
      expect(artifactWord.closest('[draggable]')).toHaveAttribute('draggable', 'true');
    });
  });

  describe('rendering', () => {
    it('should render word bank with all words', () => {
      render(<SummaryWordBank {...defaultProps} />);

      defaultProps.wordBank.forEach(word => {
        expect(screen.getByText(word)).toBeInTheDocument();
      });
    });

    it('should render gap placeholders with question numbers', () => {
      render(<SummaryWordBank {...defaultProps} />);

      expect(screen.getByText('31')).toBeInTheDocument();
      expect(screen.getByText('32')).toBeInTheDocument();
    });

    it('should display answered values in gaps', () => {
      render(
        <SummaryWordBank
          {...defaultProps}
          answers={{ 31: 'artifact', 32: 'temple' }}
        />
      );

      // Should show the answers in the gaps (these appear as filled gaps)
      const artifacts = screen.getAllByText('artifact');
      expect(artifacts.length).toBe(1); // Only in gap, not in word bank
      
      const temples = screen.getAllByText('temple');
      expect(temples.length).toBe(1); // Only in gap, not in word bank
    });
  });

  describe('word bank item format', () => {
    it('should handle object format word bank items {id, text}', () => {
      const objectWordBank = [
        { id: 'A', text: 'apple' },
        { id: 'B', text: 'banana' },
        { id: 'C', text: 'cherry' },
      ];

      render(
        <SummaryWordBank
          content="I like {{1}} and {{2}}."
          wordBank={objectWordBank}
          answers={{}}
          onAnswerChange={vi.fn()}
        />
      );

      // Should display only the text, not the letter labels
      expect(screen.getByText('apple')).toBeInTheDocument();
      expect(screen.getByText('banana')).toBeInTheDocument();
      expect(screen.getByText('cherry')).toBeInTheDocument();
      
      // Should NOT display letter labels
      expect(screen.queryByText('A')).not.toBeInTheDocument();
      expect(screen.queryByText('B')).not.toBeInTheDocument();
      expect(screen.queryByText('C')).not.toBeInTheDocument();
    });

    it('should display full word text in drop zone when answered', () => {
      const objectWordBank = [
        { id: 'A', text: 'apple' },
        { id: 'B', text: 'banana' },
      ];

      render(
        <SummaryWordBank
          content="I like {{1}}."
          wordBank={objectWordBank}
          answers={{ 1: 'A' }} // Answer stores the ID
          onAnswerChange={vi.fn()}
        />
      );

      // Should display the full text "apple" not the letter "A"
      expect(screen.getByText('apple')).toBeInTheDocument();
      // The letter should not be shown anywhere
      expect(screen.queryByText('A')).not.toBeInTheDocument();
    });
  });
});
