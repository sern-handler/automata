import express from 'express';
import 'dotenv/config';
import { execa } from 'execa';
import { validateJsonWebhook } from './util/validateJsonWebhook.js';
import babashkaScripts from './babashka/scripts.json' assert { type: 'json' };
import PocketBase from 'pocketbase';
import { FeedbackRecord } from './util/pbtypes.js';
import { FeedbackRequestBody } from './util/types.js';
import cors from 'cors'
import rateLimit from 'express-rate-limit';
import { Webhook } from 'simple-discord-webhooks';
import { codeBlock } from './util/discordCodeBlock.js';

const devMode = process.argv[2] === '--dev';
if (devMode) console.log('You\'re a developer 😎 (sorry for that emoji jumpscare)')

const pb = new PocketBase('https://pb.automata.sern.dev');
await pb.admins.authWithPassword(process.env.PB_EMAIL!, process.env.PB_PASS!).then(() => console.log('Logged into Pocketbase!'))

const app = express()
app.use(express.json())
app.use(cors())

const feedbackRateLimit = rateLimit({
	windowMs: 5 * 60 * 1000,
	max: 10,
	standardHeaders: 'draft-7',
	legacyHeaders: true,
})

app.get('/', (req, res) => {
	res.send('insert webserver here')
})

app.post('/wh/updateDocsJson', async (req, res) => {
	const validate = validateJsonWebhook(req)
	if (!validate) {
		res.status(403).send({
			success: false,
			error: 'Invalid token'
		})
		return
	}
	if (req.body.action !== 'released') {
		res.send({
			success: true,
			error: 'Token valid, but ignoring action...'
		})
		// this line fixed the entire instability of automata
		return;
	}
	const cmd = execa('bash', ['scripts/updateDocsJson.sh', process.env.GHTOKEN!, process.env.EMAIL!], { shell: true })
	cmd.stdout!.on('data', (data) => console.log(JSON.stringify(data.toString())))
	cmd.stderr!.on('data', (data) => console.log(JSON.stringify(data.toString())))
	res.send({
		success: true,
		message: "command is running"
	})
})

app.post('/tutorial/feedback', feedbackRateLimit, async (req, res) => {
	const body = JSON.parse(JSON.stringify(req.body)) as FeedbackRequestBody
	// validation of request body
	if (
		typeof body.turnstileToken !== "string" ||
		// type of string should be "up" or "down" but it's checked later
		typeof body.feedback !== "string" ||
		typeof body.route !== "string"
  	)
    return res
		.status(400)
		.send({
			successful: false,
			error: "You have something missing in your request!",
		});
	if (body.feedback !== "up" && body.feedback !== "down")
		return res
			.status(400)
			.send({
				successful: false,
				error: "Feedback must be either 'up' or 'down'!",
			});
	if (!body.route.startsWith('/docs/tutorial'))
		return res
			.status(400)
			.send({
				successful: false,
				error: "Are you sure you didn't modify this request?",
			});

	// part where turnstile token gets validated
	const turnstileFormData = new URLSearchParams()
	turnstileFormData.append('response', body.turnstileToken)
	turnstileFormData.append('secret', process.env.TURNSTILE_SECRET!)
	const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
		method: 'POST',
		body: turnstileFormData
	}).then(res => res.json())
	if (!turnstileResponse.success)
		return res
			.status(403)
			.send({
				successful: false,
				error: "Turnstile verificaion not successful",
			});
	
	// deletion and changes to the body to then make it easier to use the spread operator
	delete body.turnstileToken
	body.route = body.route.replace('/docs/tutorial', '')

	// actual database recording
	const data: FeedbackRecord = { ...body }
	await pb.collection('feedback').create(data)
	res.send({
		successful: true,
		message: "Feedback recorded!",
	});

	// webhook
	const webhook = new Webhook(new URL(process.env.DEV_WEBHOOK!), 'Guide Feedback (by automata)', 'https://avatars.githubusercontent.com/u/129876409?v=4')
	const upvoteCount = (await pb.collection('feedback').getFullList({ filter: `feedback = 'up' && route = '${body.route}'` })).length
	const downvoteCount = (await pb.collection('feedback').getFullList({ filter: `feedback = 'down' && route = '${body.route}'` })).length
	webhook.send(`Feedback recorded for ${body.route}!`, [{
		color: body.feedback === 'up' ? 0x00ff00 : 0xff0000,
		description: body.inputText ? codeBlock(body.inputText) : undefined,
		fields: [
			{ name: 'Ratio', value: `${(upvoteCount / (upvoteCount + downvoteCount) * 100).toFixed(2)}%`, inline: true },
			{ name: 'Upvotes', value: upvoteCount.toString(), inline: true },
			{ name: 'Downvotes', value: downvoteCount.toString(), inline: true },
		]
	}])
})

for (const script of babashkaScripts) {
	switch (script.method) {
		case 'GET':
			app.get(script.route, async (req, res) => {
				const command = await execa('bb', [`babashka/${script.file}`])
				res.send({
					success: command.exitCode === 0 ? true : false,
					cmdoutput: command.stdout
				})
			})
			break;
		case 'POST':
			app.post(script.route, async (req, res) => {
				const command = await execa('bb', [`babashka/${script.file}`])
				res.send({
					success: command.exitCode === 0 ? true : false,
					cmdoutput: command.stdout
				})
			})
			break;
	}
	console.log(`Babashka script ${script.file} was registered successfully in ${script.method} ${script.route}`)
}

app.listen(process.env.PORT, () => console.log('Listening!'))
