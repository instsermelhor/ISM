import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

const ProblemChild: React.FC = () => {
  throw new Error('Test Exception in Child Component');
};

describe('Admin ErrorBoundary — C001 Telemetry', () => {
  it('catches runtime exception and renders recovery UI with error ID', () => {
    // Suppress console.error during expected throw
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Painel Administrativo ISM')).toBeInTheDocument();
    expect(screen.getByText(/ID do Erro:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Recarregar Painel/i })).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
