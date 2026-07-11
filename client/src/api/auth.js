import api from "./api";

export const signup = (data) =>
    api.post("/auth/signup", data);

export const login = (email, password) => {

    const form = new URLSearchParams();

    form.append("username", email);
    form.append("password", password);

    return api.post(
        "/auth/login",
        form,
        {
            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded"
            }
        }
    );
};

export const me = () =>
    api.get("/auth/me");