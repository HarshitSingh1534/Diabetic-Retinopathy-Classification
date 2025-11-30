const { useState, useEffect } = React;

function App() {
    const [stage, setStage] = useState('initial');
    const [results, setResults] = useState(null);
    const [view, setView] = useState('cards');

    const handleGetStarted = () => {
        setStage('upload');
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            setResults(data);
            setStage('results');
        } catch (error) {
            console.error('Upload failed:', error);
        }
    };

    const teamMembers = [
        { name: 'Sougata Roy', role: '25MCSA05', description: 'Student' },
        { name: 'Krishna Mohanty', role: '25MCSA06', description: 'Student' },
        { name: 'Harshit Singh', role: '25MCSA07', description: 'Student' },
        { name: 'Souvik Sarkar', role: '25MCSA09', description: 'Student' }
    ];

    return (
        <>
            <header className="header">
                <h1>Diabetic Retinopathy Classification System</h1>
                <div className="header-nav">
                    <button onClick={() => setStage('initial')}>Home</button>
                    <button onClick={() => setStage('about')}>About</button>
                </div>
            </header>
            <div className="container">
                <p className="subtitle">Advanced AI-powered analysis for early detection of diabetic retinopathy using state-of-the-art machine learning models.</p>
                <div className="features">
                    <div className="feature">
                        <div className="feature-icon">🖼️</div>
                        <h3>One Image Analysis</h3>
                        <p>Upload a single retinal image for instant AI-powered classification.</p>
                    </div>
                    <div className="feature">
                        <div className="feature-icon">📦</div>
                        <h3>Batch Processing</h3>
                        <p>Process multiple images simultaneously for efficient bulk analysis.</p>
                    </div>
                    <div className="feature">
                        <div className="feature-icon">🤖</div>
                        <h3>AI Model Analysis</h3>
                        <p>Leverage advanced machine learning models for accurate diabetic retinopathy detection.</p>
                    </div>
                </div>
                {stage === 'initial' && (
                    <button className="get-started-btn" onClick={handleGetStarted}>
                        Get Started
                    </button>
                )}
                {stage === 'upload' && (
                    <div className="upload-section show">
                        <input
                            type="file"
                            accept="image/*,.zip"
                            onChange={handleFileUpload}
                            className="file-input"
                        />
                        <p>Upload an image or a ZIP file containing multiple images</p>
                    </div>
                )}
                {stage === 'results' && results && (
                    <div className="results-section show">
                        <div className="view-toggle">
                            <button
                                className={view === 'cards' ? 'active' : ''}
                                onClick={() => setView('cards')}
                            >
                                Cards View
                            </button>
                            <button
                                className={view === 'table' ? 'active' : ''}
                                onClick={() => setView('table')}
                            >
                                Table View
                            </button>
                        </div>
                        {results.mode === 'single' && (
                            <div>
                                <img
                                    src={`/static/uploads/${results.image_file}`}
                                    alt="Uploaded"
                                    className="uploaded-image"
                                />
                            </div>
                        )}
                        {results.mode === 'folder' && (
                            <p>Batch processed {results.total_images} images</p>
                        )}
                        <div className={`results-grid ${view === 'cards' ? 'show' : ''}`}>
                            {Object.entries(results.mode === 'single' ? results.results : results.avg_times).map(([model, data]) => (
                                <div key={model} className="model-card">
                                    <div className="model-name">{model}</div>
                                    {results.mode === 'single' ? (
                                        <>
                                            <div className="prediction-badge">Prediction: {data.prediction}</div>
                                            <div className="model-stat">
                                                <span className="stat-label">Inference Time:</span>
                                                <span className="stat-value">{data.inference_time}s</span>
                                            </div>
                                            <div className="model-stat">
                                                <span className="stat-label">Parameters:</span>
                                                <span className="stat-value">{data.params.toLocaleString()}</span>
                                            </div>
                                            <div className="model-stat">
                                                <span className="stat-label">Accuracy:</span>
                                                <span className="stat-value">{data.accuracy}%</span>
                                            </div>
                                            <div className="model-stat">
                                                <span className="stat-label">Train Time:</span>
                                                <span className="stat-value">{data.train_time}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="model-stat">
                                                <span className="stat-label">Avg Inference Time:</span>
                                                <span className="stat-value">{data}s</span>
                                            </div>
                                            <div className="model-stat">
                                                <span className="stat-label">Accuracy:</span>
                                                <span className="stat-value">{results.model_info[model].accuracy}%</span>
                                            </div>
                                            <div className="model-stat">
                                                <span className="stat-label">Train Time:</span>
                                                <span className="stat-value">{results.model_info[model].train_time}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className={`table-view ${view === 'table' ? 'show' : ''}`}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Model</th>
                                        {results.mode === 'single' ? (
                                            <>
                                                <th>Prediction</th>
                                                <th>Inference Time (s)</th>
                                                <th>Parameters</th>
                                                <th>Accuracy (%)</th>
                                                <th>Train Time</th>
                                            </>
                                        ) : (
                                            <>
                                                <th>Avg Inference Time (s)</th>
                                                <th>Accuracy (%)</th>
                                                <th>Train Time</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(results.mode === 'single' ? results.results : results.avg_times).map(([model, data]) => (
                                        <tr key={model}>
                                            <td>{model}</td>
                                            {results.mode === 'single' ? (
                                                <>
                                                    <td>{data.prediction}</td>
                                                    <td>{data.inference_time}</td>
                                                    <td>{data.params.toLocaleString()}</td>
                                                    <td>{data.accuracy}</td>
                                                    <td>{data.train_time}</td>
                                                </>
                                            ) : (
                                                <>
                                                    <td>{data}</td>
                                                    <td>{results.model_info[model].accuracy}</td>
                                                    <td>{results.model_info[model].train_time}</td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className={`chart-view ${view === 'chart' ? 'show' : ''}`}>
                            <p>Chart view coming soon...</p>
                        </div>
                    </div>
                )}
                {stage === 'about' && (
                    <div className="about-section show">
                        <h2>Meet Our Team</h2>
                        <div className="team-grid">
                            {teamMembers.map((member, index) => (
                                <div key={index} className="team-member">
                                    <img src="https://via.placeholder.com/100x100?text=Avatar" alt={member.name} />
                                    <h3>{member.name}</h3>
                                    <p><strong>{member.role}</strong></p>
                                    <p>{member.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <footer className="footer">
                <p>Sougata Roy | Krishna Mohanty | Harshit Singh | Souvik Sarkar</p>
            </footer>
        </>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
