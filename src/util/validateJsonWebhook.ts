import * as crypto from 'crypto';
import { Context } from 'hono';

export default async function validateJsonWebhook(c: Context) {

    // calculate the signature
    const expectedSignature = "sha256=" +
        crypto.createHmac("sha256", process.env.JSONWEBHOOK_TOKEN!)
            .update(JSON.stringify(await c.req.json()))
            .digest("hex");

    // compare the signature against the one in the request
    const signature = c.req.header('x-hub-signature-256');
    return signature === expectedSignature
}