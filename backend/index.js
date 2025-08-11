require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const axios = require('axios');

// Firebase Admin SDK 초기화
try {
  // Render.com 배포 환경에서는 환경변수에서 직접 JSON 파싱
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : require(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error("Firebase Admin SDK 초기화 실패:", error);
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

app.post('/auth/kakao', async (req, res) => {
  const { code, redirectUri } = req.body;
  if (!code || !redirectUri) {
    return res.status(400).send({ error: 'Code and redirectUri are required.' });
  }

  try {
    const tokenResponse = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_REST_API_KEY,
        redirect_uri: redirectUri,
        code,
        client_secret: process.env.KAKAO_CLIENT_SECRET,
      }).toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      return res.status(400).send({ error: 'Failed to obtain access token from Kakao.' });
    }

    const kakaoProfileResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const kakaoId = kakaoProfileResponse.data.id;
    if (!kakaoId) {
      return res.status(400).send({ error: 'Failed to get user ID from Kakao.' });
    }

    const uid = `kakao:${kakaoId}`;
    const firebaseToken = await admin.auth().createCustomToken(uid);

    const profile = {
      kakaoId,
      displayName: kakaoProfileResponse.data.properties?.nickname,
      email: kakaoProfileResponse.data.kakao_account?.email || null,
      profileImageUrl: kakaoProfileResponse.data.properties?.profile_image,
    };

    res.status(200).send({ firebaseToken, profile });
  } catch (error) {
    console.error('Authentication error:', error.response ? error.response.data : error.message);
    res.status(500).send({ error: 'Authentication failed.' });
  }
});

app.get('/', (req, res) => {
  res.send('Soccer Academy Backend is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});