import React, { useState, useRef, useEffect } from 'react';

function SearchBar({ onSearch, recentSearches, loading }) {
    const [query, setQuery] = useState('');
    const [showRecent, setShowRecent] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowRecent(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
            setShowRecent(false);
        }
    };

    const handleRecentClick = (city) => {
        setQuery(city);
        onSearch(city);
        setShowRecent(false);
    };

    return (
        <div className="search-wrapper" ref={wrapperRef}>
            <form className="search-bar" onSubmit={handleSubmit}>
                <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => recentSearches.length > 0 && setShowRecent(true)}
                    placeholder="Search city..."
                    disabled={loading}
                />
                <button type="submit" disabled={loading || !query.trim()}>
                    {loading ? (
                        <span className="btn-loader"></span>
                    ) : (
                        'Go'
                    )}
                </button>
            </form>
            {showRecent && recentSearches.length > 0 && (
                <ul className="recent-list">
                    <li className="recent-header">Recent</li>
                    {recentSearches.map((city, i) => (
                        <li key={i} onClick={() => handleRecentClick(city)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            {city}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default SearchBar;
