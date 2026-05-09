import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';

describe('Header', () => {
  it('renders the title Shmordle', () => {
    render(<Header />);
    expect(screen.getByRole('heading', { name: 'Shmordle' })).toBeInTheDocument();
  });

  it('renders a header element', () => {
    render(<Header />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});
