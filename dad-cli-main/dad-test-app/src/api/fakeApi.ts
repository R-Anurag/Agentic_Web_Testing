export function fakeLogin(username: string, password: string) {
  return new Promise<{ token: string }>((resolve, reject) => {
    setTimeout(() => {
      // Constant-time comparison to prevent timing attacks
      const validUsername = "admin";
      const validPassword = "admin";
      
      let usernameMatch = username.length === validUsername.length;
      let passwordMatch = password.length === validPassword.length;
      
      // Always compare all characters to maintain constant time
      for (let i = 0; i < Math.max(username.length, validUsername.length); i++) {
        if (username[i] !== validUsername[i]) {
          usernameMatch = false;
        }
      }
      
      for (let i = 0; i < Math.max(password.length, validPassword.length); i++) {
        if (password[i] !== validPassword[i]) {
          passwordMatch = false;
        }
      }
      
      if (usernameMatch && passwordMatch) {
        resolve({ token: "jwt-token-123" });
      } else {
        reject(new Error("Invalid credentials"));
      }
    }, 800);
  });
}

export function fetchDashboardData() {
  return new Promise<{ stats: number[] }>((resolve) => {
    setTimeout(() => {
      resolve({ stats: [1, 2, 3] });
    }, 500);
  });
}
