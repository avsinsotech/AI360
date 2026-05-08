import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import './CustomSelect.css';

const CustomSelect = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = 'Select...', 
  searchable = false,
  className = '',
  disabled = false,
  icon: Icon
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  const selectedOption = options.find(o => String(o.value) === String(value));

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(o => 
    String(o.label).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = () => {
    if (!disabled) setIsOpen(!isOpen);
  };

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`custom-select-container ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''} ${className}`} ref={containerRef}>
      <div className="custom-select-trigger" onClick={handleToggle} tabIndex="0">
        <div className="trigger-left">
          {Icon && <Icon size={16} className="trigger-icon" />}
          <span className={!selectedOption ? 'placeholder' : ''}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown size={16} className={`arrow ${isOpen ? 'up' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="custom-select-dropdown">
          {searchable && (
            <div className="custom-select-search">
              <Search size={14} />
              <input 
                autoFocus
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search..."
                onClick={e => e.stopPropagation()}
              />
            </div>
          )}
          <div className="custom-select-options">
            {filteredOptions.length === 0 ? (
              <div className="custom-select-no-results">No results found</div>
            ) : (
              filteredOptions.map(opt => (
                <div 
                  key={opt.value} 
                  className={`custom-select-option ${String(opt.value) === String(value) ? 'selected' : ''}`}
                  onClick={() => handleSelect(opt.value)}
                >
                  <span className="option-label">{opt.label}</span>
                  {String(opt.value) === String(value) && <Check size={14} className="check-icon" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
