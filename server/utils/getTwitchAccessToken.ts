export default async function getTwitchAccessToken(clientID: string, clientSecret: string): Promise<string | null> {
    const tokenURL = 'https://id.twitch.tv/oauth2/token';
    const tokenParams = new URLSearchParams({
        client_id: clientID,
        client_secret: clientSecret,
        grant_type: 'client_credentials'
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
            throw new Error(`Failed to get access token: ${tokenResponse.status} ${tokenResponse.statusText}`);
        }

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            throw new Error(`Twitch API error: ${tokenData.error}`);
        }

        return tokenData.access_token;
    } catch (error) {
        console.error("Error getting Twitch access token:", error);
        return null;
    }
}
