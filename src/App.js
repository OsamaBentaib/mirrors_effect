import React from "react";
import AppRoutes from "./routes/routes";
import { BrowserRouter as Router } from "react-router-dom";

function App() {
  return (
    <Router>
      <main>
        <AppRoutes />
      </main>
    </Router>
  );
}

export default App;
