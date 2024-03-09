import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import { analyzeCommitMsg, getBadCommitsNum } from './analyze';

dotenv.config();

const app: express.Express = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/analyze/:owner/:repo', getBadCommitsNum);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})