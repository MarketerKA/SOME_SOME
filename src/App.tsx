import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/Home';
import { HeroesPage } from './pages/HeroesPage';
import { HeroPage } from './pages/HeroPage';
import { Navbar } from './components/Navbar';
import { ROUTES } from './utils/constants';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.HEROES} element={<HeroesPage />} />
          <Route path={ROUTES.HERO_DETAILS} element={<HeroPage />} />
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
