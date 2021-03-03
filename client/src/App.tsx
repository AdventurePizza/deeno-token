import "./App.css";

import { AuthCluster } from "./flow/auth-cluster";
import { Home } from "./components/home";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  container: {
    height: "100%",
    background: "#C0D8E0",
  },
});

function App() {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <AuthCluster>
        <Home />
      </AuthCluster>
    </div>
  );
}

export default App;
