import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import BitesnapApplication from './App';
import { BrowserRouter } from 'react-router-dom'

ReactDOM.render(
  <BrowserRouter>
    <BitesnapApplication />
  </BrowserRouter>,
  document.getElementById('root')
);

