import axios from "axios";

// ✅ Dynamic API URL for dev and production
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://jobbot-production-ddd9.up.railway.app";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true", // Add this line
  },
  withCredentials: true, // include cookies if needded
});

// ==================== REQUEST INTERCEPTOR ====================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ Only add ngrok header if using ngrok URL
    if (API_BASE_URL.includes("ngrok")) {
      config.headers["ngrok-skip-browser-warning"] = "69420";
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ==================== RESPONSE INTERCEPTOR ====================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error("Request error:", error.message);

    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn("⚠️ Unauthorized - redirecting to login");
      localStorage.clear();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

// ==================== CREDIT API HELPERS ====================
export interface CreditBalance {
  remaining: number;
  total: number;
  used: number;
  used_today: number;
  percentage: number;
}

export interface CreditHistoryRecord {
  id: string;
  user_id: string;
  credits_added: number;
  credits_used: number;
  credits_remaining: number;
  source: string;
  created_at: string;
}

export interface CreditHistory {
  history: CreditHistoryRecord[];
  total_records: number;
}

export const fetchCreditBalance = async (): Promise<CreditBalance> => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const response = await api.get("/v1/credits/balance", {
    params: { timezone }
  });
  return response.data;
};

export const fetchCreditHistory = async (): Promise<CreditHistory> => {
  const response = await api.get("/v1/credits/history");
  return response.data;
};

export const fetchUserProfile = async () => {
  const response = await api.post("/v1/profile/me");
  return response.data;
};

export default api;
// import axios from "axios";

// // Always define API base URL dynamically
// // const API_BASE_URL =
// //   process.env.NEXT_PUBLIC_API_URL ||
// //   "https://jobbot-production-ddd9.up.railway.app"; // your Railway backend URL

// const api = axios.create({
//   baseURL: "https://36ce6792db51.ngrok-free.app",
//   headers: {
//     "Content-Type": "application/json",
//     "ngrok-skip-browser-warning": "true",  // Add this line
//   },
//   withCredentials: true, // include cookies if needed
// });

// // ==================== REQUEST INTERCEPTOR ====================
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("access_token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // ==================== RESPONSE INTERCEPTOR ====================
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (error.response && (error.response.status === 401 || error.response.status === 403)) {
//       console.error("❌ Token verification failed:", error);

//       try {
//         await api.post("/v1/profile/me");
//       } catch (verifyError) {
//         console.warn("Access token invalid — redirecting to login...");
//         localStorage.removeItem("access_token");
//         localStorage.removeItem("user");
//         window.location.href = "/login";
//       }
//     } else if (error.response) {
//       console.error("Response not OK:", error.response.status, error.response.statusText);
//       console.error("Response body:", error.response.data);
//     } else {
//       console.error("Request error:", error.message);
//     }
//     return Promise.reject(error);
//   }
// );

// // ==================== CREDIT API HELPERS ====================
// export interface CreditBalance {
//   remaining: number;
//   total: number;
//   used: number;
//   percentage: number;
// }

// export interface CreditHistoryRecord {
//   id: string;
//   user_id: string;
//   credits_added: number;
//   credits_used: number;
//   credits_remaining: number;
//   source: string;
//   created_at: string;
// }

// export interface CreditHistory {
//   history: CreditHistoryRecord[];
//   total_records: number;
// }

// export const fetchCreditBalance = async (): Promise<CreditBalance> => {
//   const response = await api.get("/v1/credits/balance");
//   return response.data;
// };

// export const fetchCreditHistory = async (): Promise<CreditHistory> => {
//   const response = await api.get("/v1/credits/history");
//   return response.data;
// };

// export const fetchUserProfile = async () => {
//   const response = await api.post("/v1/profile/me");
//   return response.data;
// };

// export default api;

// // import axios from "axios";

// // const api = axios.create({

// //   baseURL: "https://924927222f81.ngrok-free.app",
// //   headers: {
// //     "Content-Type": "application/json",
// //     "ngrok-skip-browser-warning": "69420", // ← ADD THIS LINE
// //   },

// // });

// // // ✅ Ensure token is always attached
// // api.interceptors.request.use((config) => {
// //   const token = localStorage.getItem("access_token");
// //   if (token) {
// //     config.headers.Authorization = `Bearer ${token}`;
// //   }
// //   return config;
// // });

// // // ==================== CREDIT API HELPERS ====================

// // export interface CreditBalance {
// //   remaining: number;
// //   total: number;
// //   used: number;
// //   percentage: number;
// // }

// // export interface CreditHistoryRecord {
// //   id: string;
// //   user_id: string;
// //   credits_added: number;
// //   credits_used: number;
// //   credits_remaining: number;
// //   source: string;
// //   created_at: string;
// // }

// // export interface CreditHistory {
// //   history: CreditHistoryRecord[];
// //   total_records: number;
// // }

// // /**
// //  * Fetch user's credit balance summary
// //  * Returns: used, total, remaining, and percentage for progress bar
// //  */
// // export const fetchCreditBalance = async (): Promise<CreditBalance> => {
// //   const response = await api.get("/v1/credits/balance");
// //   return response.data;
// // };

// // /**
// //  * Fetch user's full credit transaction history
// //  * Returns all credit_history records ordered by timestamp (newest first)
// //  */
// // export const fetchCreditHistory = async (): Promise<CreditHistory> => {
// //   const response = await api.get("/v1/credits/history");
// //   return response.data;
// // };

// // export default api;

// // // import axios from "axios";

// // // // This will connect frontend to backend
// // // const api = axios.create({
// // //   baseURL: import.meta.env.VITE_API_BASE_URL,
// // // });

// // // export default api;
