import React from 'react';

type Props = {
    model: string;
    setModel: (model: string) => void;
}

const ChangeModel: React.FC<Props> = ({ model, setModel }) => {
    return (
        <div className="mb-4 absolute top-4 right-4">
            <h2 className="text-xl font-bold mb-2">Change GPT Model</h2>
            <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="border border-gray-300 rounded p-2"
            >
                <option value="gpt-3.5-turbo">GPT-3.5-turbo</option>
                <option value="gpt-4">GPT-4</option>
            </select>
        </div>
    );
};

export default ChangeModel;