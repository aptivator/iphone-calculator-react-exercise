import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App          from './App.jsx'

let rootEl = document.getElementById('root');
createRoot(rootEl).render(<StrictMode><App /></StrictMode>);
