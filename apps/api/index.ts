import express from 'express';
import 'dotenv/config';
import { execa } from 'execa';
import validateJsonWebhook from './plugins/validateJsonWebhook.js';
import { FeedbackRequestBody, FeedbackRequestBodySchema, Logs } from './util/types.js';
import cors from 'cors'
import rateLimit from 'express-rate-limit';
import { Webhook } from 'simple-discord-webhooks';
import { codeBlock } from './util/discordCodeBlock.js';
import db, { schema } from 'database/dist/index.js';
import jobs, { LogGroup } from './jobs.js';
import expressWs from 'express-ws';
import resolvePlugins from './util/resolvePlugins.js';
import { PassThrough } from 'node:stream';

const devMode = process.argv[2] === '--dev';
if (devMode) console.log('You\'re a developer 😎 (sorry for that emoji jumpscare)')
const cwd = process.cwd()

const { app } = expressWs(express())
app.use(express.json())
app.use(cors())

const feedbackRateLimit = rateLimit({
	windowMs: 5 * 60 * 1000,
	max: 10,
	standardHeaders: 'draft-7',
	legacyHeaders: true,
})

app.get('/', (req, res) => {
	res.send('hi this is the api what did you even expect')
})

for (const job of jobs) {
	const jobLogs: Logs[] = []
	switch (job.method) {
		case "POST":
			app.post(job.route, async (req, res) => {
				await expressCode(req, res);
			});
			break;
		case "GET":
			app.get(job.route, async (req, res) => {
				await expressCode(req, res);
			});
			break;
	}
	const expressCode = async (req: express.Request, res: express.Response) => {
		if (resolvePlugins(job.plugins, req, res).includes(false))
			// Believe it or not, the code 418 I'm a teapot is the most appropiate one IMO.
			// https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/418
			return res.status(418).send({ success: false, message: "Plugins didn't pass" });
		res.send({ success: true, message: "Command is running" });

		const stream_stdout = new PassThrough();
		const stream_stderr = new PassThrough();
		const parse_payload = (level: 'info' | 'error', payload: any) => ({
			timestamp: new Date(),
			message: String(payload),
			level	
		})
		stream_stdout.on('data', (chunk) => {
			jobLogs.push(parse_payload('info', chunk))
		});
		stream_stderr.on('data', chunk => {
			jobLogs.push(parse_payload('error', chunk))
		})
		
		for (const steps of job.steps) {
			console.log(`Running step ${steps.name}`);
			const cmd = execa(
					"bash",
					[`${cwd}/scripts/${job.stepsMainDir}/${steps.script}`],
					{
						cwd: steps.cwd,
						shell: true,
						env: { NT_ARGS: JSON.stringify(job.cmdArgs) },
					},
				)
				cmd?.pipeStdout?.(stream_stdout)
				cmd?.pipeStderr?.(stream_stderr)
				
				const exitCode = await new Promise((resolve) => {
					cmd.once("exit", (code) => {
						if (code !== 0) {
							console.log(
								`Step ${steps.name} failed with code ${code}`,
							);
						} else {
							console.log(`Step ${steps.name} finished successfully`);
						}
						resolve(code);
					});
				});
				if (exitCode !== 0) {			
					db.insert(schema.stepLogs).values({
						pkey: crypto.randomUUID(),
						id: steps.id.toString(),
						logs: jobLogs,
						// i gtg but we need to register the job run first
						// tysm seren for helping me <3 
						// np
					})
				}
				
			}

			// const cmd = execa(
			// 	"bash",
			// 	[`${cwd}/scripts/${job.stepsMainDir}/${steps.script}`],
			// 	{
			// 		cwd: steps.cwd,
			// 		shell: true,
			// 		env: { NT_ARGS: JSON.stringify(job.cmdArgs) },
			// 	},
			// );
	}
};

app.ws('/ws/jobs/logs/:id', (ws, req) => {
	const id = req.params.id
	if (!id) {
		ws.send(JSON.stringify({ success: false, error: 'No id provided' }))
		return ws.close()
	}
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
	const body = req.body as FeedbackRequestBody
	// validation of request body
	try {
		FeedbackRequestBodySchema.parse(body)
	} catch {
		return res
			.status(400)
			.send({
				successful: false,
				error: "You have something missing in your request!",
			});
	}
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
	turnstileFormData.append('secret', process.env.TURNSTILE_SECRET_DEV!)
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

	// actual database recording
	const trimmedRoute = body.route.replace('/docs/tutorial', '')
	const data = {
		id: crypto.randomUUID(),
		feedback: body.feedback,
		route: trimmedRoute,
		inputText: body.inputText,
	}
	await db.insert(schema.guideFeedback).values(data).execute()
	res.send({
		successful: true,
		message: "Feedback recorded!",
	});

	// webhook
	const webhook = new Webhook(new URL(process.env.DEV_WEBHOOK!), 'Guide Feedback (by automata)', 'https://avatars.githubusercontent.com/u/129876409?v=4')
	// const upvoteCount = (await pb.collection('feedback').getFullList({ filter: `feedback = 'up' && route = '${body.route}'` })).length
	// const downvoteCount = (await pb.collection('feedback').getFullList({ filter: `feedback = 'down' && route = '${body.route}'` })).length
	const upvoteCount = (await (db.query.guideFeedback!.findMany({
		where: (guideFeedback, { eq, and }) => and(
			eq(guideFeedback.feedback, 'up'),
			eq(guideFeedback.route, trimmedRoute)
		),
	})).execute()).length
	const downvoteCount = (await (db.query.guideFeedback!.findMany({
		where: (guideFeedback, { eq, and }) => and(
			eq(guideFeedback.feedback, 'down'),
			eq(guideFeedback.route, trimmedRoute)
		),
	})).execute()).length
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

app.get('/ping', (req, res) => {
	res.send('Pong')
})

const port = 4000
app.listen(port, '::', () => {
	console.log(`Server listening on [::]${port}`)
})
