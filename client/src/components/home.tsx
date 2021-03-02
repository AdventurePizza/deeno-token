import { Button, LinearProgress } from "@material-ui/core";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { getBalance, getTotalSupply, setupAccount } from "../flow/flow";

import { AuthContext } from "../flow/auth-cluster";
import adventureLogo from "../assets/adventure-logo.png";
import flowLogo from "../assets/flow-icon.svg";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    "& > *": {
      marginBottom: 10,
    },
  },
  flowLogoContainer: {
    display: "flex",
    flexDirection: "column",
    position: "absolute",
    right: 10,
    bottom: 10,
    "& > img": {
      width: 100,
    },
  },
  adventureLogoContainer: {
    position: "absolute",
    left: 10,
    bottom: 10,
    "& > img": {
      width: 150,
    },
  },
  txLink: {
    marginLeft: 10,
  },
});

export const Home = () => {
  const { user } = useContext(AuthContext);

  const [balance, setBalance] = useState<number | null>(0);
  const [totalSupply, setTotalSupply] = useState<number>(0);
  const [isSetupVault, setIsSetupVault] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [latestTxId, setLatestTxId] = useState("");

  const classes = useStyles();

  const getAndSetBalance = useCallback(() => {
    if (user && user.addr) {
      getBalance(user.addr).then((val) => {
        console.log("balance is ", val);
        if (val === null) {
          setBalance(null);
        } else {
          setBalance(Math.trunc(val));
          setIsSetupVault(true);
        }
      });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      if (user.addr) {
        getAndSetBalance();
        // getBalance(user.addr).then((val) => {
        //   console.log("balance is ", val);
        //   if (val === null) {
        //     setBalance(null);
        //   } else {
        //     setBalance(Math.trunc(val));
        //     setIsSetupVault(true);
        //   }
        // });
      }
      getTotalSupply().then((val) => setTotalSupply(Math.trunc(val)));
    }
  }, [user, getAndSetBalance]);

  const clickGetToken = () => {
    if (!isSetupVault) {
      setupAccount().then((res) => {
        requestToken();
      });
    } else {
      requestToken();
    }
    // send request to backend
    // show loading symbol
    // update balance frontend
  };

  const requestToken = () => {
    setIsTransferring(true);
    fetch("/transfer-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: user?.addr,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log("transfer res", res);
        setIsTransferring(false);
        if (res.txId) {
          setLatestTxId(res.txId);
          getAndSetBalance();
        }
      });
  };

  return (
    <div className={classes.container}>
      <div>deeno token total supply: {totalSupply}</div>
      <div>address: {user?.addr}</div>
      <div>your deeno tokens: {balance === null ? 0 : balance}</div>
      {/* {(!isSetupVault || !balance) && ( */}
      <Button
        disabled={isTransferring}
        onClick={clickGetToken}
        variant="contained"
      >
        get deeno token
      </Button>
      {/* )} */}
      {isTransferring && <LinearProgress style={{ width: 200 }} />}
      {/* {!isSetupVault && <Button onClick={clickSetupVault} variant="contained">setup vault</Button>} */}
      {latestTxId && (
        <div>
          view your transaction here:
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://flow-view-source.com/testnet/tx/${latestTxId}`}
            className={classes.txLink}
          >
            {`https://flow-view-source.com/testnet/tx/${latestTxId}`}
          </a>
        </div>
      )}

      <div className={classes.flowLogoContainer}>
        <img alt="flow logo" src={flowLogo} />
        <div>built on flow blockchain</div>
      </div>

      <div className={classes.adventureLogoContainer}>
        <img alt="adventure logo" src={adventureLogo} />
      </div>
    </div>
  );
};
