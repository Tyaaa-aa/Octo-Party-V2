async function checkStreamerExistence(streamerName: string, clientID: string, clientSecret: string): Promise<boolean> {
    const encodedStreamerName = encodeURIComponent(streamerName);
    const userURL = `https://api.twitch.tv/helix/users?login=${encodedStreamerName}`;

    const accessToken = await getAccessToken(clientID, clientSecret);

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
        const userName = userData.data[0].display_name
        // console.log(userData.data[0].display_name)
        return userName // Return true if the user exists
    } catch (error) {
        console.error('Error:', error);
        return false; // Error handling for network issues or unexpected errors
    }
}

async function getAccessToken(clientID: string, clientSecret: string): Promise<string | null> {
    const tokenURL = 'https://id.twitch.tv/oauth2/token';
    const tokenParams = new URLSearchParams({
        'client_id': clientID,
        'client_secret': clientSecret,
        'grant_type': 'client_credentials'
    });

    try {
        const tokenResponse = await fetch(tokenURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: tokenParams
        });

        if (!tokenResponse.ok) {
            return null; // Error handling for failed request
        }

        const tokenData = await tokenResponse.json();
        return tokenData.access_token || null;
    } catch (error) {
        console.error('Error:', error);
        return null; // Error handling for network issues or unexpected errors
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
