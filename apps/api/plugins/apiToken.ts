import { Request } from "express";

export default async function ApiToken(request: Request, _response?: Response) {
    return request.headers["Authorization"] === process.env.API_TOKEN
}