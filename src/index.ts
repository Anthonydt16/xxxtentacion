import 'web-streams-polyfill';
import {
  Client,
  GatewayIntentBits,
  TextChannel,
  SlashCommandBuilder,
  EmbedBuilder,
  GuildMemberRoleManager,
  Interaction,
  CommandInteraction,
} from 'discord.js';
import * as dotenv from 'dotenv';
import SpotifyApi from './model/spotify';
import Cron from './cron';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const spotifyApi = new SpotifyApi();

client.once('ready', async () => {
  console.log('Connected to Discord!');

  // Authentification initiale à l'API Spotify
  await spotifyApi.authenticate();

  // Déclaration des commandes slash /topRap et /help
  const commands = [
    new SlashCommandBuilder()
      .setName('toprap')
      .setDescription('Get the top 10 Rap US and Rap FR tracks on Spotify'),
    new SlashCommandBuilder()
      .setName('help')
      .setDescription('List all commands and their descriptions'),
  ];

  const guild = client.guilds.cache.get(process.env.GUILD_ID!);
  if (guild) {
    for (const command of commands) {
      await guild.commands.create(command);
    }
    console.log('Slash commands /topRap and /help registered.');
  } else {
    console.log('Guild not found.');
  }

  //start cron job
  const cron = new Cron(spotifyApi, client.channels.cache.get(process.env.CHANNEL_ID!) as TextChannel);
  cron.start();
});

// Gestionnaire des commandes slash
client.on('interactionCreate', async (interaction: Interaction) => {
  // Affiner le type d'interaction pour un CommandInteraction
  const commandInteraction = interaction as CommandInteraction;

  // Définissez l'ID du rôle couronne ici
  const requiredRole = '1272312276258652191'; // Remplacez par l'ID du rôle requis

  // Vérifiez si l'utilisateur possède le rôle requis
  if (commandInteraction.member && commandInteraction.member.roles instanceof GuildMemberRoleManager) {
    if (!commandInteraction.member.roles.cache.has(requiredRole)) {
      await commandInteraction.reply({
        content: "You don't have permission to use this command.",
        ephemeral: true, // Rend le message visible uniquement pour l'utilisateur
      });
      return;
    }
  } else {
    await commandInteraction.reply({
      content: "Could not verify your roles. Please contact an administrator.",
      ephemeral: true,
    });
    return;
  }

  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'toprap') {
    await interaction.deferReply();

    const usTopTracks = await spotifyApi.getTopTracksByGenre('rap', 'US');
    const frTopTracks = await spotifyApi.getTopTracksByGenre('rap', 'FR');

    const usEmbed = new EmbedBuilder()
      .setColor(0x1db954) // Couleur principale de Spotify
      .setTitle(' :flag_us: Top 10 Rap US Tracks')
      .setDescription('Here are the top 10 Rap US tracks on Spotify:')
      .setFooter({
        text: 'Powered by Gogodix for RapVerse',
        iconURL:
          'https://cdn.discordapp.com/icons/1272290016697258055/a_7ac23c514b4a51ace634494cd7a96a61.webp?size=96',
      });

    usEmbed.addFields(
      usTopTracks.map((track, index) => ({
        name: `${index + 1}. ${track.name}`,
        value: `by ${track.artists.map((artist) => artist.name).join(', ')}\n🔗 [Listen on Spotify](${track.external_urls.spotify})`,
      }))
    );

    const frEmbed = new EmbedBuilder()
      .setColor(0x1db954) // Couleur principale de Spotify
      .setTitle(' :flag_fr: Top 10 Rap FR Tracks')
      .setDescription('Here are the top 10 Rap FR tracks on Spotify:')
      .setFooter({
        text: 'Powered by Gogodix for RapVerse',
        iconURL:
          'https://cdn.discordapp.com/icons/1272290016697258055/a_7ac23c514b4a51ace634494cd7a96a61.webp?size=96',
      });

    frEmbed.addFields(
      frTopTracks.map((track, index) => ({
        name: `${index + 1}. ${track.name}`,
        value: `by ${track.artists.map((artist) => artist.name).join(', ')}\n🔗 [Listen on Spotify](${track.external_urls.spotify})`,
      }))
    );

    await interaction.followUp({
      content: 'Here are the top 10 Rap US tracks on Spotify:',
      embeds: [usEmbed],
    });
    await interaction.followUp({
      content: 'Here are the top 10 Rap FR tracks on Spotify:',
      embeds: [frEmbed],
    });
  }

  if (interaction.commandName === 'help') {
    const helpEmbed = new EmbedBuilder()
      .setColor(0x1db954) // Couleur principale de Spotify
      .setTitle('Help - List of Commands')
      .setDescription('Here are the available commands for the bot:')
      .addFields(
        {
          name: '/toprap',
          value: 'Get the top 10 Rap US and Rap FR tracks on Spotify.',
        },
        { name: '/help', value: 'List all commands and their descriptions.' }
      )
      .setFooter({
        text: 'Powered by Gogodix for RapVerse',
        iconURL:
          'https://cdn.discordapp.com/icons/1272290016697258055/a_7ac23c514b4a51ace634494cd7a96a61.webp?size=96',
      });

    await interaction.reply({ embeds: [helpEmbed] });
  }
});

client.login(process.env.TOKEN);
