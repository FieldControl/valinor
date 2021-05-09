import React from 'react';
import { render } from '@testing-library/react';
import Welcome from './Welcome';

test('should renders', () => {
  render(<Welcome />);
});
