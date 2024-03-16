import mongoose from "mongoose";

export const connectToMongo = () =>
  mongoose
    .connect("mongodb://127.0.0.1:27017", {
      dbName: "socialmedia",
    })
    .then((res) => {
      console.log("Connected to Database Successfully");
    })
    .catch((err) => {
      console.log("Failed to connect Database" + err.message);
    });
