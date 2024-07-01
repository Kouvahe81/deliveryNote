export const REACT_APP_BACKEND_URL =
    process.env.NODE_ENV === "production"
        ? "https://database-deliverynote.azurewebsites.net"
        : "http://localhost:4000";