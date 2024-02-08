async function getAccessToken(clientID: string, clientSecret: string): Promise<string | null> {
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

interface TwitchStreamResponse {
  data: {
    id: string;
    user_name: string;
    viewer_count: number;
  }[];
}

interface TwitchErrorResponse {
  error: string;
}

async function checkStreamersStatus(streamers: string[], clientID: string, clientSecret: string) {
  const accessToken = await getAccessToken(clientID, clientSecret);
  // console.log(streamers);
  // return

  if (!accessToken) {
    console.log('no access token');
    return { error: 'No access token' };
  }

  if (!Array.isArray(streamers)) {
    // console.log('streamers is not an array')
    streamers = JSON.parse(streamers)
    // return
  }
  const streamerNames = streamers.join('&user_login=');
  // const streamerNames = streamers.map(encodeURIComponent).join('&user_login=');
  const streamURL = `https://api.twitch.tv/helix/streams?user_login=${streamerNames}`;
  const streamHeaders = {
    Authorization: `Bearer ${accessToken}`,
    'Client-ID': clientID
  };


  const streamResponse = await $fetch<TwitchStreamResponse | TwitchErrorResponse>(streamURL, {
    headers: streamHeaders
  });

  if (!streamResponse) {
    console.log('no streamResponse');
    return { error: 'No streamResponse' };
  }

  // const streamData = await streamResponse
  // console.log(streamResponse);
  // return streamData.data || [];

  if ('error' in streamResponse) {
    console.log('error in streamResponse');
    return { error: streamResponse.error };
  }

  // console.log(streamResponse);

  let onlineStreamers = [];

  for (let i = 0; i < streamResponse.data.length; i++) {
    onlineStreamers.push({
      user_name: streamResponse.data[i].user_name,
      viewer_count: streamResponse.data[i].viewer_count,
    });
  }

  const sName = streamResponse.data.map((stream) => stream.user_name)
  const offlineStreamers = streamers.filter((streamer) => !sName.includes(streamer))
  // const viewerCount = streamResponse.data.map((streamer) => streamer.viewer_count)

  // console.log(onlineStreamers);
  // console.log(offlineStreamers);


  const data = {
    online: onlineStreamers,
    offline: offlineStreamers,
  }


  return { data }


}

// Your Twitch API credentials
const clientID = process.env.TWITCH_CLIENTID ?? ''
const clientSecret = process.env.TWITCH_SECRET ?? ''

export default defineEventHandler(async (event) => {
  const { streamer_list } = await readBody(event)

  const streamerStatus = await checkStreamersStatus(streamer_list, clientID, clientSecret);

  return streamerStatus
})
