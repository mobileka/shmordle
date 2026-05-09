import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GridCell } from './GridCell';

describe('GridCell', () => {
  it('renders letter text', () => {
    render(
      <GridCell letter="A" status="default" delay={0} shouldAnimate={false} isFilled={false} />
    );
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('applies correct status class', () => {
    const { container } = render(
      <GridCell letter="A" status="correct" delay={0} shouldAnimate={false} isFilled={false} />
    );
    expect(container.firstChild).toHaveClass('correct');
  });

  it('applies animation delay as style', () => {
    const { container } = render(
      <GridCell letter="A" status="default" delay={300} shouldAnimate={false} isFilled={false} />
    );
    expect(container.firstChild).toHaveStyle({ animationDelay: '300ms' });
  });

  it('applies filled class when isFilled', () => {
    const { container } = render(
      <GridCell letter="A" status="default" delay={0} shouldAnimate={false} isFilled={true} />
    );
    expect(container.firstChild).toHaveClass('filled');
  });

  it('applies animating class when shouldAnimate', () => {
    const { container } = render(
      <GridCell letter="A" status="correct" delay={0} shouldAnimate={true} isFilled={false} />
    );
    expect(container.firstChild).toHaveClass('animating');
  });
});
