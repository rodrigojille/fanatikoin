import React, { useState } from 'react';

const FanContentSubmission: React.FC = () => {
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setContent('');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="font-bold text-lg mb-4">Share Your Fan Content</h2>
      {submitted && <div className="text-green-600 mb-2">Thank you for your submission!</div>}
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full border rounded p-2 mb-2"
          rows={4}
          placeholder="Share your thoughts, stories, or cheer for your team!"
          value={content}
          onChange={e => setContent(e.target.value)}
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Submit
        </button>
      </form>
    </div>
  );
};

export default FanContentSubmission;
