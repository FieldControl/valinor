import React from 'react';
import { Route, Routes as Switch } from 'react-router-dom'

import { Home } from '../pages/Home'

export function Routes() {
  return (
    <Switch>
      <Route path="/" element={<Home />} />
    </Switch>
  );
}