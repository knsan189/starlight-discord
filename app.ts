import { Client, GatewayIntentBits, Events } from "discord.js";
import axios from "axios";
import { token } from "./src/config/config.js";

let ready = false;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
  ],
});

function syncServer() {
  if (!ready) return;
  console.log(`[${new Date().toLocaleString()}] 서버 동기화`);
  const guilds = client.guilds.cache;
  const starlight = guilds.get("949451590568398889");
  const currentMembers = [];

  starlight.members.cache.forEach((member) => {
    if (member.voice.channel) {
      if (
        !member.presence?.clientStatus.mobile ||
        member.presence.clientStatus.desktop
      ) {
        currentMembers.push(member.nickname);
      }
    }
  });

  console.log(
    `[${new Date().toLocaleString()}] 현재 접속중 사용자 :`,
    currentMembers.toString(),
    `(총 ${currentMembers.length}명)`
  );

  axios({
    method: "POST",
    url: "http://knsan189.iptime.org:8080/api/history/sync",
    data: { nicknames: currentMembers },
  });
}

client.once(Events.ClientReady, async (stream) => {
  console.log(`[${new Date().toLocaleString()}] ${stream.user.tag} 로그인`);
  ready = true;
  syncServer();
  setInterval(syncServer, 1000 * 60 * 5);
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
  try {
    const { nickname, presence } = newState.member;

    // PC 오프라인, MOBILE 온라인 일 경우
    if (presence.clientStatus?.mobile && !presence.clientStatus?.desktop) {
      return;
    }

    if (!nickname) {
      throw new Error("no nickname", { cause: newState.member });
    }

    if (oldState.channelId === newState.channelId) {
      console.log(`${nickname} moved channel`, presence?.clientStatus);
      return;
    }

    if (oldState.channelId === null) {
      console.log(`${nickname} joined!`, presence?.clientStatus);
      const request = { time: new Date(), nickname, type: "join" };
      await axios({
        method: "POST",
        url: "http://knsan189.iptime.org:8080/api/history",
        data: request,
      });
      return;
    }

    if (newState.channelId === null) {
      console.log(`${nickname} left!`, presence?.clientStatus);
      const request = { time: new Date(), nickname, type: "leave" };
      await axios({
        method: "POST",
        url: "http://knsan189.iptime.org:8080/api/history",
        data: request,
      });
      return;
    }

    if (newState.channelId !== oldState.channelId) {
      console.log(`${nickname} switched channels`, presence?.clientStatus);
    }
  } catch (error) {
    console.log(error);
  }
});

client.on(Events.InteractionCreate, (interaction) => {
  console.log(interaction);
});

client.login(token);
