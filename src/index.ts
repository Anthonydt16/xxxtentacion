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
  PermissionsBitField,
  Message,
} from 'discord.js';
import * as dotenv from 'dotenv';
import SpotifyApi from './model/spotify';
import Cron from './cron';
import TopRap from './command/toprap';
import Ban from './command/ban';
import Timeout from './command/timeout';
import VirusTotal from './model/virusTotal';
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
      .setName('timeout')
      .setDescription('Mute un utilisateur pour une durée donnée.')
      .addUserOption(option =>
        option.setName('user')
          .setDescription('L\'utilisateur à mute')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('time')
          .setDescription('Durée du mute (s, m, h, d)')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('reason')
          .setDescription('Raison du mute')
          .setRequired(false))
      .setDefaultMemberPermissions(PermissionsBitField.Flags.MuteMembers),
  
    new SlashCommandBuilder()
      .setName('untimeout')
      .setDescription('Unmute un utilisateur.')
      .addUserOption(option =>
        option.setName('user')
          .setDescription('L\'utilisateur à unmute')
          .setRequired(true))
      .setDefaultMemberPermissions(PermissionsBitField.Flags.MuteMembers),
  
    new SlashCommandBuilder()
      .setName('ban')
      .setDescription('Ban un utilisateur du serveur.')
      .addUserOption(option =>
        option.setName('user')
          .setDescription('L\'utilisateur à bannir')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('reason')
          .setDescription('Raison du ban')
          .setRequired(false))
      .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers),
  
    new SlashCommandBuilder()
      .setName('unban')
      .setDescription('Unban un utilisateur du serveur.')
      .addUserOption(option =>
        option.setName('user')
          .setDescription('L\'ID de l\'utilisateur à débannir')
          .setRequired(true))
      .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers),
  
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
  const cron = new Cron(spotifyApi, client.channels.cache.get(process.env.CHANNEL_ID!) as TextChannel, client.channels.cache.get(process.env.LOG_CHANNEL_ID!) as TextChannel);
  cron.start();
});

// Gestionnaire des commandes slash
client.on('interactionCreate', async (interaction: Interaction) => {

  if (!interaction.isCommand()) return;
  try {
    new TopRap(interaction, spotifyApi, [roleList.couronne, roleList.test]);
    
    new Ban(interaction, [roleList.couronne, roleList.test],[PermissionsBitField.Flags.BanMembers]);

    new Timeout(interaction, [roleList.couronne, roleList.test], [PermissionsBitField.Flags.MuteMembers]);
  } catch (error) {
    console.error('Error while trying to execute a command:', error);
    await interaction.reply({ content: 'Une erreur s\'est produite lors de l\'exécution de la commande.', ephemeral: true });
  }
  
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
        },
        {
          name: '/timeout',
          value: 'Mute un utilisateur pour une durée donnée.',
        },
        {
          name: '/untimeout',
          value: 'Unmute un utilisateur.',
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

client.on('messageCreate', async (message: Message) => {
  if (message.author.bot) return;

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = message.content.match(urlRegex);

  if (urls) {
      for (const url of urls) {
          try {
              const virusTotal = new VirusTotal();
              const report = await virusTotal.getReport(url);

              const positives = report.positives || 0;
              const total = report.total || 0;
              console.log(`Lien: ${url} - Positives: ${positives}/${total}`);
              
              if (positives > 0) {
                  await message.delete();
                  virusTotal.logVirusTotal(url, report, message.author, client);
                  
              } else {
                console.log(`Lien autorisé: ${url}`);
                await message.react('✅');
              }
          } catch (error) {
              console.error('Erreur lors de l\'analyse du lien:', error);
              await message.reply({
                  content: `❌ Impossible d'analyser le lien ${url}.`,
              });
          }
      }
  }
});



client.login(process.env.TOKEN);
