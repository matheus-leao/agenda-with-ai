import getBaseUrl from "./urlHelper.js";
import http from "k6/http";

export default class UserHelper {
  createUser = (userBody) => {
    const createUserResponse = http.post(`${getBaseUrl()}/register`, userBody, {
      headers: { "Content-Type": "application/json" },
    });
    return createUserResponse;
  };

  loginUser = (userBody) => {
    const loginUserResponse = http.post(`${getBaseUrl()}/login`, userBody, {
      headers: { "Content-Type": "application/json" },
    });
    return loginUserResponse;
  };
}
