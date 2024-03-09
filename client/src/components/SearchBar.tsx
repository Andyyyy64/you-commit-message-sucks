import React, { useState } from 'react';

type Props = {
    onSearch: (owner: string, repo: string) => void;
}

const SearchBar: React.FC<Props> = ({ onSearch }) => {
    const [url, setUrl] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const owner = url.split('/')[3];
        const repo = url.split('/')[4];
        onSearch(owner, repo);
    };

    return (
        <form onSubmit={handleSubmit} className="mb-4 absolute left-[42%]">
            <input
                type="text"
                placeholder="Enter GitHub repository URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="border border-gray-300 rounded p-2 mr-2 w-64"
            />
            <button type="submit" className="bg-blue-500 text-white rounded p-2">
                Scan
            </button>
        </form>
    );
};

export default SearchBar;