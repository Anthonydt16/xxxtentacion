interface SpotifyApiResponse {
    tracks: {
        href: string;
        limit: number;
        next: string;
        offset: number;
        previous: string;
        total: number;
        items: Track[];
    };
    artists: {
        href: string;
        limit: number;
        next: string;
        offset: number;
        previous: string;
        total: number;
        items: Artist[];
    };
    albums: {
        href: string;
        limit: number;
        next: string;
        offset: number;
        previous: string;
        total: number;
        items: Album[];
    };
    playlists: {
        href: string;
        limit: number;
        next: string;
        offset: number;
        previous: string;
        total: number;
        items: Playlist[];
    };
    shows: {
        href: string;
        limit: number;
        next: string;
        offset: number;
        previous: string;
        total: number;
        items: Show[];
    };
    episodes: {
        href: string;
        limit: number;
        next: string;
        offset: number;
        previous: string;
        total: number;
        items: Episode[];
    };
    audiobooks: {
        href: string;
        limit: number;
        next: string;
        offset: number;
        previous: string;
        total: number;
        items: Audiobook[];
    };
}

interface Track {
    album: Album;
    artists: Artist[];
    available_markets: string[];
    disc_number: number;
    duration_ms: number;
    explicit: boolean;
    external_ids: {
        isrc: string;
        ean: string;
        upc: string;
    };
    external_urls: {
        spotify: string;
    };
    href: string;
    id: string;
    is_playable: boolean;
    linked_from?: object;
    restrictions?: {
        reason: string;
    };
    name: string;
    popularity: number;
    preview_url: string;
    track_number: number;
    type: string;
    uri: string;
    is_local: boolean;
}

interface Artist {
    external_urls: {
        spotify: string;
    };
    followers: {
        href?: string;
        total: number;
    };
    genres: string[];
    href: string;
    id: string;
    images: Image[];
    name: string;
    popularity: number;
    type: string;
    uri: string;
}

interface Album {
    album_type: string;
    total_tracks: number;
    available_markets: string[];
    external_urls: {
        spotify: string;
    };
    href: string;
    id: string;
    images: Image[];
    name: string;
    release_date: string;
    release_date_precision: string;
    restrictions?: {
        reason: string;
    };
    type: string;
    uri: string;
    artists: Artist[];
}

interface Playlist {
    collaborative: boolean;
    description: string;
    external_urls: {
        spotify: string;
    };
    href: string;
    id: string;
    images: Image[];
    name: string;
    owner: {
        external_urls: {
            spotify: string;
        };
        followers: {
            href?: string;
            total: number;
        };
        href: string;
        id: string;
        type: string;
        uri: string;
        display_name: string;
    };
    public: boolean;
    snapshot_id: string;
    tracks: {
        href: string;
        total: number;
    };
    type: string;
    uri: string;
}

interface Show {
    available_markets: string[];
    copyrights: {
        text: string;
        type: string;
    }[];
    description: string;
    html_description: string;
    explicit: boolean;
    external_urls: {
        spotify: string;
    };
    href: string;
    id: string;
    images: Image[];
    is_externally_hosted: boolean;
    languages: string[];
    media_type: string;
    name: string;
    publisher: string;
    type: string;
    uri: string;
    total_episodes: number;
}

interface Episode {
    audio_preview_url: string;
    description: string;
    html_description: string;
    duration_ms: number;
    explicit: boolean;
    external_urls: {
        spotify: string;
    };
    href: string;
    id: string;
    images: Image[];
    is_externally_hosted: boolean;
    is_playable: boolean;
    language: string;
    languages: string[];
    name: string;
    release_date: string;
    release_date_precision: string;
    resume_point?: {
        fully_played: boolean;
        resume_position_ms: number;
    };
    type: string;
    uri: string;
    restrictions?: {
        reason: string;
    };
}

interface Audiobook {
    authors: {
        name: string;
    }[];
    available_markets: string[];
    copyrights: {
        text: string;
        type: string;
    }[];
    description: string;
    html_description: string;
    edition: string;
    explicit: boolean;
    external_urls: {
        spotify: string;
    };
    href: string;
    id: string;
    images: Image[];
    languages: string[];
    media_type: string;
    name: string;
    narrators: {
        name: string;
    }[];
    publisher: string;
    type: string;
    uri: string;
    total_chapters: number;
}

interface Image {
    url: string;
    height: number;
    width: number;
}


export { SpotifyApiResponse, Track, Artist, Album, Playlist, Show, Episode, Audiobook, Image };