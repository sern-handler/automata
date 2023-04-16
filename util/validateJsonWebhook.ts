import type { Request } from "express";
import * as crypto from 'crypto';

export function validateJsonWebhook(request: Request) {

    // calculate the signature
    const expectedSignature = "sha256=" +
        crypto.createHmac("sha256", process.env.TOKEN!)
            .update(JSON.stringify(request.body))
            .digest("hex");

    // compare the signature against the one in the request
    const signature = request.headers["x-hub-signature-256"];
    if (signature !== expectedSignature) {
        return false;
    } else {
        return true;
    }
}