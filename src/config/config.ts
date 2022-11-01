import dotenv from "dotenv";

dotenv.config();

export const clientId = `${process.env.DISCORD_CLIENT_ID}`;
export const secretId = `${process.env.DISCORD_SECRET_ID}`;
export const publicKey = `${process.env.DISCORD_PUBLIC_KEY}`;
export const token = `${process.env.DISCORD_TOKEN}`;

export default {};
