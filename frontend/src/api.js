const API_BASE_URL = process.env.REACT_APP_API_URL;

export async function getUsers() {
  const response = await fetch(`${API_BASE_URL}/api/users`);
  if (!response.ok) throw new Error('Fehler beim Abrufen der Daten');
  return response.json();
}
