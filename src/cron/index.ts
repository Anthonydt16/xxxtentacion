import { TextChannel } from 'discord.js';
import SpotifyApi from '../model/spotify';
import { releasesFridayNight } from './releasesFridayNight';

class Cron {
    constructor(spotifyApi: SpotifyApi, channel: TextChannel) {
        releasesFridayNight(spotifyApi, channel);
    }
}

export default Cron;