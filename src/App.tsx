import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './presentation/router';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter basename={__BASE_PATH__}>
      <Toaster
        position='top-right'
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
