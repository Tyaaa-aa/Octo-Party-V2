import getTwitchAccessToken from '../utils/getTwitchAccessToken';

async function checkStreamerExistence(streamerName: string, clientID: string, clientSecret: string): Promise<boolean> {
    const encodedStreamerName = encodeURIComponent(streamerName);
    const userURL = `https://api.twitch.tv/helix/users?login=${encodedStreamerName}`;

    const accessToken = await getTwitchAccessToken(clientID, clientSecret);

    if (!accessToken) {
        return false; // Error handling for failed access token retrieval
    }

    const userHeaders = {
        'Client-ID': clientID,
        'Authorization': `Bearer ${accessToken}`
    };

    try {
        const userResponse = await fetch(userURL, {
            headers: userHeaders
        });

        if (!userResponse.ok) {
            return false; // Error handling for failed request
        }

        const userData = await userResponse.json();
        // console.log(userData)
        const userName = userData.data[0].login
        // console.log(userData.data[0].login)
        return userName // Return true if the user exists
    } catch (error) {
        console.error('Error:', error);
        return false; // Error handling for network issues or unexpected errors
    }
}

// Your Twitch API credentials
const clientID = process.env.TWITCH_CLIENTID ?? ''
const clientSecret = process.env.TWITCH_SECRET ?? ''

export default defineEventHandler(async (event) => {
    const { streamerName } = await readBody(event)

    const streamerExists = await checkStreamerExistence(streamerName, clientID, clientSecret)
    
    if (streamerExists) {
        return { data: streamerExists }
    } else {
        return { data: false }
    }
})
