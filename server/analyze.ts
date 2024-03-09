import { Request, Response } from 'express'
import { OpenAI } from 'openai';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const getCommits = async (owner: string, repo: string): Promise<any> => { // get all repo's commit
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100&page=1`;
    try {
        const res = await axios.get(apiUrl, {
            headers: {
                Authorization: `Bearer ${process.env.GITHUB_API_KEY}`
            }
        });
        console.log("res.data:" + JSON.stringify(res.data));
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
                Authorization: `Bearer ${process.env.GITHUB_API_KEY}`
            }
        });
        const files = res.data.files;
        const diffs = files.map((file: any) => file.patch).join('\n');
        // console.log("diffs:" + diffs)
        return diffs;
    } catch (error: any) {
        if (error.response) {
            return `${error.response.status}, ${error.response.data}`;
        } else {
            return `${error.type}, ${error.message}`;
        };

    }
}

export const analyzeCommitMsg = async (commitMessage: string, commitDiff: string): Promise<any> => { // analyze commit msg and diff to determine if it's good or bad
    const prompt = `以下のコミット文と変更内容を分析し、コミット文が変更内容に対して適切かどうかを判定してください。0か1のみで答えてください。理由はいらないです。
    \n\nコミット文: ${commitMessage}\n\n変更内容:\n${commitDiff}
    `;
    console.log("prompt:" + prompt);
    try {
        const res: any = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
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
            return `${error.response.status}, ${error.response.data}`;
        } else {
            return `${error.type}, ${error.message}`;
        };
    }
}

export const getBadCommitsNum = async (req: Request, res: Response) => { // use thorse 3 functions to get bad commit number
    const owner = req.params.owner;
    const repo = req.params.repo;

    try {
        const commits: any = await getCommits(owner, repo);
        let badCommitNum = 0;
        const badCommitsDetail: any[] = [];

        for (const commit of commits) {
            const sha = commit.sha;
            const commitMessage = commit.commit.message;
            const commitDiff = await getCommitDiff(owner, repo, sha);

            const analyzeResult = await analyzeCommitMsg(commitMessage, commitDiff);
            console.log("analyzeResult:" + Number(analyzeResult));
            if (Number(analyzeResult) == 0) { // todo: fix: NaN problem
                badCommitNum++;
                badCommitsDetail.push(commit);
            }
        }
        res.json({ total: commits.length, badCommitNum, commitDetail: badCommitsDetail });
    } catch (error: any) {
        if (error.response) {
            return `${error.response.status}, ${error.response.data}`;
        } else {
            return `${error.type}, ${error.message}`;
        };
    }
}