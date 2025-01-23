function Login() {
  return (
    <div>
      <h2>Login Demo</h2>
      <button
        onClick={() => {
          // @ts-ignore
          window.silk
            .login()
            // @ts-ignore
            .then((result) => {
              // @ts-ignore
              window.ethereum = window.silk;
            })
            // @ts-ignore
            .catch((err) => console.error(err));
        }}
        className="button"
      >
        Login
      </button>
    </div>
  );
}

export default Login;
