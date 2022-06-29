// src/api.js

// fragments microservice API, defaults to localhost:8080
const apiUrl = process.env.API_URL || 'http://localhost:8080';

/**
 * Given an authenticated user, request all fragments for this user from the
 * fragments microservice (currently only running locally). We expect a user
 * to have an `idToken` attached, so we can send that along with the request.
 */
export async function getUserFragments(user, expand = 0) {
  console.log('Requesting user fragments data...');

  try {
    const res = await fetch(`${apiUrl}/v1/fragments?expand=${expand}`, {
      headers: {
        Authorization: `Bearer ${user.idToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log('Got user fragments data', { data });
  } catch (err) {
    console.error('Unable to call GET /v1/fragment', { err });
  }
}

export async function postUserFragment(user, contentType, fragmentData) {
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user.idToken}`,
        'Content-Type': contentType,
      },
      body: fragmentData,
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
  } catch (err) {
    console.error('Unable to call POST /v1/fragment');
  }
}

export async function getFragmentMetaData(user, id) {
  console.log(`Requesting a fragment data by using its id: ${id}`);

  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}/info`, {
      headers: {
        Authorization: `Bearer ${user.idToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    const data = await res.text();
    console.log(data);
  } catch (err) {
    console.error('Unable to call GET /v1/fragments/:id/info', { err });
  }
}
