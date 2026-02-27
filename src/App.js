import { Toaster } from "react-hot-toast";
import "./App.css";
import Router from "./router/Router";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <>
      <AuthProvider>
        <Router />
      </AuthProvider>

      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            fontSize: "14px",
            letterSpacing: "0.5px"
          }
        }}
      />
    </>
  );
}

export default App;
