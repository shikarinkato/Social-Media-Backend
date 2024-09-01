import mongoose from "mongoose";

export const connectToMongo = () =>
  mongoose
    .connect(`${process.env.DATABASE_URL}`, {
      dbName: "socialmedia",
    })
    .then((res) => {
      console.log("Connected to Database Successfully " + res.connection.host);
    })
    .catch((err) => {
      console.log("Failed to connect Database" + err.message);
    });
