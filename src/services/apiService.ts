// chickentender/src/services/apiService.ts

import Config from 'react-native-config';
import {Platform} from 'react-native'; // apiService.ts
if (Config.ENVIRONTMENT === 'prod') {
  var BASE_URL = Config.BASE_URL;
} else {
  if (Platform.OS === 'ios') {
    BASE_URL = 'http://localhost:3000/api';
  } else {
    BASE_URL = 'http://10.0.2.2:3000/api';
  }
}

interface CreateSessionData {
  username: string;
  param1: any;
  param2: any;
  radiusInMeters: Number;
  maxPriceLevel: Number;
}

interface VoteData {
  code: string;
  username: string;
  yelpBusinessId: string;
  vote: string;
}

// Helper function to handle the response
async function handleResponse(response: Response) {
  if (response.ok) {
    return response.json();
  } else {
    const error = await response.text();
    throw new Error(error);
  }
}

export const createSession = async (data: CreateSessionData) => {
  console.log(`Create Session params: ${JSON.stringify(data)}`);
  try {
    const response = await fetch(`${BASE_URL}/sessions/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

export const joinSession = async (sessionCode: string, username: string) => {
  const response = await fetch(`${BASE_URL}/sessions/${sessionCode}/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({username}),
  });
  return handleResponse(response);
};

export const getSession = async (sessionCode: string) => {
  const response = await fetch(`${BASE_URL}/sessions/${sessionCode}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

export const voteOnRestaurant = async (sessionCode: string, data: VoteData) => {
  const response = await fetch(`${BASE_URL}/sessions/${sessionCode}/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const getWinningRestaurant = async (sessionCode: string) => {
  console.log(`getting session results for ${sessionCode}`);
  const response = await fetch(`${BASE_URL}/sessions/${sessionCode}/results`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

export const updateUserVotingStatus = async (
  sessionCode: string,
  username: string,
) => {
  const data = {code: sessionCode, username: username};
  const response = await fetch(
    `${BASE_URL}/session/${sessionCode}/user/${username}/donevoting`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    },
  );
  return handleResponse(response);
};
