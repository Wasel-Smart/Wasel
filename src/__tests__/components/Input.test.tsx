import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from '../../components/ui/input';

describe('Input Component', () => {
  it('should render input field', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should handle value changes', () => {
    render(<Input defaultValue="test" />);
    expect(screen.getByDisplayValue('test')).toBeInTheDocument();
  });

  it('should support different types', () => {
    render(<Input type="email" placeholder="Email" />);
    expect(screen.getByPlaceholderText('Email')).toHaveAttribute('type', 'email');
  });
});