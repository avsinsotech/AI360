import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

// Import custom SVG icons
import iconPersonal from '../../assets/icon_personal_44x44.svg';
import iconBusiness from '../../assets/icon_business_44x44.svg';
import iconHome from '../../assets/icon_home_44x44.svg';
import iconVehicle from '../../assets/icon_vehicle_44x44.svg';
import iconGold from '../../assets/icon_gold_44x44.svg';
import iconEducation from '../../assets/icon_education_44x44.svg';
import iconAgriculture from '../../assets/icon_agriculture_44x44.svg';
import iconMicrofinance from '../../assets/icon_microfinance_44x44.svg';
import iconProperty from '../../assets/icon_property_44x44.svg';
import iconDeposit from '../../assets/icon_deposit_44x44.svg';
import iconEmergency from '../../assets/icon_emergency_44x44.svg';
import iconOverdraft from '../../assets/icon_overdraft_44x44.svg';

import './LoanSelectionModal.css';

export default function LoanSelectionModal({ isOpen, onClose, selectedUser }) {
  const navigate = useNavigate();
  if (!isOpen) return null;

  const loanTypes = [
    { 
      id: 'personal', 
      label: 'Personal Loan', 
      marathi: 'व्यक्तिगत कर्ज',
      icon: iconPersonal,
      route: '/personal-loan' 
    },
    { 
      id: 'business', 
      label: 'Business Loan', 
      marathi: 'व्यवसाय कर्ज',
      icon: iconBusiness,
      route: '/business-loan' 
    },
    { 
      id: 'home', 
      label: 'Home Loan', 
      marathi: 'गृह कर्ज',
      icon: iconHome,
      route: '/home-loan' 
    },
    { 
      id: 'vehicle', 
      label: 'Vehicle Loan', 
      marathi: 'वाहन कर्ज',
      icon: iconVehicle,
      route: '/vehicle-loan' 
    },
    { 
      id: 'gold', 
      label: 'Gold Loan', 
      marathi: 'सोने कर्ज',
      icon: iconGold,
      route: '/gold-loan' 
    },
    { 
      id: 'education', 
      label: 'Education Loan', 
      marathi: 'शिक्षण कर्ज',
      icon: iconEducation,
      route: '/education-loan' 
    },
    { 
      id: 'agriculture', 
      label: 'Agriculture Loan', 
      marathi: 'कृषी कर्ज',
      icon: iconAgriculture,
      route: '/agriculture-loan' 
    },
    { 
      id: 'microfinance', 
      label: 'Microfinance', 
      marathi: 'सूक्ष्म कर्ज',
      icon: iconMicrofinance,
      route: '/microfinance' 
    },
    { 
      id: 'property', 
      label: 'Property Loan', 
      marathi: 'मालमत्ता कर्ज',
      icon: iconProperty,
      route: '/property-loan' 
    },
    { 
      id: 'fd', 
      label: 'FD / Deposit', 
      marathi: 'ठेव / FD',
      icon: iconDeposit,
      route: '/fd-loan' 
    },
    { 
      id: 'emergency', 
      label: 'Emergency Loan', 
      marathi: 'आप्तकालीन कर्ज',
      icon: iconEmergency,
      route: '/emergency-loan' 
    },
    { 
      id: 'od', 
      label: 'OD / Overdraft', 
      marathi: 'ओव्हरड्राफ्ट',
      icon: iconOverdraft,
      route: '/od-loan' 
    }
  ];

  const handleSelect = (type) => {
    navigate(type.route, { state: { aadharData: selectedUser } });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="loan-modal professional-modal animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <h2 className="modal-title">Select Loan Type</h2>
            <p className="modal-subtitle">Choose a category to start a new application</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="loan-grid-container">
          {loanTypes.map(type => (
            <div 
              key={type.id} 
              className="loan-grid-card" 
              onClick={() => handleSelect(type)}
            >
              <div className="loan-icon-image-wrapper">
                <img src={type.icon} alt={type.label} className="loan-type-icon" />
              </div>
              <div className="loan-content">
                <span className="loan-label-en">{type.label}</span>
                <span className="loan-label-mr">{type.marathi}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
