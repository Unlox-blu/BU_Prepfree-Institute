"use client";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function AuthBridge() {
  return (
    <html>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (async () => {
                // Extract transfer token from hash
                const transferToken = new URLSearchParams(location.hash.slice(1)).get("transferToken");

                if (!transferToken) {
                  location.replace("/login"); 
                  return;
                }

                // Hide the hash + hide auth-bridge instantly
                history.replaceState(null, "", "/auth-bridge");

                // Call backend to exchange encrypted token
                const res = await fetch("${API_URL}/api/v1/auth/exchange-token", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ transferToken })
                });

                const data = await res.json();

                // Save tokens
                localStorage.setItem("token", data.accessToken);
                localStorage.setItem("refreshToken", data.refreshToken);
                localStorage.setItem("userType", data.userType);

                // FINAL redirect
                location.replace("/dashboard");
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
