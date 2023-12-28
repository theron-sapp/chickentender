// chickentender/src/services/apiService.ts

import {Platform} from 'react-native'; // apiService.ts

const prod = true;

if (prod) {
  var BASE_URL = 'https://thawing-temple-25026-f4399745428d.herokuapp.com/api';
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
  place_id: string;
  vote: string;
}

async function handleResponse(response: Response) {
  if (response.ok) {
    // console.log(`Session Details: ${JSON.stringify(response, null, 2)}`);
    return response.json();
  } else {
    const error = await response.json();
    throw new Error(error.message || 'Unknown error occurred');
  }
}

export const createSession = async (data: CreateSessionData) => {
  console.log(
    `Prod: ${prod}\nBASE_URL:${BASE_URL}\nCreate Session params: ${JSON.stringify(
      data,
    )}`,
  );
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
  // console.log(`Session Details: ${JSON.stringify(response, null, 2)}`);
  return handleResponse(response);
};

export const leaveSession = async (sessionCode: string, username: string) => {
  const response = await fetch(`${BASE_URL}/sessions/${sessionCode}/leave`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({username}),
  });
  // console.log(`Session Details: ${JSON.stringify(response, null, 2)}`);
  return handleResponse(response);
};

export const deleteSession = async (sessionCode: string, username: string) => {
  try {
    const response = await fetch(
      `${BASE_URL}/sessions/${sessionCode}/${username}/delete`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    return handleResponse(response);
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
};

export const getSession = async (sessionCode: string) => {
  const response = await fetch(`${BASE_URL}/sessions/${sessionCode}/details`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

export const logErrorToServerConsole = async (errorMessage: string) => {
  const response = await fetch(`${BASE_URL}/sessions/log-message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({message: errorMessage}),
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
    `${BASE_URL}/sessions/${sessionCode}/user/${username}/donevoting`,
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

export const startVoting = async (sessionCode: string) => {
  const response = await fetch(`${BASE_URL}/sessions/${sessionCode}/close`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};
