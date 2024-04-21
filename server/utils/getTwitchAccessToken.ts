export default async function getTwitchAccessToken(clientID: string, clientSecret: string): Promise<string | null> {
    const tokenURL = 'https://id.twitch.tv/oauth2/token';
    const tokenParams = new URLSearchParams({
        client_id: clientID,
        client_secret: clientSecret,
        grant_type: 'client_credentials'
    });

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
}