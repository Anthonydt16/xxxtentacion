import { TextChannel } from 'discord.js';
import SpotifyApi from '../model/spotify';
import { releasesFridayNight } from './releasesFridayNight';

class Cron {
    spotifyApi: SpotifyApi;
    channel: TextChannel;
    channelForLogs: TextChannel;
    constructor(spotifyApi: SpotifyApi, channel: TextChannel, channelForLogs: TextChannel) {
        this.spotifyApi = spotifyApi;
        this.channel = channel;
        this.channelForLogs = channel;
    }

    public start() {
        try {
            releasesFridayNight(this.spotifyApi, this.channel);
        } catch (error) {
            this.logIntoChannel(error);
        }
    }

    public logIntoChannel(error: unknown) {
        let errorMessage = 'Une erreur inconnue s\'est produite.';
        
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        this.channelForLogs.send(`ALED @343139999858032641 j'ai une erreur: ${errorMessage}`);
    }
}

export default Cron;