import express, { Application, Request, Response } from "express";

import cors from "cors";
import http from "http";

const app = express();
const server = http.createServer(app);

// import path from 'path'

const port = process.env.PORT || 8000;

// const app = express();
// app.use(express.json());
// app.use(express.urlencoded());

// app.listen(port, () => {
//   console.log("listening on port ", port);
// });

// app.post("/transfer-token", (req, res) => {
//   console.log(req.body);
//   console.log("got a request ", req.body);
//   setTimeout(() => {
//     res.status(200).end();
//   }, 3000);
// });

export type RouterResponse = Promise<{ err?: Error; res?: {} }>;

export default class Router {
  private static app: Application = app;

  static init() {
    Router.app.use(cors());
    Router.app.use(express.urlencoded({ extended: true }));
    Router.app.use(express.json());
    // Router.app.use(
    //   express.static(path.resolve(__dirname, "..", "..", "build"))
    // );
  }

  private static async onResponse(
    requestBody: { [key: string]: any },
    res: Response,
    onRequest: (requestBody: any) => RouterResponse
  ) {
    const result = await onRequest(requestBody);
    if (result.err) {
      res.statusMessage = result.err.message;
      res.status(400).end();
      console.log("error", res.statusMessage);
    } else if (result.res) {
      res.status(200).send(result.res);
    } else {
      res.status(200).end();
    }
  }

  public static subscribe = {
    transferToken: (onRequest: (requestBody: any) => RouterResponse) => {
      Router.app.post("/transfer-token", (req, res) => {
        Router.onResponse(req.body, res, onRequest);
      });
    },
  };
}

Router.init();

server.listen(port, function () {
  console.log("info", "Server listening on port " + port);
});
