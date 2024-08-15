import { Client, GatewayIntentBits, TextChannel, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import * as dotenv from 'dotenv';
import SpotifyApi from './model/spotify';
import cron from 'node-cron';

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
            .setDescription('List all commands and their descriptions')
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

    // Tâche cron pour exécuter tous les vendredis à 12h
    // toutes les 2 minutes pour tester
    // cron.schedule('*/2 * * * *', async () => {
        cron.schedule('0 12 * * 5', async () => {
        console.log('Running weekly rap releases cron job...');
    
        const channel = client.channels.cache.get(process.env.CHANNEL_ID!) as TextChannel;
        if (!channel) {
            console.log('Channel not found.');
            return;
        }
    
        const albums = await spotifyApi.searchReleasesFridayNight();
    
        if (albums.length > 0) {
            for (const album of albums) {
                const albumImageUrl = album.images.length > 0 ? album.images[0].url : ''; // Vérifiez s'il y a une image disponible
    
                const embed = new EmbedBuilder()
                    .setColor(0x1DB954)
                    .setTitle(album.name)
                    .setDescription(`by ${album.artists.map(artist => artist.name)
                        .join(', ')}\n🔗 [Listen on Spotify](${album.external_urls.spotify})\nReleased on: **${album.release_date}**`)
                    .setFooter({ text: 'Powered by Gogodix for RapVerse', iconURL: 'https://cdn.discordapp.com/icons/1272290016697258055/a_7ac23c514b4a51ace634494cd7a96a61.webp?size=96' });
    
                if (albumImageUrl) {
                    embed.setThumbnail(albumImageUrl); // Ajouter l'image de l'album en tant que miniature
                }
    
                await channel.send({ embeds: [embed] });
            }
    
            console.log('Weekly rap releases message sent.');
        } else {
            await channel.send('No rap albums were released in the past two weeks.');
        }
    });

    console.log('Cron job scheduled for every Friday at 12:00.');
});

// Gestionnaire des commandes slash
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'toprap') {
        await interaction.deferReply();

        const usTopTracks = await spotifyApi.getTopTracksByGenre('rap', 'US');
        const frTopTracks = await spotifyApi.getTopTracksByGenre('rap', 'FR');

        const usEmbed = new EmbedBuilder()
            .setColor(0x1DB954) // Couleur principale de Spotify
            .setTitle(' :flag_us: Top 10 Rap US Tracks')
            .setDescription('Here are the top 10 Rap US tracks on Spotify:')
            .setFooter({ text: 'Powered by Gogodix for RapVerse', iconURL: 'https://cdn.discordapp.com/icons/1272290016697258055/a_7ac23c514b4a51ace634494cd7a96a61.webp?size=96' });

        usEmbed.addFields(
            usTopTracks.map((track, index) => ({
                name: `${index + 1}. ${track.name}`,
                value: `by ${track.artists.map(artist => artist.name).join(', ')}\n🔗 [Listen on Spotify](${track.external_urls.spotify})`,
            }))
        );

        const frEmbed = new EmbedBuilder()
            .setColor(0x1DB954) // Couleur principale de Spotify
            .setTitle(' :flag_fr: Top 10 Rap FR Tracks')
            .setDescription('Here are the top 10 Rap FR tracks on Spotify:')
            .setFooter({ text: 'Powered by Gogodix for RapVerse', iconURL: 'https://cdn.discordapp.com/icons/1272290016697258055/a_7ac23c514b4a51ace634494cd7a96a61.webp?size=96' });

        frEmbed.addFields(
            frTopTracks.map((track, index) => ({
                name: `${index + 1}. ${track.name}`,
                value: `by ${track.artists.map(artist => artist.name).join(', ')}\n🔗 [Listen on Spotify](${track.external_urls.spotify})`,
            }))
        );

        await interaction.followUp({ content: 'Here are the top 10 Rap US tracks on Spotify:', embeds: [usEmbed] });
        await interaction.followUp({ content: 'Here are the top 10 Rap FR tracks on Spotify:', embeds: [frEmbed] });
    }

    if (interaction.commandName === 'help') {
        const helpEmbed = new EmbedBuilder()
            .setColor(0x1DB954) // Couleur principale de Spotify
            .setTitle('Help - List of Commands')
            .setDescription('Here are the available commands for the bot:')
            .addFields(
                { name: '/toprap', value: 'Get the top 10 Rap US and Rap FR tracks on Spotify.' },
                { name: '/help', value: 'List all commands and their descriptions.' }
            )
            .setFooter({ text: 'Powered by Gogodix for RapVerse', iconURL: 'https://cdn.discordapp.com/icons/1272290016697258055/a_7ac23c514b4a51ace634494cd7a96a61.webp?size=96' });

        await interaction.reply({ embeds: [helpEmbed] });
    }
});


client.login(process.env.TOKEN);
