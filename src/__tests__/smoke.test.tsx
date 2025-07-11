import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from '../pages/index';

test('renders poll form', () => {
  render(<HomePage />);
  expect(screen.getByText('Create New Poll')).toBeInTheDocument();
}); 