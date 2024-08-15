import axios from 'axios';
import * as dotenv from 'dotenv';
import { Album, SpotifyApiResponse, Track } from './type';

dotenv.config();

class SpotifyApi {
    private clientId: string;
    private clientSecret: string;
    private accessToken: string | null;
    private tokenExpiry: number | null;

    constructor() {
        this.clientId = process.env.SPOTIFY_CLIENT_ID!;
        this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    // Méthode pour récupérer le token d'accès
    public async authenticate(): Promise<void> {
        try {
            const response = await axios.post('https://accounts.spotify.com/api/token', null, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                params: {
                    grant_type: 'client_credentials',
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                },
            });

            this.accessToken = response.data.access_token;
            this.tokenExpiry = Date.now() + response.data.expires_in * 1000;

            console.log('Authenticated with Spotify. Token:', this.accessToken);
        } catch (error) {
            console.error('Failed to authenticate with Spotify:', error);
            throw new Error('Authentication failed');
        }
    }

    // Méthode pour vérifier et rafraîchir le token si nécessaire
    private async refreshTokenIfNeeded(): Promise<void> {
        if (!this.accessToken || Date.now() >= this.tokenExpiry!) {
            console.log('Refreshing Spotify token...');
            await this.authenticate();
        }
    }

    // Méthode pour récupérer le token d'accès actuel
    public async getAccessToken(): Promise<string> {
        await this.refreshTokenIfNeeded();
        return this.accessToken!;
    }


    public async getTopTracksByGenre(genre: string, country: string): Promise<Track[]> {
        const accessToken = await this.getAccessToken();
        const response = await axios.get('https://api.spotify.com/v1/search', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            params: {
                q: `genre:${genre}`,
                type: 'track',
                market: country,
                limit: 10,
                sort: 'popularity',
            },
        });
        return response.data.tracks.items;
    }

    public async searchReleasesFridayNight(): Promise<Album[]> {
        const accessToken = await this.getAccessToken();
        const response = await axios.get('https://api.spotify.com/v1/browse/new-releases', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            params: {
                limit: 50,
            },
        });
        const albumsFilter = response.data.albums.items.filter((album: Album) => {
            //album sortie cette entre aujourd'hui et il y a 2 semaines
            const releaseDate = new Date(album.release_date);
            const twoWeeksAgo = new Date();
            twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
            return releaseDate >= twoWeeksAgo && releaseDate <= new Date();
        });
        console.log(albumsFilter);
        
        return albumsFilter;
    }
}

export default SpotifyApi;
