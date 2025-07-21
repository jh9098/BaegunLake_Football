export default function Home() {
  return (
    <section className="mx-auto max-w-4xl p-6 text-center">
      <h1 className="text-3xl font-bold mb-4">즐겁게 성장하는 우리 아이!</h1>
      <p className="mb-8">
        전문 코치와 함께하는 주니어 축구클럽.{' '}
        카카오로 3초만에 가입하고 훈련 일정·성취도를 실시간으로 확인하세요.
      </p>
      <a
        href="https://kauth.kakao.com/oauth/authorize?client_id=YOUR_APP_KEY&redirect_uri=https://localhost/oauth/kakao&response_type=code"
        className="inline-block rounded bg-primary px-6 py-3 text-white shadow"
      >
        Kakao로 시작하기
      </a>
    </section>
  );
}
