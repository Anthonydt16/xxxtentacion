import { TextChannel } from 'discord.js';
import SpotifyApi from '../model/spotify';
import { releasesFridayNight } from './releasesFridayNight';

class Cron {
    spotifyApi: SpotifyApi;
    channel: TextChannel;
    constructor(spotifyApi: SpotifyApi, channel: TextChannel) {
        this.spotifyApi = spotifyApi;
        this.channel = channel;
    }

    public start() {
        releasesFridayNight(this.spotifyApi, this.channel);
    }
}

export default Cron;