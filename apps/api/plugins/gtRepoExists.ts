import type { Request, Response } from "express";

export default async function ghRepoExists(request: Request, _response: Response) {
    console.log(request.body.repository)
    return false
}