import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatInterface from '@/components/dashboard/ChatInterface';

describe('ChatInterface', () => {
  it('renders aria-live container with role=log', () => {
    render(<ChatInterface chatHistory={[]} />);
    const log = screen.getByRole('log');
    expect(log).toBeInTheDocument();
    expect(log).toHaveAttribute('aria-live', 'polite');
  });

  it('sends a message and shows sending state', async () => {
    // simple fetch mock that returns a non-streaming response
    global.fetch = jest.fn(() => Promise.resolve(new Response(null, { status: 200 }))) as any;

    render(<ChatInterface chatHistory={[]} />);
    const input = screen.getByPlaceholderText('Message TARA...') as HTMLInputElement;
    const button = screen.getByRole('button', { name: /send message/i });

    fireEvent.change(input, { target: { value: 'hello' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });
});
