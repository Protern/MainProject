
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const runCode = async ({
  language,
  code,
  problemId = null,
  input = null,
  token = null
}) => {
  
  try {
    // console.log("runCode called with input:", JSON.stringify(input));
    const payload = { language, code };
    if (problemId) payload.problemId = problemId;
    // if (input)     payload.input     = input;
    if (input !== null && input !== undefined) payload.input = input;


    // Build headers conditionally
    const headers = {};
    if (token && token !== "null" && token !== "undefined") {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await axios.post(`${API_URL}/run`, payload, {
      headers,
      timeout: 15000 // optional timeout
    });

    return res.data;
  } catch (err) {
    return {
      error: err.response?.data?.error || err.message || "Execution failed",
      stderr: err.response?.data?.stderr || null
    };
  }
};
