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
    alignItems: "center",
    // justifyContent: "center",
    flexDirection: "column",
    "& > *": {
      marginBottom: 10,
    },
    height: "100%",
    marginTop: "15%",
  },
  innerContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    "& > *": {
      marginBottom: 10,
    },
    height: "100%",
  },
  flowLogoContainer: {
    "& > img": {
      width: 100,
    },
  },
  adventureLogoContainer: {
    "& > img": {
      width: 150,
    },
  },
  txLink: {
    marginLeft: 10,
  },
  title: {
    fontFamily: '"Shippori Mincho", serif',
    fontSize: "2em",
  },
  footer: {
    position: "absolute",
    bottom: 10,
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
    padding: 10,
    boxSizing: "border-box",
  },
  totalSupply: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
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
      <div className={classes.title}>Deeno Token</div>
      {/* <div className={classes.innerContainer}> */}
      <div>address: {user?.addr}</div>
      <div>your deeno tokens: {balance === null ? 0 : balance}</div>
      <Button
        disabled={isTransferring}
        onClick={clickGetToken}
        variant="outlined"
        color="primary"
      >
        get deeno token
      </Button>
      {isTransferring && <LinearProgress style={{ width: 200 }} />}
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

      <div className={classes.footer}>
        <div className={classes.flowLogoContainer}>
          <img alt="flow logo" src={flowLogo} />
          <div>built on flow blockchain</div>
        </div>

        <div className={classes.totalSupply}>
          <div>deeno token</div>
          <div>total supply: {totalSupply}</div>
        </div>

        <div className={classes.adventureLogoContainer}>
          <img alt="adventure logo" src={adventureLogo} />
        </div>
      </div>
      {/* </div> */}
    </div>
  );
};
