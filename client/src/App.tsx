import "./App.css";

import { AuthCluster } from "./flow/auth-cluster";
import { Home } from "./components/home";
import React from "react";

function App() {
  return (
    <div>
      <AuthCluster>
        <Home />
      </AuthCluster>
    </div>
  );
}

export default App;
