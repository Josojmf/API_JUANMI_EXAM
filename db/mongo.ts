import { MongoClient } from "../deps.ts";

const client = new MongoClient();
await client.connect("mongodb+srv://adminjm:jmPassword123@final.yzzh9ig.mongodb.net/?authMechanism=SCRAM-SHA-1");

const db = client.database("API-LOGIN");

export const usersCollection = db.collection("Users");
export const videosCollection = db.collection("Videos");
