import React, { useState } from 'react';
import axios, { AxiosResponse } from 'axios';

import SetKey from './components/SetKey';
import SearchBar from './components/SearchBar';
import Loading from './components/Loading';
import Result from './components/Result';
import ChangeModel from './components/ChangeModel';

type Response = {
  total: number;
  badCommitNum: number;
  URL: string[];
  commitDetail: any[];
};

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>(localStorage.getItem('apikey') || '');
  const [scanLoading, setScanLoading] = useState(false);
  const [apiSetLoading, setApiSetLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [model, setModel] = useState('gpt-3.5-turbo');

  /*
  
  console.log("model: " + model)
  console.log("result: " + result)
  console.log("apiKey: " + apiKey)

  */

  const handleSearch = async (owner: string, repo: string) => {
    setScanLoading(true);
    try {
      const response: AxiosResponse = await axios.get(
        `${import.meta.env.VITE_APP_SERVER_URL}/${owner}/${repo}`, {
        params: {
          model: model,
          key: localStorage.getItem('apikey') || apiKey
        }
      });
      const data: Response = await response.data;
      setResult(data);
      setShowModal(true);
    } catch (error: any) {
      alert(error.response.data.error);
      console.error('Error:', error);
    }
    setScanLoading(false)
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setResult(null);
  }

  const handleSaveApiKeys = async () => {
    setApiSetLoading(true);
    try {
      if (apiKey === '') throw new Error('API key cannot be empty');
      localStorage.setItem('apikey', apiKey);
      alert('API keys saved successfully');
      setApiKey('');
    } catch (error: any) {
      alert(error.message);
      console.error('Error:', error);
    }
    setApiSetLoading(false);
  }

  return (
    <div className="container mx-auto p-4">
      {apiSetLoading ? <Loading css="top-4" text="updating api key's" /> : <SetKey apiKey={apiKey} setApiKey={setApiKey} onSave={handleSaveApiKeys} />}
      <ChangeModel model={model} setModel={setModel} />
      {scanLoading ? null : <SearchBar onSearch={handleSearch} />}
      {scanLoading ? <Loading css="left-[42%]" text="Scanning for bad commit messages..." /> : showModal && <Result result={result} onClose={handleCloseModal} />}
    </div>
  );
}
export default App;