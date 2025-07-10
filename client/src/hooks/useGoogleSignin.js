const useGoogleSignin = () => {
  return () => {
     const url = `https://accounts.google.com/o/oauth2/v2/auth` +
      `?response_type=code` +
      `&client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${import.meta.env.VITE_GOOGLE_REDIRECT_URI}` +
      `&scope=openid%20email%20profile`;

    window.location.href = url;
  }
}

export default useGoogleSignin;