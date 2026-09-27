const {
  Client,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
require("dotenv").config();

// ====== CONFIG ======
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const VERIFIED_ROLE_NAME = "Verified"; // change if your role is named differently

// Banner URLs - upload the 3 PNGs (in /banners) somewhere public (imgur, discord CDN, github raw)
// and paste the links here.
const BANNERS = {
  verify: process.env.VERIFY_BANNER_URL || "PASTE_VERIFY_BANNER_URL_HERE",
  infraction: process.env.INFRACTION_BANNER_URL || "PASTE_INFRACTION_BANNER_URL_HERE",
  promotion: process.env.PROMOTION_BANNER_URL || "PASTE_PROMOTION_BANNER_URL_HERE",
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
  partials: [Partials.Channel],
});

// ====== SLASH COMMANDS ======
const commands = [
  new SlashCommandBuilder()
    .setName("verifypanel")
    .setDescription("Post the verification panel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  new SlashCommandBuilder()
    .setName("infraction")
    .setDescription("Issue an infraction to a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addUserOption((opt) =>
      opt.setName("member").setDescription("Member to infract").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("Reason for infraction").setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("type")
        .setDescription("Infraction type")
        .setRequired(true)
        .addChoices(
          { name: "Verbal Warning", value: "Verbal Warning" },
          { name: "Written Warning", value: "Written Warning" },
          { name: "Suspension", value: "Suspension" },
          { name: "Termination", value: "Termination" }
        )
    ),

  new SlashCommandBuilder()
    .setName("promotion")
    .setDescription("Promote a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addUserOption((opt) =>
      opt.setName("member").setDescription("Member to promote").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("new_rank").setDescription("New rank/position").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("Reason for promotion").setRequired(false)
    ),
].map((c) => c.toJSON());

// ====== REGISTER COMMANDS ON STARTUP ======
async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(TOKEN);
  await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
  console.log("Slash commands registered.");
}

// ====== READY ======
client.once("clientReady", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// ====== INTERACTIONS ======
client.on("interactionCreate", async (interaction) => {
  // --- Slash commands ---
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "verifypanel") {
      const embed = new EmbedBuilder()
        .setTitle("✅ Verification | Florida State Roleplay")
        .setDescription(
          "Welcome to **Florida State Roleplay**!\n\n" +
            "To gain access to the rest of the server, click the **Verify** button below.\n\n" +
            "By verifying you agree to follow all server rules and ERLC community guidelines."
        )
        .setImage(BANNERS.verify)
        .setColor(0x3b82f6);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("verify_button")
          .setLabel("Verify")
          .setStyle(ButtonStyle.Success)
          .setEmoji("✅")
      );

      await interaction.reply({ embeds: [embed], components: [row] });
      return;
    }

    if (interaction.commandName === "infraction") {
      const member = interaction.options.getUser("member");
      const reason = interaction.options.getString("reason");
      const type = interaction.options.getString("type");

      const embed = new EmbedBuilder()
        .setTitle("🚨 Infraction Notice | Florida State Roleplay")
        .setImage(BANNERS.infraction)
        .setColor(0xef4444)
        .addFields(
          { name: "Member", value: `<@${member.id}>`, inline: true },
          { name: "Type", value: type, inline: true },
          { name: "Issued By", value: `<@${interaction.user.id}>`, inline: true },
          { name: "Reason", value: reason }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      // DM the user
      try {
        const dmEmbed = new EmbedBuilder()
          .setTitle("🚨 You Received an Infraction")
          .setImage(BANNERS.infraction)
          .setColor(0xef4444)
          .setDescription(
            `You have received an infraction in **Florida State Roleplay**.`
          )
          .addFields(
            { name: "Type", value: type },
            { name: "Reason", value: reason },
            { name: "Issued By", value: `${interaction.user.tag}` }
          )
          .setTimestamp();

        await member.send({ embeds: [dmEmbed] });
      } catch (err) {
        await interaction.followUp({
          content: `⚠️ Could not DM ${member.tag} (their DMs may be closed).`,
          ephemeral: true,
        });
      }
      return;
    }

    if (interaction.commandName === "promotion") {
      const member = interaction.options.getUser("member");
      const newRank = interaction.options.getString("new_rank");
      const reason = interaction.options.getString("reason") || "N/A";

      const embed = new EmbedBuilder()
        .setTitle("🎉 Promotion Notice | Florida State Roleplay")
        .setImage(BANNERS.promotion)
        .setColor(0x22c55e)
        .addFields(
          { name: "Member", value: `<@${member.id}>`, inline: true },
          { name: "New Rank", value: newRank, inline: true },
          { name: "Issued By", value: `<@${interaction.user.id}>`, inline: true },
          { name: "Reason", value: reason }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      // DM the user
      try {
        const dmEmbed = new EmbedBuilder()
          .setTitle("🎉 You've Been Promoted!")
          .setImage(BANNERS.promotion)
          .setColor(0x22c55e)
          .setDescription(
            `Congratulations! You have been promoted in **Florida State Roleplay**.`
          )
          .addFields(
            { name: "New Rank", value: newRank },
            { name: "Reason", value: reason },
            { name: "Issued By", value: `${interaction.user.tag}` }
          )
          .setTimestamp();

        await member.send({ embeds: [dmEmbed] });
      } catch (err) {
        await interaction.followUp({
          content: `⚠️ Could not DM ${member.tag} (their DMs may be closed).`,
          ephemeral: true,
        });
      }
      return;
    }
  }

  // --- Button: Verify ---
  if (interaction.isButton() && interaction.customId === "verify_button") {
    const guild = interaction.guild;
    let role = guild.roles.cache.find((r) => r.name === VERIFIED_ROLE_NAME);

    if (!role) {
      await interaction.reply({
        content: `⚠️ Role "${VERIFIED_ROLE_NAME}" not found. Ask an admin to create it or rename it in the bot config.`,
        ephemeral: true,
      });
      return;
    }

    if (interaction.member.roles.cache.has(role.id)) {
      await interaction.reply({
        content: "You are already verified!",
        ephemeral: true,
      });
      return;
    }

    try {
      await interaction.member.roles.add(role);
      await interaction.reply({
        content: "✅ You have been verified! Welcome to Florida State Roleplay.",
        ephemeral: true,
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content:
          "⚠️ I couldn't give you the role. Make sure my role is above the Verified role in server settings.",
        ephemeral: true,
      });
    }
  }
});

registerCommands();
client.login(TOKEN);
