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
import TopRap from './command/toprap';
import Ban from './command/ban';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const roleList = {
  couronne: '1272312276258652191',
  test: '1040320932247511160',
}

const spotifyApi = new SpotifyApi();

client.once('ready', async () => {
  console.log('Connected to Discord!');

  // Authentification initiale à l'API Spotify
  await spotifyApi.authenticate();

  // Déclaration des commandes slash /topRap et /help
  const commands = [
    new SlashCommandBuilder()
      .setName('toprap')
      .setDescription('Affiche les 10 meilleurs titres de Rap US et Rap FR sur Spotify.'),
    new SlashCommandBuilder()
      .setName('ban')
      .setDescription('Ban un utilisateur du serveur.')
      .addUserOption(option => 
          option.setName('userId')
              .setDescription('L\'utilisateur à bannir')
              .setRequired(true))
      .addStringOption(option =>
          option.setName('reason')
              .setDescription('La raison du ban')
              .setRequired(false)),
    new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban un utilisateur du serveur.')
        .addStringOption(option =>
            option.setName('userId')
                .setDescription('L\'utilisateur à unban')
                .setRequired(true)),
    new SlashCommandBuilder()
      .setName('help')
      .setDescription('Liste des commandes disponibles.'),
  ];

  const guild = client.guilds.cache.get(process.env.GUILD_ID!);
  if (guild) {
    for (const command of commands) {
      await guild.commands.create(command);
    }
    console.log('Slash commands /topRap, /help, /ban and /unban registered.');
  } else {
    console.log('Guild not found.');
  }

  //start cron job
  const cron = new Cron(spotifyApi, client.channels.cache.get(process.env.CHANNEL_ID!) as TextChannel);
  cron.start();
});

// Gestionnaire des commandes slash
client.on('interactionCreate', async (interaction: Interaction) => {

  if (!interaction.isCommand()) return;

  new TopRap(interaction, spotifyApi, [roleList.couronne]);

  new Ban(interaction, spotifyApi, [roleList.couronne]);


  if (interaction.commandName === 'help') {
    const helpEmbed = new EmbedBuilder()
      .setColor(0x1db954) // Couleur principale de Spotify
      .setTitle('Help - Liste des commandes')
      .setDescription('Voici la liste des commandes disponibles :')
      .addFields(
        {
          name: '/toprap',
          value: 'Affiche les 10 meilleurs titres de Rap US et Rap FR sur Spotify.',
        },
        { name: '/help', value: 'Affiche la liste des commandes disponibles.' },
        {
          name: '/ban',
          value: 'Ban un utilisateur du serveur.',
        },
        {
          name: '/unban',
          value: 'Unban un utilisateur du serveur.',
        }
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
