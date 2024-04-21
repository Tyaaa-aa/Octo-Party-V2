import getTwitchAccessToken from '../utils/getTwitchAccessToken';

async function getStreamerProfileInfo(streamers: string[], headers: Record<string, string>) {
  const URL = `https://api.twitch.tv/helix/users?login=${streamers.join('&login=')}`;

  const response = await $fetch<TwitchProfileInfoResponse | TwitchErrorResponse>(URL, { headers: headers });

  if (!response) {
    console.log('no streamResponse');
    return { error: 'No streamResponse' };
  }

  if ('error' in response) {
    console.log('error in streamResponse');
    return { error: response.error };
  }

  return response.data;
}

async function getOnlineStreamers(streamers: string[], headers: Record<string, string>) {
  const URL = `https://api.twitch.tv/helix/streams?user_login=${streamers.join('&user_login=')}`;

  const response = await $fetch<TwitchStreamResponse | TwitchErrorResponse>(URL, { headers: headers });

  if (!response) {
    console.log('no streamResponse');
    return { error: 'No streamResponse' };
  }

  if ('error' in response) {
    console.log('error in streamResponse');
    return { error: response.error };
  }

  return response.data;
}

async function getStreamerData(streamers: string[], clientID: string, clientSecret: string) {
  if (!streamers || streamers.length === 0) return { error: 'No streamers provided' };

  if (!Array.isArray(streamers)) {
    streamers = JSON.parse(streamers);
  }

  const accessToken = await getTwitchAccessToken(clientID, clientSecret);

  if (!accessToken) {
    console.log('no access token');
    return { error: 'No access token' };
  }

  const HEADERS = {
    Authorization: `Bearer ${accessToken}`,
    'Client-ID': clientID
  }

  const onlineStreamers = await getOnlineStreamers(streamers, HEADERS);

  const profileInfo = await getStreamerProfileInfo(streamers, HEADERS);

  if (!Array.isArray(onlineStreamers)) return { error: 'An error occured fetching online streamers please try again' };
  if (!Array.isArray(profileInfo)) return { error: 'An error occured fetching profile info please try again' };

  for (const stream of onlineStreamers) {
    const profile = profileInfo
      .find((profile) => profile.id === stream.user_id);
    if (profile) {
      stream.profile_image_url = profile.profile_image_url;
    }
  }

  const online = onlineStreamers
    .map((stream) => {
      return {
        user_name: stream.user_name,
        viewer_count: stream.viewer_count,
        profile_picture: stream.profile_image_url,
      };
    })
    .sort((a, b) => a.user_name
      .localeCompare(b.user_name));

  const offline = profileInfo
    .filter((profile) => !onlineStreamers
      .some((stream) => stream.user_id === profile.id))
    .map((profile) => {
      return {
        user_name: profile.display_name,
        viewer_count: 0,
        profile_picture: profile.profile_image_url,
      };
    })
    .sort((a, b) => a.user_name
      .localeCompare(b.user_name));

  const data = {
    online: online,
    offline: offline,
  };

  return { data };
}

// Twitch API credentials
const clientID = process.env.TWITCH_CLIENTID ?? ''
const clientSecret = process.env.TWITCH_SECRET ?? ''

export default defineEventHandler(async (event) => {
  const { streamer_list } = await readBody(event)

  const streamerData = await getStreamerData(streamer_list, clientID, clientSecret);

  return streamerData
})
