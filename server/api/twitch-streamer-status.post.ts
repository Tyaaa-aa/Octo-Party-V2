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

  if (!accessToken) {
    console.log('no access token');
    return { error: 'No access token' };
  }

  if (!Array.isArray(streamers)) {
    streamers = JSON.parse(streamers);
  }

  const streamerNames = streamers.join('&user_login=');
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

  if ('error' in streamResponse) {
    console.log('error in streamResponse');
    return { error: streamResponse.error };
  }

  const onlineStreamers = [];
  let offlineStreamers: string[] = []; // Define type explicitly

  for (const stream of streamResponse.data) {
    onlineStreamers.push({
      user_name: stream.user_name,
      viewer_count: stream.viewer_count,
      profile_picture: 'null' // Placeholder for profile picture
    });
  }

  const sName = streamResponse.data.map((stream) => stream.user_name);
  offlineStreamers = streamers.filter((streamer) => !sName.includes(streamer)); // Assign the filtered streamers to offlineStreamers

  const streamerNameImgJoin = streamers.join('&login=');

  // Additional request to get profile pictures
  const usersURL = `https://api.twitch.tv/helix/users?login=${streamerNameImgJoin}`;

  interface TwitchProfilePicture {
    data: {
      display_name: string;
      profile_image_url: string
    }[]
  }

  const usersResponse = await $fetch<TwitchProfilePicture>(usersURL, {
    headers: streamHeaders
  });

  if (usersResponse && 'data' in usersResponse) {
    for (const user of usersResponse.data) {
      const index = onlineStreamers.findIndex(streamer => streamer.user_name === user.display_name);
      if (index !== -1) {
        onlineStreamers[index].profile_picture = user.profile_image_url;
      }
    }
  } else {
    console.log('no usersResponse');
    return { error: 'Error fetching profile photos' };
  }

  const data = {
    online: onlineStreamers,
    offline: offlineStreamers,
  };

  return { data };
}


// Your Twitch API credentials
const clientID = process.env.TWITCH_CLIENTID ?? ''
const clientSecret = process.env.TWITCH_SECRET ?? ''

export default defineEventHandler(async (event) => {
  const { streamer_list } = await readBody(event)

  const streamerStatus = await checkStreamersStatus(streamer_list, clientID, clientSecret);

  return streamerStatus
})
