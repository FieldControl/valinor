import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Profile from '../pages/Profile';
import Repo from '../pages/Repo';

import { Footer, Header, Error404 } from '../components';

import { ThemeName } from '../styles/themes';

interface RoutesProps {
  theme: ThemeName;
  onChange: (newName: ThemeName) => void;
}

const RoutesList: React.FC<RoutesProps> = ({ theme, onChange }) => (
  <>
    <div className="container">
      <Header themeName={theme} setThemeName={onChange} />
      <div className="main-content" id="main-content">
        <Routes>
          <Route path="/" element={<Profile />} />
          <Route path="/:username" element={<Profile />} />
          <Route path="/:username/:reponame" element={<Repo />} />
          <Route element={<Error404 />} />
        </Routes>
        <Footer />
      </div>
    </div>
  </>
);

export default RoutesList;
