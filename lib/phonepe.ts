// lib/phonepe.ts

export async function getAccessToken() {
  const authUrl = process.env.PHONEPE_ENV === 'production' 
    ? 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token';

  const body = new URLSearchParams({
    client_id: process.env.PHONEPE_CLIENT_ID!,
    client_version: process.env.PHONEPE_CLIENT_VERSION!,
    client_secret: process.env.PHONEPE_CLIENT_SECRET!,
    grant_type: 'client_credentials',
  });

  const response = await fetch(authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to generate PhonePe token");
  }

  return data.access_token; // The Authorization: O-Bearer token
}