import { connectToMongo } from "./data/db.js";
import { app } from "./index.js";
import { v4 as uuidV4 } from "uuid";

const port = process.env.PORT;

connectToMongo();


app.listen(port, () => {
  console.log(`Server is runnig at http://localhost:${port}`);
});
