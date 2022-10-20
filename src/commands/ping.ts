import { SlashCommandBuilder } from "discord.js";

// const PingCommand = new SlashCommandBuilder()
//   .setName("ping")
//   .setDescription("Replies with Pong!");

// PingCommand.

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  async execute(interaction) {
    await interaction.reply("Pong!");
  },
};
