export function fakeLogin(username: string, password: string) {
  return new Promise<{ token: string }>((resolve, reject) => {
    setTimeout(() => {
      if (username === "admin" && password === "admin") {
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
