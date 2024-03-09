import { Request, Response } from 'express'
import { OpenAI } from 'openai';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const getCommits = async (owner: string, repo: string): Promise<any> => {
    // This function will get the commits from the GitHub API
    // and return them as a string
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

const getCommitDiff = async (owner: string, repo: string, sha: string): Promise<string> => {
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

export const analyzeCommitMsg = async (commitMessage: string, commitDiff: string): Promise<any> => {
    const prompt = `以下のコミット文と変更内容を分析し、コミット文が変更内容に対して適切かどうかを判定してください。0か1で答えてください。理由はいらないです。
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

export const getBadCommitsNum = async (req: Request, res: Response) => {
    console.log("started");
    const owner = req.params.owner;
    const repo = req.params.repo;

    try {
        const commits: any = await getCommits(owner, repo);
        let badCommitNum = 0;
        const commitsUrls: string[] = [];

        for (const commit of commits) {
            const sha = commit.sha;
            const commitMessage = commit.commit.message;
            const commitDiff = await getCommitDiff(owner, repo, sha);

            const analyzeResult = await analyzeCommitMsg(commitMessage, commitDiff);
            console.log("analyzeResult:" + Number(analyzeResult));
            if (Number(analyzeResult) == 0) {
                badCommitNum++;
                commitsUrls.push(commit.html_url);
            }
        }
        res.json({ total: commits.length, badCommitNum, URL: commitsUrls });
    } catch (error: any) {
        if (error.response) {
            return `${error.response.status}, ${error.response.data}`;
        } else {
            return `${error.type}, ${error.message}`;
        };
    }
}