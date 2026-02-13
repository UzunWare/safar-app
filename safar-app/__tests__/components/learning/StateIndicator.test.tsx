import React from 'react';
import { render } from '@testing-library/react-native';
import { StateIndicator } from '@/components/learning/StateIndicator';

describe('StateIndicator', () => {
  describe('color coding (AC#1) - Divine Geometry Palette', () => {
    it('renders Divine Geometry black[20] dot for new state', () => {
      const { getByTestId } = render(<StateIndicator state="new" />);
      const dot = getByTestId('state-dot');
      expect(dot.props.style).toMatchObject({ backgroundColor: 'rgba(0, 0, 0, 0.20)' });
    });

    it('renders Divine Geometry gold dot for learning state', () => {
      const { getByTestId } = render(<StateIndicator state="learning" />);
      const dot = getByTestId('state-dot');
      expect(dot.props.style).toMatchObject({ backgroundColor: '#cfaa6b' });
    });

    it('renders Divine Geometry rating.hard dot for review state', () => {
      const { getByTestId } = render(<StateIndicator state="review" />);
      const dot = getByTestId('state-dot');
      expect(dot.props.style).toMatchObject({ backgroundColor: '#c9943f' });
    });

    it('renders Divine Geometry emeraldDeep dot for mastered state', () => {
      const { getByTestId } = render(<StateIndicator state="mastered" />);
      const dot = getByTestId('state-dot');
      expect(dot.props.style).toMatchObject({ backgroundColor: '#0f2e28' });
    });
  });

  describe('label display', () => {
    it('does not show label by default', () => {
      const { queryByText } = render(<StateIndicator state="new" />);
      expect(queryByText('New')).toBeNull();
    });

    it('shows label when showLabel is true', () => {
      const { getByText } = render(<StateIndicator state="learning" showLabel />);
      expect(getByText('Learning')).toBeTruthy();
    });

    it('shows correct labels for all states', () => {
      const { rerender, getByText } = render(<StateIndicator state="new" showLabel />);
      expect(getByText('New')).toBeTruthy();

      rerender(<StateIndicator state="learning" showLabel />);
      expect(getByText('Learning')).toBeTruthy();

      rerender(<StateIndicator state="review" showLabel />);
      expect(getByText('Review')).toBeTruthy();

      rerender(<StateIndicator state="mastered" showLabel />);
      expect(getByText('Mastered')).toBeTruthy();
    });
  });

  describe('layout', () => {
    it('renders dot with correct size', () => {
      const { getByTestId } = render(<StateIndicator state="new" />);
      const dot = getByTestId('state-dot');
      // NativeWind className="w-3 h-3" → width: 12, height: 12
      expect(dot.props.className).toContain('w-3');
      expect(dot.props.className).toContain('h-3');
    });

    it('renders rounded dot', () => {
      const { getByTestId } = render(<StateIndicator state="new" />);
      const dot = getByTestId('state-dot');
      expect(dot.props.className).toContain('rounded-full');
    });

    it('uses flex-row layout for label', () => {
      const { getByTestId } = render(<StateIndicator state="new" showLabel />);
      const container = getByTestId('state-indicator');
      expect(container.props.className).toContain('flex-row');
      expect(container.props.className).toContain('items-center');
    });
  });
});
