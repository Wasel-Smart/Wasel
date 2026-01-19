import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '../../contexts/AuthContext';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { AIProvider } from '../../contexts/AIContext';

describe('Context Providers', () => {
  describe('AuthProvider', () => {
    it('should provide auth context', () => {
      const TestComponent = () => <div>Auth Provider Test</div>;
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      expect(screen.getByText('Auth Provider Test')).toBeInTheDocument();
    });
  });

  describe('LanguageProvider', () => {
    it('should provide language context', () => {
      const TestComponent = () => <div>Language Provider Test</div>;
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );
      expect(screen.getByText('Language Provider Test')).toBeInTheDocument();
    });
  });

  describe('AIProvider', () => {
    it('should provide AI context', () => {
      const TestComponent = () => <div>AI Provider Test</div>;
      render(
        <AIProvider>
          <TestComponent />
        </AIProvider>
      );
      expect(screen.getByText('AI Provider Test')).toBeInTheDocument();
    });
  });
});