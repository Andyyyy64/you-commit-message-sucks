import React from 'react';

type result = {
    total: number;
    badCommitNum: number;
    URL: string[];
    commitDetail: any[];
};


type Props = {
    result: result;
    onClose: () => void;
}

const Result: React.FC<Props> = ({ result, onClose }) => {
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3 text-center text-black">
                    <h2 className="text-xl font-bold mb-2">Scan Results</h2>
                    <p>Total Commits: {result.total}</p>
                    <p>Bad Commit Messages: {result.badCommitNum}</p>
                    <ul className="list-disc pl-6 text-left">
                        {result.commitDetail.map((item: any, index: number) => (
                            <li key={index}>
                                <a href={item.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                                    {item.commit.message}
                                </a>
                            </li>
                        ))}
                    </ul>
                    <div className="items-center px-4 py-3">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Result;