import type { Request, Response } from "express";
import * as crypto from 'crypto';

export default function validateJsonWebhook(request: Request, _response?: Response) {

    // calculate the signature
    const expectedSignature = "sha256=" +
        crypto.createHmac("sha256", process.env.JSONWEBHOOK_TOKEN!)
            .update(JSON.stringify(request.body))
            .digest("hex");

    // compare the signature against the one in the request
    const signature = request.headers["x-hub-signature-256"];
    return signature === expectedSignature
}