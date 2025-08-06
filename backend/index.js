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
  const { accessToken } = req.body;
  if (!accessToken) {
    return res.status(400).send({ error: 'Access token is required.' });
  }

  try {
    const kakaoProfileResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    const kakaoId = kakaoProfileResponse.data.id;
    if (!kakaoId) {
      return res.status(400).send({ error: 'Failed to get user ID from Kakao.' });
    }
    
    const uid = `kakao:${kakaoId}`;
    const firebaseToken = await admin.auth().createCustomToken(uid);
    res.status(200).send({ firebaseToken });

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