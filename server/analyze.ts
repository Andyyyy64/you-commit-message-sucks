import { Request, Response } from 'express'
import { OpenAI } from 'openai';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();



const githubApiKey = process.env.GITHUB_API_KEY || '';

const getCommits = async (owner: string, repo: string): Promise<any> => { // get all repo's commit
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100&page=1`;
    try {
        const res = await axios.get(apiUrl, {
            headers: {
                Authorization: `Bearer ${githubApiKey}`
            }
        });
        return res.data;
    } catch (error: any) {
        if (error.response) {
            return `${error.response.status}, ${error.response.data}`;
        } else {
            return `${error.type}, ${error.message}`;
        };

    }
}

const getCommitDiff = async (owner: string, repo: string, sha: string): Promise<string> => { // get commit's diff
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`;
    try {
        const res = await axios.get(apiUrl, {
            headers: {
                Authorization: `Bearer ${githubApiKey}`
            }
        });
        const files = res.data.files;
        let diffs = files.map((file: any) => file.patch).join('\n');
        
        if(diffs.length > 16000) {
            diffs = diffs.substring(0, 16000) + "\n....";
        }
        
        return diffs;
    } catch (error: any) {
        if (error.response) {
            return `${error.response.status}, ${error.response.data}`;
        } else {
            return `${error.type}, ${error.message}`;
        };

    }
}

export const analyzeCommitMsg = async (commitMessage: string, commitDiff: string, model: string, key: string): Promise<any> => { // analyze commit msg and diff to determine if it's good or bad

    const openai = new OpenAI({
        apiKey: key,
    });

    const prompt = `以下のコミット文と変更内容を分析し、コミット文が変更内容に対して適切かどうかを判定してください。0か1のみで答えてください。理由はいらないです。
    \n\nコミット文: ${commitMessage}\n\n変更内容:\n${commitDiff}
    `;
    console.log("prompt:" + prompt);
    try {
        const res: any = await openai.chat.completions.create({
            model: model,
            messages: [
                {
                    role: 'system',
                    content: prompt
                }
            ]
        });
        return res.choices[0].message.content;
    } catch (error: any) {
        if (error.response) {
            if (error.response.status === 401 && error.response.data.error.type === 'invalid_request_error') {
                throw new Error('Invalid OpenAI API key');
            } else if (error.response.status === 400 && error.response.data.error.code === 'context_length_exceeded') {
                return -1;
            } else {
                throw error;
            }
        } else {
            throw error;
        }
    }
}

export const getBadCommitsNum = async (req: Request, res: Response) => { // use thorse 3 functions to get bad commit number
    const owner = req.params.owner;
    const repo = req.params.repo;
    const model = req.query.model || 'gpt-3.5-turbo';
    const key = req.query.key;

    try {
        const commits: any = await getCommits(owner, repo);
        let badCommitNum = 0;
        const commitsUrl: string[] = [];
        const badCommitsDetail: any[] = [];

        for (const commit of commits) {
            const sha = commit.sha;
            const commitMessage = commit.commit.message;
            const commitDiff = await getCommitDiff(owner, repo, sha);
            try {
                const analyzeResult = await analyzeCommitMsg(commitMessage, commitDiff, String(model), String(key));

                console.log("analyzeResult:" + analyzeResult);

                if (Number(analyzeResult) == 0) { // todo: fix: NaN problem
                    badCommitNum++;
                    badCommitsDetail.push(commit);
                    commitsUrl.push(commit.html_url);
                }
                if (Number(analyzeResult) === -1) {
                    continue;
                }
            } catch (error: any) {
                return res.status(400).json({ error: error.message });
            }
        }
        res.json({ total: commits.length, badCommitNum, URL: commitsUrl, commitDetail: badCommitsDetail });
    } catch (error: any) {
        if (error.response) {
            return `${error.response.status}, ${error.response.data}`;
        } else {
            return `${error.type}, ${error.message}`;
        };
    }
}

