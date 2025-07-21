export const loginWithKakao = () =>
  new Promise<void>((resolve, reject) => {
    Kakao.Auth.authorize({
      redirectUri: `${window.location.origin}/oauth/kakao`,
      throughTalk: true,
      prompts: "login",
      state: crypto.randomUUID()
    });
    resolve();
  });
