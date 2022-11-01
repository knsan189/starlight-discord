import { Client, GatewayIntentBits, Events, Collection } from "discord.js";
import axios from "axios";
import path from "path";
import fs from "fs";
import { clientId, publicKey, token } from "./src/config/config.js";
import { VoiceLog } from "./src/@types/types.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// client.commands = new Collection();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const commandsPath = path.join(__dirname, "src/commands");
// const commandFiles = fs
//   .readdirSync(commandsPath)
//   .filter((file) => file.endsWith(".ts"));

// for (const file of commandFiles) {
//   const filePath = path.join(commandsPath, file);
//   const command = import(filePath);
//   // Set a new item in the Collection with the key as the command name and the value as the exported module

//   console.log(file);
//   if ("data" in command && "execute" in command) {
//     client.commands.set(command.data.name, command);
//   } else {
//     console.log(
//       `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
//     );
//   }
// }

client.once(Events.ClientReady, (stream) => {
  console.log(`Ready! Logged in as ${stream.user.tag}`);
});

client.on("messageCreate", async (message) => {
  try {
    if (message.content === "/운세") {
      const response = await axios({
        method: "POST",
        url: "http://knsan189.iptime.org:8080/api/message",
        data: {
          msg: message.content,
          sender: message.author.username,
        },
      });
      const { reply, secondReply, delayTime } = response.data;
      message.channel.send(reply);
      if (secondReply) {
        message.channel.send(secondReply);
      }
    }
  } catch (error) {
    message.channel.send("서버 오류났어요");
  }
});

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  const { nickname } = newState.member;

  if (oldState.channelId === newState.channelId) {
    console.log(`a user ${nickname} moved channel`);
    return;
  }

  if (oldState.channelId === null) {
    console.log(`a ${nickname} joined!`);
    const request = { time: new Date(), nickname, type: "join" };
    await axios({
      method: "POST",
      url: "http://knsan189.iptime.org:8080/api/history",
      data: request,
    });
    return;
  }

  if (newState.channelId === null) {
    console.log(`a user ${nickname} left!`);
    const request = { time: new Date(), nickname, type: "leave" };
    await axios({
      method: "POST",
      url: "http://knsan189.iptime.org:8080/api/history",
      data: request,
    });
    return;
  }

  if (newState.channelId !== oldState.channelId) {
    console.log("a user switched channels");
  }
});

client.on(Events.Debug, (message) => console.log(message));

client.on(Events.InteractionCreate, (interaction) => {
  console.log(interaction);
});

client.login(token);
