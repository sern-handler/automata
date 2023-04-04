import express from 'express';
import 'dotenv/config';
const app = express();
app.get('/', (req, res) => {
    res.send('Hey! This is sern automata\'s Rest API/webhook server/control server!');
});
app.get('/wh/newRelease', (req, res) => {
});
app.listen(3000, () => console.log('Listening!'));
