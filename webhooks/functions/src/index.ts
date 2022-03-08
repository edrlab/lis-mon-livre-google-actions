
// class-transformer
import 'reflect-metadata';  

import * as functions from "firebase-functions";
import { Assistant } from "./controller/Assistant";
import { handler } from "./controller/handler";
// import { writeFileSync} from 'fs';

exports.ActionsOnGoogleFulfillment = functions.https.onRequest(async (req, res) => {

  const app = new Assistant({});

  handler(app);

  app.app(req, res);

});
