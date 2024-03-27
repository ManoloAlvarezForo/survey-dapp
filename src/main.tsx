import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from 'react-query';
import App from './App.tsx'
import './index.css'
import { QuizProvider } from './provider/QuizProvider.tsx';
import { SnackbarProvider } from 'notistack';


const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <SnackbarProvider>
    <QuizProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
    </QuizProvider>
    </SnackbarProvider>
    
  </QueryClientProvider>,
);