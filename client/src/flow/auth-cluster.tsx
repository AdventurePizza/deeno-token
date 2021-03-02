// File: ./src/auth-cluster.js

import * as fcl from "@onflow/fcl";

import React, { useEffect, useState } from "react";

// import {
//   addDog,
//   getBalance,
//   getDogs,
//   getFlowBalance,
//   helloWorld,
//   mintNFT,
//   printNFTs,
//   setupAccount,
//   setupAccountNFT,
//   transferNFT,
//   transferToken,
// } from "./flow";

// import { deploy } from "./deploy-contract";
// import raw from "../contracts/ExampleNFT.cdc";
// import raw from "../contracts/DeenoToken.cdc";

// import raw from "../contracts/HelloWorld.cdc";
// import raw from "../contracts/DogHotel.cdc";
// import raw from "../contracts/ExampleToken.cdc";
// import raw from "../contracts/NonFungibleToken.cdc";

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
  //   const [dogName, setDogName] = useState("");
  //   const [dogs, setDogs] = useState([]);

  useEffect(() => fcl.currentUser().subscribe(setUser), []);

  //   const clickDeploy = async () => {
  //     const contract = await (await fetch(raw)).text();

  //     // deploy(contract, "DogHotel").then(console.log);
  //     // deploy(contract, "ExampleNFT").then(console.log);
  //     deploy(contract, "DeenoToken").then(console.log);
  //   };

  //   const clickGetDogs = () =>
  //     getDogs().then((res) => {
  //       setDogs(res.map((obj) => obj.value));
  //     });

  //   const clickAddDog = () => addDog(dogName).then(console.log);
  //   const clickSetupAccount = () => setupAccount().then(console.log);
  //   const clickGetBalance = () => getBalance().then(console.log);
  //   const clickTransferToken = () => transferToken().then(console.log);
  //   const clickMintNFT = () => mintNFT().then(console.log);
  //   const clickPrintNFTs = () => printNFTs().then(console.log);
  //   const clickTransferNFT = () => transferNFT().then(console.log);
  //   const clickSetupAccountNFT = () => setupAccountNFT().then(console.log);
  //   const clickGetFlowBalance = () => getFlowBalance().then(console.log);

  if (user.loggedIn) {
    return (
      <AuthContext.Provider value={{ user }}>
        <div className="auth-container">
          <button onClick={fcl.unauthenticate}>Log Out</button>
          {children}
        </div>
      </AuthContext.Provider>
    );
  } else {
    return (
      <div>
        <button onClick={fcl.logIn}>Log In</button>
        <button onClick={fcl.signUp}>Sign Up</button>
      </div>
    );
  }
};
