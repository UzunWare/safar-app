/**
 * ContentPreview Component Tests
 *
 * Story 6.5: Paywall Enforcement - Task 3
 * Tests the content preview that shows first N words with blur overlay.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { ContentPreview } from '@/components/subscription/ContentPreview';

const mockWords = [
  { id: 'w1', arabic: 'بسم', transliteration: 'Bismillah', meaning: 'In the name of' },
  { id: 'w2', arabic: 'الله', transliteration: 'Allah', meaning: 'God' },
  { id: 'w3', arabic: 'الرحمن', transliteration: 'Ar-Rahman', meaning: 'The Most Gracious' },
  { id: 'w4', arabic: 'الرحيم', transliteration: 'Ar-Raheem', meaning: 'The Most Merciful' },
];

describe('ContentPreview', () => {
  it('should render first 2 words as preview', () => {
    const { getByText, queryByText } = render(
      <ContentPreview words={mockWords} previewCount={2} />
    );

    expect(getByText('بسم')).toBeTruthy();
    expect(getByText('الله')).toBeTruthy();
    // Words beyond preview should not be visible
    expect(queryByText('الرحمن')).toBeNull();
    expect(queryByText('الرحيم')).toBeNull();
  });

  it('should show blur overlay over remaining content', () => {
    const { getByTestId } = render(
      <ContentPreview words={mockWords} previewCount={2} />
    );

    expect(getByTestId('content-blur-overlay')).toBeTruthy();
  });

  it('should show "Subscribe to continue" message', () => {
    const { getByText } = render(
      <ContentPreview words={mockWords} previewCount={2} />
    );

    expect(getByText('Subscribe to continue')).toBeTruthy();
  });

  it('should show word count remaining', () => {
    const { getByText } = render(
      <ContentPreview words={mockWords} previewCount={2} />
    );

    expect(getByText('2 more words in this lesson')).toBeTruthy();
  });

  it('should default to 2 preview words', () => {
    const { getByText } = render(<ContentPreview words={mockWords} />);

    expect(getByText('بسم')).toBeTruthy();
    expect(getByText('الله')).toBeTruthy();
  });

  it('should handle case where words are fewer than preview count', () => {
    const fewWords = mockWords.slice(0, 1);
    const { getByText, queryByTestId } = render(
      <ContentPreview words={fewWords} previewCount={2} />
    );

    expect(getByText('بسم')).toBeTruthy();
    // No blur needed when all words shown
    expect(queryByTestId('content-blur-overlay')).toBeNull();
  });

  it('should handle empty words array', () => {
    const { getByTestId } = render(<ContentPreview words={[]} previewCount={2} />);

    expect(getByTestId('content-preview-empty')).toBeTruthy();
  });
});
