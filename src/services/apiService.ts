// apiService.ts
const BASE_URL = 'http://localhost:3000/api';

interface CreateSessionData {
  userId: string;
  latOrCity: any;
  longOrState: any;
  radiusInMeters: number;
}

interface JoinSessionData {
  userId: string;
}

interface VoteData {
  code: string;
  userId: string;
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
  const response = await fetch(`${BASE_URL}/sessions/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const joinSession = async (
  sessionCode: string,
  data: JoinSessionData,
) => {
  const response = await fetch(`${BASE_URL}/sessions/${sessionCode}/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const getSession = async (sessionCode: string) => {
  const response = await fetch(`${BASE_URL}/sessions/${sessionCode}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    // Include headers for authentication if needed
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
