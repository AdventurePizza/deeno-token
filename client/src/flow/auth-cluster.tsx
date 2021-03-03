// File: ./src/auth-cluster.js

import * as fcl from "@onflow/fcl";

import React, { useEffect, useState } from "react";

import { Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  container: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  button: {
    width: 100,
  },
  authButtons: {
    "& > *:first-child": {
      marginRight: 10,
    },
  },
});

export interface IUser {
  addr?: string;
  loggedIn: null | true;
}

export interface IAuthContext {
  user?: IUser;
}

export const AuthContext = React.createContext<IAuthContext>({});

export const AuthCluster = ({ children }) => {
  const [user, setUser] = useState<IUser>({ loggedIn: null });
  const classes = useStyles();

  useEffect(() => fcl.currentUser().subscribe(setUser), []);

  const render = () => {
    if (user.loggedIn) {
      return (
        <AuthContext.Provider value={{ user }}>
          <Button
            className={classes.button}
            variant="outlined"
            onClick={fcl.unauthenticate}
          >
            Log Out
          </Button>
          {children}
        </AuthContext.Provider>
      );
    } else {
      return (
        <div className={classes.authButtons}>
          <Button
            className={classes.button}
            variant="outlined"
            onClick={fcl.logIn}
          >
            Log In
          </Button>
          <Button
            className={classes.button}
            variant="outlined"
            onClick={fcl.signUp}
          >
            Sign Up
          </Button>
        </div>
      );
    }
  };

  return <div className={classes.container}>{render()}</div>;
};
