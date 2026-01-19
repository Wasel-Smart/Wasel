import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../../components/ui/button';

describe('Button Component', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('should support different variants', () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});