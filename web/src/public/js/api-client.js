export const apiGet = async (path) => {
  const response = await fetch(path, {
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `GET ${path} failed`);
  }

  return response.json();
};

export const apiPost = async (path, body = {}) => {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    let message = `POST ${path} failed`;

    try {
      const data = await response.json();
      message = data.error || data.message || message;
    } catch (_error) {
      const text = await response.text();
      message = text || message;
    }

    throw new Error(message);
  }

  return response.json();
};