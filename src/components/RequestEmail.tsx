import { useState } from "react";

function RequestEmail() {
  const [email, setEmail] = useState("");

  return (
    <div>
      <h2>Request email Demo</h2>
      <button
        onClick={() => {
          // @ts-ignore
          window.silk
            .requestEmail()
            // @ts-ignore
            .then((result) => {
              setEmail(result);
            })
            // @ts-ignore
            .catch((err) => console.error(err));
        }}
        className="button"
      >
        Request email address
      </button>
      <p>Email: {email}</p>
    </div>
  );
}

export default RequestEmail;
