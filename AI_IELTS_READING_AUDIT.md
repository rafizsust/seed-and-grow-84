# IELTS AI Reading Practice - Comprehensive Audit Report

## Official IELTS Reading Question Types (14 Types)

Based on research from IDP IELTS, Cambridge English, and IELTS Liz:

### 1. **Matching Headings**
- **Task**: Match headings (i, ii, iii...) to paragraphs (A, B, C...)
- **More headings than paragraphs** (2-3 distractors)
- **Official Format**: Headings use Roman numerals (i, ii, iii)
- **Answers**: Roman numerals
- **Current Status**: ✅ Implemented correctly

### 2. **True/False/Not Given & Yes/No/Not Given**
- **Task**: Decide if statement agrees with passage (T), contradicts it (F), or no info (NG)
- **Answers come in order**
- **Official Format**: Statements listed with T/F/NG options
- **Current Status**: ✅ Implemented correctly

### 3. **Matching Information (Paragraph Information)**
- **Task**: Match statements to paragraphs containing that info
- **Official Format**: "Which paragraph contains the following information?"
- **Answers**: Letters (A, B, C, D, E...)
- **Some paragraphs may not be used, some may be used more than once**
- **Current Status**: ✅ Implemented, but options should show paragraph letters + brief description

### 4. **Summary Completion (with/without word bank)**
- **Two variations**:
  1. Words from passage (NO MORE THAN X WORDS)
  2. Words from a list (A-H)
- **Official Format**: Summary text with numbered gaps
- **Answers in order**
- **Current Status**: ⚠️ Word bank display needs fixing - should show "A technology", "B environment", etc.

### 5. **Sentence Completion**
- **Task**: Complete sentences using words from passage
- **Official Format**: "Complete the sentences below. Choose NO MORE THAN THREE WORDS from the passage."
- **Answers in order**
- **Current Status**: ⚠️ When using word bank, should display dropdown with options + table showing all options below

### 6. **Multiple Choice (Single Answer)**
- **Task**: Choose correct answer from A, B, C, or D
- **Official Format**: Question followed by 4 options
- **Answers in order**
- **Current Status**: ✅ Implemented correctly

### 7. **Multiple Choice (Multiple Answers - Choose 2/3)**
- **Task**: Choose TWO/THREE letters from A-E or A-G
- **Official Format**: "Choose TWO letters, A-E"
- **Counts as multiple question numbers** (e.g., Q1-2 if choose 2)
- **Current Status**: ⚠️ Question range should reflect max_answers (e.g., "Questions 1-2" for choose TWO)

### 8. **List Selection / Classification / Matching Features**
- **Task**: Match items to categories (e.g., match statements to researchers)
- **Official Format**: List of categories (A-F) + statements
- **Some options may be used more than once**
- **Current Status**: ✅ Implemented correctly

### 9. **Matching Sentence Endings**
- **Task**: Match sentence beginnings to endings
- **More endings than beginnings** (distractors)
- **Official Format**: Beginnings follow passage order
- **Current Status**: ✅ Implemented correctly

### 10. **Table Completion**
- **Task**: Fill in table using words from passage
- **Official Format**: Table with empty cells marked with question numbers
- **Current Status**: ⚠️ Needs proper rendering in AI practice

### 11. **Flow-chart Completion**
- **Task**: Complete flowchart showing a process
- **Official Format**: Boxes connected by arrows, blanks numbered
- **Answers may not be in order**
- **Current Status**: ⚠️ Underscores should be hidden (only show input fields)

### 12. **Note Completion**
- **Task**: Complete notes using words from passage
- **Official Format**: Bullet points with blanks
- **Current Status**: ⚠️ Duplicate question numbers appearing - FIXED

### 13. **Diagram/Map Labeling**
- **Task**: Label a diagram using words from passage or list
- **Official Format**: Diagram with numbered points
- **Current Status**: ⚠️ Serial answer bug - AI generating answers sequentially

### 14. **Short Answer Questions**
- **Task**: Answer factual questions with words from passage
- **Official Format**: Direct questions, NO MORE THAN X WORDS
- **Answers in order**
- **Current Status**: ✅ Implemented as FILL_IN_BLANK

---

## Issues Found & Fixes Required

### Issue 1: SUMMARY_WORD_BANK - No word list displayed
**Problem**: Word bank sidebar not showing options properly
**Fix**: Pass full `{id, text}` objects to SummaryWordBank component
**Status**: FIXED in this session

### Issue 2: MULTIPLE_CHOICE_MULTIPLE - Wrong question range
**Problem**: Shows "Questions 1 to 5" when it should show "Questions 1-2" for choose TWO
**Fix**: Calculate question range as `startQ` to `startQ + maxAnswers - 1`
**Status**: Already correct in code, but needs verification

### Issue 3: NOTE_COMPLETION - Duplicate question numbers
**Problem**: Number shows twice (as placeholder AND as positioned text)
**Fix**: Remove placeholder, center number when input is empty
**Status**: FIXED in this session

### Issue 4: MAP_LABELING - Sequential answers bug
**Problem**: AI generates answers as A, B, C, D in order (question 1=A, 2=B, etc.)
**Fix**: Update AI prompt to randomize correct answers
**Status**: Needs fix

### Issue 5: MULTIPLE_CHOICE_MULTIPLE Explanations
**Problem**: Explanation doesn't properly address partial correctness
**Fix**: Update explain-answer edge function to handle MCQ multiple properly
**Status**: Needs fix

### Issue 6: Retake Test Button
**Problem**: No way to retake the same test after viewing results
**Fix**: Add "Retake this test" button on results page
**Status**: FIXED in this session

---

## Prompt Quality Improvements Needed

### MAP_LABELING Prompt Fix
Add instruction to randomize correct answers:
```
- IMPORTANT: Correct answers must NOT be in sequential order (e.g., don't make Q1=A, Q2=B, Q3=C)
- Randomize which label corresponds to which question
```

### MULTIPLE_CHOICE_MULTIPLE Explanation Enhancement
Update the explain-answer function to:
1. Check if question type is MULTIPLE_CHOICE_MULTIPLE
2. Compare each selected option to correct options
3. Explain which selections were right/wrong individually

---

## Verification Checklist

After fixes:
- [ ] Summary/Word Bank shows "A technology", "B environment" format
- [ ] Multiple Choice Multiple shows correct question range
- [ ] Note Completion shows single centered number in empty inputs
- [ ] Map Labeling has randomized answers
- [ ] Retake button works on results page
- [ ] Explanations handle partial MCQ answers correctly
