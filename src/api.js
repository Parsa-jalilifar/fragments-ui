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
    return data['fragments'];
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
  console.log(`Requesting a fragment meta data by using its id: ${id}`);

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

export async function getFragmentData(user, id, ext) {
  console.log(`Requesting a fragment data by using its id: ${id}`);

  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}${ext}`, {
      headers: {
        Authorization: `Bearer ${user.idToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    let data;
    console.log(res.headers.get('content-type'));

    if (res.headers.get('content-type').startsWith('text/')) {
      data = await res.text();
    } else if (res.headers.get('content-type').startsWith('application/json')) {
      data = await res.json();
    } else {
      data = await res.blob();
    }
    console.log({ contentType: res.headers.get('content-type'), data: data });
    return { contentType: res.headers.get('content-type'), data: data };
  } catch (err) {
    console.error('Unable to call GET /v1/fragments/:id.ext', { err });
  }
}

export async function deleteUserFragment(user, id) {
  console.log('Delete a fragment data by using its ID');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${user.idToken}`,
      },
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Deleted fragments data', { data });
  } catch (err) {
    console.error('Unable to call DELETE /v1/fragments', { err });
  }
}

export async function updateUserFragmentData(user, id, contentType, fragmentData) {
  console.log('Update fragment with a new data');

  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${user.idToken}`,
        'Content-Type': contentType,
      },
      body: fragmentData,
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Updated fragments data', { data });
  } catch (err) {
    console.error('Unable to call PUT /v1/fragments', { err });
  }
}
