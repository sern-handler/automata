// code now reworked from https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries#typescript-example
// instead of using some random code I found on a 2013 blog post
import * as crypto from 'node:crypto';
import { Context } from 'hono';

export default async function validateJsonWebhook(c: Context) {
    const body = await c.req.json()
    const requestHeader = c.req.header('x-hub-signature-256');
    if (!requestHeader || !body) return false;

    const expectedSignature = crypto.createHmac("sha256", process.env.JSONWEBHOOK_TOKEN!)
        .update(JSON.stringify(body))
        .digest("hex");
    
    let trusted = Buffer.from(`sha256=${expectedSignature}`, 'ascii');
    let untrusted = Buffer.from(requestHeader, 'ascii');
    return crypto.timingSafeEqual(trusted, untrusted);
}