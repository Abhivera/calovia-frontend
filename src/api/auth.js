import axiosInstance from "./axiosInstance";

/** @typedef {{ email: string, password: string, full_name?: string }} RegisterBody */
/** @typedef {{ email: string, password: string }} LoginBody */
/** @typedef {{ access_token: string, token_type: string }} TokenResponse */

/**
 * @param {RegisterBody} data
 * @returns {Promise<TokenResponse>}
 */
export async function register(data) {
  const res = await axiosInstance.post("/auth/register", data);
  return res.data;
}

/**
 * @param {LoginBody} data
 * @returns {Promise<TokenResponse>}
 */
export async function login(data) {
  const res = await axiosInstance.post("/auth/login", data);
  return res.data;
}
