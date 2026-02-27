import { Toaster } from 'react-hot-toast';
import './App.css';
import Router from './router/Router';

function App() {
  return (
    <>
      <Router />

      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            fontSize: "14px",
            letterSpacing: "0.5px",
          },
        }}
      />
    </>
  );
}

export default App;
