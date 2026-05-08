import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2, User, FileText, CreditCard, Briefcase, BadgeCheck, FileBarChart, Zap, ArrowLeft } from 'lucide-react';
import { globalSearch } from '../../services/searchService';
import './HeaderSearch.css';

const HeaderSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const searchRef = useRef(null);
  const navigate = useRef(useNavigate()).current;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        const data = await globalSearch(query);
        setResults(data);
        setIsOpen(true);
        setLoading(false);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleResultClick = (link) => {
    navigate(link);
    setIsOpen(false);
    setIsExpanded(false);
    setQuery('');
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Aadhaar': return <BadgeCheck size={16} className="res-icon aadhar" />;
      case 'PAN': return <CreditCard size={16} className="res-icon pan" />;
      case 'Udyam': return <Briefcase size={16} className="res-icon udyam" />;
      case 'GST': return <Zap size={16} className="res-icon gst" />;
      case 'Membership': return <User size={16} className="res-icon membership" />;
      case 'Report': return <FileBarChart size={16} className="res-icon report" />;
      case 'Mandate': return <FileText size={16} className="res-icon mandate" />;
      default: return <Search size={16} />;
    }
  };

  return (
    <div className={`header-search-container ${isExpanded ? 'is-expanded' : ''}`} ref={searchRef}>
      {/* Universal Search Trigger (SVG Icon) */}
      {!isExpanded && (
        <button 
          className="search-trigger"
          onClick={() => setIsExpanded(true)}
        >
          <Search size={20} />
        </button>
      )}

      <div className={`search-input-wrapper ${isOpen ? 'active' : ''} ${isExpanded ? 'show-input' : ''}`}>
        {/* Back/Close button */}
        {isExpanded && (
          <button className="search-collapse-btn" onClick={() => setIsExpanded(false)}>
            <ArrowLeft size={18} />
          </button>
        )}
        
        <Search className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Global Search (Name, ID...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          autoFocus={isExpanded}
        />
        {loading ? (
          <Loader2 className="loader-icon animate-spin" size={18} />
        ) : query && (
          <X className="clear-icon" size={18} onClick={() => setQuery('')} />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="search-results-dropdown">
          <div className="results-list">
            {results.map((res, index) => (
              <div 
                key={`${res.type}-${res.id}-${index}`} 
                className="search-result-item"
                onClick={() => handleResultClick(res.link)}
              >
                <div className="res-icon-box">
                  {getIcon(res.type)}
                </div>
                <div className="res-info">
                  <span className="res-title">{res.title}</span>
                  <span className="res-subtitle">{res.type} • {res.subtitle}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isOpen && results.length === 0 && !loading && query.length >= 2 && (
        <div className="search-results-dropdown no-results">
          No records found for "{query}"
        </div>
      )}
    </div>
  );
};

export default HeaderSearch;
