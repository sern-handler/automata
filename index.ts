import express from 'express';
import bodyParser from 'body-parser';
import 'dotenv/config';
import { execa } from 'execa';
import { validateJsonWebhook } from './util/validateJsonWebhook.js';

const app = express()
app.use(bodyParser.json())

app.get('/', (req, res) => {
	res.contentType('html')
	res.send('Hey! This is sern automata\'s Rest API/webhook server/control server!<br><h1>Why isn\'t this on sern.dev?</h1><br>Well, Cloudflare Tunnels only works on domains that you have registered in your Cloudflare account. I don\'t have control of the domain so I just use srizan.dev instead!<br><h1>docs?</h1><br>nah, too lazy')
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
	}
	const command = await execa('bash', ['scripts/updateDocsJson.sh', process.env.GHTOKEN!], { shell: true })
	res.send({
		success: command.exitCode === 0 ? true : false,
		cmdoutput: command.stdout
	})
})

app.listen(3000, () => console.log('Listening!'))