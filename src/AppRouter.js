// src/AppRouter.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import App from './App'; // Import your existing App component
import HowToPlay from './HowToPlay'; // Import the HowToPlay component

const AppRouter = () => {
  return (
    <Router>
      <nav>
        
      </nav>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/how-to-play" element={<HowToPlay />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;