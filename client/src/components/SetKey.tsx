import React, { useState } from 'react';

type Props = {
    apiKey: string
    setApiKey: (apiKey: string) => void;
    onSave: () => void;
}

const SetKey: React.FC<Props> = ({ apiKey, setApiKey, onSave }) => {
    const [open, setOpen] = useState<boolean>(false);

    const handleOpen = () => {
        setOpen(!open);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setApiKey(e.target.value);
    };

    const handleOnSave = () => {
        onSave();
        setOpen(false);
    }

    return (
        <div className="mb-4 absolute top-4">
            <button className={`${open ? "hidden" : ""}`} onClick={handleOpen}>SET API KEY</button>
            {
                open && (
                    <>
                        <input
                            type="text"
                            name="openai"
                            placeholder="OpenAI API Key"
                            value={apiKey}
                            onChange={handleChange}
                            className="border border-gray-300 rounded p-2 mr-2"
                        />
                        <button onClick={handleOnSave} className="bg-blue-500 text-white rounded p-2 ml-2">
                            Save
                        </button>
                    </>
                )
            }

        </div>
    );
};

export default SetKey;