export { TwitchStreamResponse, TwitchProfileInfoResponse, TwitchErrorResponse, SettingStoreState, OctoStoreState, embedsListState, StreamerStatus, Notification, Toggle};

declare global {
    // API response types
    interface TwitchStreamResponse {
        data: {
            user_id: string;
            user_name: string;
            user_login: string;
            viewer_count: number;
            profile_image_url: string;
        }[];
    }
    interface TwitchProfileInfoResponse {
        data: {
            id: string;
            login: string;
            display_name: string;
            profile_image_url: string;
        }[];
    }
    interface TwitchErrorResponse {
        error: string;
    }

    // Setting store state types
    interface SettingStoreState {
        Notifications: boolean,
        AutoRemove: boolean,
        RememberLastLayout: boolean,
        LastLayout: {
            expanded: {
                status: boolean,
                streamer: string,
            },
            streamerList: string[],
        },
        Volume: number,
        Muted: boolean,
        TheatreAudio: boolean,
        Chat: boolean,
        ChatLocation: string,
    }

    // Octo store state types (User saved data)
    interface OctoStoreState {
        octoData: string[],
    }

    // Embeds list state types
    interface embedsListState {
        embedsList: string[];
    }
    
    // Streamer status types
	interface StreamerStatus {
        user_login: string;
		user_name: string;
		viewer_count: number;
		profile_picture: string;
	}

    // Notification types
	interface Notification {
		streamer_name: string;
        streamer_login: string;
		view_count: string;
		timestamp: Date;
	}

    interface Window {
        Twitch: any;
    }

    // Toggle type
	type Toggle = NonNullable<"toggle">;
}