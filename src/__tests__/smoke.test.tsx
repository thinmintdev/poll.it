import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from '../pages/index';

test('renders create new poll heading', () => {
  render(<HomePage />);
  expect(screen.getByRole('heading', { name: /create new poll/i })).toBeInTheDocument();
});