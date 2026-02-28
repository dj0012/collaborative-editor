import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const container = document.getElementById('root');
const root = createRoot(container);

// Ye 0 millisecond ka delay hydration error ko fix karne mein madad karta hai
setTimeout(() => {
    root.render(<App />);
}, 0);