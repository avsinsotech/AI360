import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  Plus, Trash2, Camera, Upload,
  ChevronLeft, Printer, Save, Coins,
  Image as ImageIcon, X, Loader2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import API_BASE_URL from '../../config';
import goldLoanService from '../../services/goldLoanService';
import './GoldLoanForm.css';

// ─── Constants & Options ───────────────────────────────────────────────────
const SCHEMES = [
  'GOLD BASIC', 'GOLD CLASSIC', 'GOLD DIAMOND OD',
  'GOLD PLATINUM', 'GOLD PURCHASE', 'GOLD SILVER'
];
const DEFAULT_PARTICULARS = [
  'Bangals', 'Chain Locket', 'Mangal Sutra', 'Haar', 'Necklace',
  'Chain', 'Studs', 'Ear chain', 'Studs with Zumake', 'Mala',
  'Locket', 'Handchain', 'Studs with chain', 'Ring', 'Gold Coin'
];
const BRANCHES = [
  '1-MAIN BRANCH', '2-KOTHRUD', '3-HADAPSAR', '4-BANER'
];
const FIXED_GOLD_RATE = 165000;

// ─── Helper Components ─────────────────────────────────────────────────────

function TI({ label, value, onChange, type = 'text', placeholder, className = '', highlight = false, required = false, ...props }) {
  return (
    <div className={`gl-field ${className}`}>
      {label && <label>{label}{required && <span style={{ color: '#ef4444' }}>*</span>}</label>}
      <input
        type={type}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={highlight ? 'calc-field' : ''}
        {...props}
      />
    </div>
  );
}

function Select({ label, value, onChange, options, className = '', required = false }) {
  return (
    <div className={`gl-field ${className}`}>
      {label && <label>{label}{required && <span style={{ color: '#ef4444' }}>*</span>}</label>}
      <select value={value || ''} onChange={e => onChange(e.target.value)}>
        <option value="">-- Select --</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function GoldLoanForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: paramId } = useParams();
  const effectiveId = paramId || location.state?.id;
  const { showToast } = useApp();
  const [lang, setLang] = useState('en'); // 'mr' or 'en'
  const L = (mr, en) => lang === 'mr' ? mr : en;
  const aadharAppliedRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentId, setCurrentId] = useState(effectiveId || null);

  // ── Camera State ──
  const [showCamera, setShowCamera] = useState(false);
  const [cameraTarget, setCameraTarget] = useState(null); // 'gold' or 'goldBag'
  const videoRef = useRef(null);
  const [activeStream, setActiveStream] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');

  // ── Form State ──
  const [basic, setBasic] = useState({
    customerName: '',
    scheme: 'GOLD BASIC',
    sanctionDate: new Date().toISOString().split('T')[0],
    goldBagNo: '',
    sbAcNo: '',
    branch: '1-MAIN BRANCH',
    sbName: '',
    balance: '',
    // Hidden Identity & Config fields mapped to backend
    aadhaarNo: '',
    mobileNo: '',
    address: '',
    panNo: '',
    age: '',
    valuerReceiptNo: '',
    tenure: '',
    repaymentDate: ''
  });

  const applyAadharData = (aadharData) => {
    // Robustly handle field naming variations (Aadhar records use both camelCase and PascalCase)
    const name = aadharData.fullName || aadharData.Name || aadharData.name || '';
    const rawAddress = aadharData.Address || aadharData.address || '';
    const photo = aadharData.CapturedPhoto || aadharData.capturedPhoto || aadharData.Photo || aadharData.photo || aadharData.profile_image || null;
    const dob = aadharData.dob || aadharData.Dob || aadharData.DOB || '';
    const aadharNo = aadharData.aadhaarNo || aadharData.AadhaarNo || aadharData.aadhar || aadharData.Aadhar || '';
    const phone = aadharData.Mobile || aadharData.mobile || aadharData.phone || '';

    // Handle address if it's an object (common from fresh verification)
    let formattedAddress = '';
    if (typeof rawAddress === 'object' && rawAddress !== null) {
      const parts = [
        rawAddress.house,
        rawAddress.street,
        rawAddress.landmark,
        rawAddress.locality || rawAddress.loc || rawAddress.vtc,
        rawAddress.district || rawAddress.dist,
        rawAddress.state,
        rawAddress.pincode || rawAddress.pc || rawAddress.zip
      ].filter(v => v && String(v).trim() !== '');
      formattedAddress = parts.join(', ');
    } else {
      formattedAddress = String(rawAddress || '');
    }

    // Calculate age from DOB
    let age = '';
    if (dob) {
      const parts = dob.split(/[\/\-]/);
      let birthDate = null;
      if (parts.length === 3) {
        if (parts[0].length === 4) { // YYYY-MM-DD
          birthDate = new Date(dob);
        } else { // DD-MM-YYYY or DD/MM/YYYY
          birthDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
      } else {
        birthDate = new Date(dob);
      }
      if (birthDate && !isNaN(birthDate.getTime())) {
        age = String(Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)));
      }
    }

    setBasic(prev => ({
      ...prev,
      customerName: name || prev.customerName,
      aadhaarNo: aadharNo || prev.aadhaarNo,
      address: formattedAddress || prev.address,
      age: age || prev.age,
      mobileNo: (phone && phone !== 'Linked' && phone !== 'Not Linked') ? phone : prev.mobileNo
    }));
    showToast('Details autofilled from Aadhaar', 'success');
    aadharAppliedRef.current = true;
  };

  useEffect(() => {
    if (location.state?.aadharData && !aadharAppliedRef.current) {
      const fetchFullAadharDetail = async (partialData) => {
        try {
          // If we already have address and photo, no need to fetch
          if ((partialData.Address || partialData.address) && (partialData.Photo || partialData.photo || partialData.CapturedPhoto || partialData.capturedPhoto)) {
            applyAadharData(partialData);
            return;
          }

          // If no ID, we can't fetch more
          if (!partialData.id && !partialData.Id) {
            applyAadharData(partialData);
            return;
          }

          const id = partialData.id || partialData.Id;
          const token = sessionStorage.getItem('tushgpt_jwt');
          const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
          const response = await fetch(`${baseUrl}/AadharProxy/history/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
            const fullData = await response.json();
            applyAadharData(fullData);
          } else {
            applyAadharData(partialData);
          }
        } catch (error) {
          console.error("Error fetching full Aadhar detail:", error);
          applyAadharData(partialData);
        }
      };

      fetchFullAadharDetail(location.state.aadharData);
    }
  }, [location.state, showToast]);

  // FETCH EXISTING LOAN DATA IF ID IS PASSED (FOR EDITING)
  useEffect(() => {
    const fetchExistingLoan = async (id) => {
      try {
        const existingData = await goldLoanService.getLoan(id);
        if (existingData) {
          // Map backend data to form state
          const b = existingData.basic || {};
          const ls = existingData.loanSummary || {};

          setBasic({
            customerName: b.customerName || '',
            scheme: b.scheme || 'GOLD BASIC',
            sanctionDate: b.sanctionDate ? b.sanctionDate.split('T')[0] : new Date().toISOString().split('T')[0],
            goldBagNo: b.goldBagNo || '',
            sbAcNo: b.sbAcNo || '',
            branch: b.branch || '1-MAIN BRANCH',
            sbName: b.sbName || '',
            balance: b.balance || '',
            aadhaarNo: b.aadhaarNo || '',
            mobileNo: b.mobileNo || '',
            address: b.address || '',
            panNo: b.panNo || '',
            age: b.age || '',
            valuerReceiptNo: b.valuerReceiptNo || '',
            tenure: b.tenure || '',
            repaymentDate: b.repaymentDate || ''
          });

          setLoanSummary({
            loanLimit: ls.loanLimit || '',
            loanSanction: ls.loanSanction || ''
          });

          if (existingData.ornaments && existingData.ornaments.length > 0) {
            setOrnaments(existingData.ornaments);
          }

          if (existingData.deductions && existingData.deductions.length > 0) {
            setDeductions(existingData.deductions);
          }

          if (existingData.goldImages) setGoldImages(existingData.goldImages);
          if (existingData.goldBagImages) setGoldBagImages(existingData.goldBagImages);

          setCurrentId(id);
        }
      } catch (error) {
        console.error("Error fetching existing gold loan:", error);
        showToast('Failed to load loan data', 'error');
      }
    };

    const editId = effectiveId;
    if (editId) {
      fetchExistingLoan(editId);
    }
  }, [location.state?.id, showToast]);

  // Attach camera stream to video element when modal opens
  useEffect(() => {
    if (showCamera && activeStream && videoRef.current) {
      videoRef.current.srcObject = activeStream;
    }
  }, [showCamera, activeStream]);

  // Fetch Master Deductions
  useEffect(() => {
    const fetchMasterDeductions = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/GoldDedMaster`, {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMasterDeductions(data);
          // Pre-populate deductions table with all master entries
          // Handle potential case-sensitivity issues from backend JSON
          if (data && data.length > 0) {
            const sanction = parseFloat(loanSummary.loanSanction) || 0;
            setDeductions(data.map((m, i) => {
              const name = (m.dedtype || m.DEDTYPE || 'Unknown').toLowerCase();
              const per = m.per || m.PER || 0;
              const charges = m.charges || m.CHARGES || 0;
              const isPercentBased = name.includes('service') || name.includes('valuer');

              let deduction = 0;
              if (isPercentBased) {
                deduction = Math.round((sanction * per) / 100);
              } else if (sanction > 0) {
                deduction = Math.round(charges);
              }

              return {
                id: i + 1,
                name: m.dedtype || m.DEDTYPE || 'Unknown',
                per,
                charges,
                deduction
              };
            }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch master deductions', err);
      }
    };
    fetchMasterDeductions();
  }, []);

  const [loanSummary, setLoanSummary] = useState({
    loanLimit: '',
    loanSanction: ''
  });

  // ── Ornament Table State ──
  const [ornaments, setOrnaments] = useState(
    Array(4).fill().map((_, i) => ({
      id: i + 1,
      particular: '',
      qty: '',
      grossWt: '',
      netWt: '',
      rate: '',
      price: 0,
      valuerPrice: 0
    }))
  );

  // ── Deduction Table State ──
  const [masterDeductions, setMasterDeductions] = useState([]);
  const [deductions, setDeductions] = useState(
    Array(5).fill().map((_, i) => ({
      id: i + 1,
      name: '',
      per: '',
      charges: '',
      deduction: 0
    }))
  );

  // ── Image State ──
  const [goldImages, setGoldImages] = useState([]);
  const [goldBagImages, setGoldBagImages] = useState([]);

  // ── Modal State for New Ornament ──
  const [showAddModal, setShowAddModal] = useState(false);
  const [newOrnamentName, setNewOrnamentName] = useState('');
  const [ornamentOptions, setOrnamentOptions] = useState(DEFAULT_PARTICULARS);

  // ── Alert Modal State ──
  const [alert, setAlert] = useState({ show: false, title: '', message: '', type: 'warning' });
  const showAlert = (title, message, type = 'warning') => setAlert({ show: true, title, message, type });

  // ── Calculations ──

  // Calculate Ornament Row
  const handleOrnamentChange = (index, field, value) => {
    const next = [...ornaments];
    next[index][field] = value;

    const row = next[index];
    const grossWt = parseFloat(row.grossWt) || 0;
    const netWt = parseFloat(row.netWt) || 0;

    // VALIDATION: Gross Wt > Net Wt
    if (field === 'netWt' && value !== '' && netWt > grossWt) {
      showAlert(L('वजन त्रुटी', 'Weight Error'), L('निव्वळ वजन एकूण वजनापेक्षा जास्त असू शकत नाही', 'Net weight cannot be greater than Gross weight'), 'error');
      next[index].netWt = '';
      setOrnaments(next);
      return;
    }
    if (field === 'grossWt' && value !== '' && grossWt < netWt) {
      showAlert(L('वजन त्रुटी', 'Weight Error'), L('एकूण वजन निव्वळ वजनापेक्षा कमी असू शकत नाही', 'Gross weight cannot be less than Net weight'), 'error');
      next[index].grossWt = '';
      setOrnaments(next);
      return;
    }

    // Formula: Price = (Net Wt / 10) * Rate
    const rate = row.particular ? FIXED_GOLD_RATE : 0;
    next[index].rate = rate || ''; // Ensure it stays fixed or empty

    if (row.netWt && rate) {
      const calculatedPrice = (netWt / 10) * rate;
      next[index].price = Math.round(calculatedPrice * 100) / 100;
    } else {
      next[index].price = 0;
    }

    setOrnaments(next);
  };

  // Sync Loan Limit with min(Total Price, Total ValuerPrice)
  useEffect(() => {
    const totalPrice = ornaments.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0);
    const totalValuerPrice = ornaments.reduce((acc, curr) => acc + (parseFloat(curr.valuerPrice) || 0), 0);

    // If Total ValuerPrice is entered (>0) and is less than Total Price, take it. Otherwise take Total Price.
    const finalLimit = (totalValuerPrice > 0 && totalValuerPrice < totalPrice) ? totalValuerPrice : totalPrice;

    setLoanSummary(prev => ({ ...prev, loanLimit: Math.round(finalLimit) }));
  }, [ornaments]);

  const totals = useMemo(() => {
    return ornaments.reduce((acc, curr) => ({
      qty: acc.qty + (parseFloat(curr.qty) || 0),
      gross: acc.gross + (parseFloat(curr.grossWt) || 0),
      net: acc.net + (parseFloat(curr.netWt) || 0),
      rate: acc.rate + (parseFloat(curr.rate) || 0),
      price: acc.price + (parseFloat(curr.price) || 0),
      valuerPrice: acc.valuerPrice + (parseFloat(curr.valuerPrice) || 0)
    }), { qty: 0, gross: 0, net: 0, rate: 0, price: 0, valuerPrice: 0 });
  }, [ornaments]);

  const totalDeduction = useMemo(() => {
    return deductions.reduce((acc, curr) => acc + (parseFloat(curr.deduction) || 0), 0);
  }, [deductions]);

  const totalPayable = useMemo(() => {
    const sanction = parseFloat(loanSummary.loanSanction) || 0;
    return (sanction - totalDeduction).toFixed(2);
  }, [loanSummary.loanSanction, totalDeduction]);

  // Recalculate all deductions when loanSanction changes
  useEffect(() => {
    const sanction = parseFloat(loanSummary.loanSanction) || 0;
    setDeductions(prev => prev.map(d => {
      const name = (d.name || '').toLowerCase();
      const per = parseFloat(d.per) || 0;
      const charges = parseFloat(d.charges) || 0;
      const isPercentBased = name.includes('service') || name.includes('valuer');

      let calculated = 0;
      if (isPercentBased) {
        calculated = Math.round((sanction * per) / 100);
      } else if (sanction > 0) {
        // ForPrinting etc, use Charges as fixed deduction if sanction entered
        calculated = Math.round(charges);
      }
      return { ...d, deduction: calculated };
    }));
  }, [loanSummary.loanSanction]);



  // ── Actions ──
  const addRow = () => {
    setOrnaments([...ornaments, {
      id: ornaments.length + 1,
      particular: '', qty: '', grossWt: '', netWt: '', rate: '', price: 0, valuerPrice: 0
    }]);
  };

  const removeRow = (index) => {
    if (ornaments.length <= 1) {
      showToast(L('किमान एक ओळ असणे आवश्यक आहे', 'At least one row is required'), 'warning');
      return;
    }
    const next = ornaments.filter((_, i) => i !== index);
    // Re-index IDs
    const reindexed = next.map((row, i) => ({ ...row, id: i + 1 }));
    setOrnaments(reindexed);
  };

  // ── Camera Logic ──
  const startCamera = async (deviceId = null) => {
    try {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'environment' }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setActiveStream(stream);

      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = deviceList.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);

      if (!deviceId && videoDevices.length > 0) {
        const activeLabel = stream.getVideoTracks()[0]?.label;
        const activeDevice = videoDevices.find(d => d.label === activeLabel);
        setSelectedDeviceId(activeDevice?.deviceId || videoDevices[0].deviceId);
      } else if (deviceId) {
        setSelectedDeviceId(deviceId);
      }

      setShowCamera(true);
    } catch (err) {
      showToast("Camera Error: " + err.message, 'error');
    }
  };

  const stopCamera = () => {
    if (activeStream) {
      activeStream.getTracks().forEach(track => track.stop());
      setActiveStream(null);
    }
    setShowCamera(false);
    setCameraTarget(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

    if (cameraTarget === 'gold') setGoldImages(p => [...p, dataUrl]);
    else setGoldBagImages(p => [...p, dataUrl]);

    stopCamera();
    showToast(L('फोटो यशस्वीरित्या कॅप्चर केला', 'Photo captured successfully'), 'success');
  };

  const openCamera = (target) => {
    setCameraTarget(target);
    startCamera();
  };

  // ── Image Optimization ──
  const compressImage = (base64Str, maxWidth = 1000, quality = 0.7) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(base64Str); // Fallback if compression fails
    });
  };

  const handleFileUpload = async (e, target) => {
    const files = Array.from(e.target.files);
    const readers = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (ev) => {
          const compressed = await compressImage(ev.target.result);
          resolve(compressed);
        };
        reader.readAsDataURL(file);
      });
    });

    const compressedUrls = await Promise.all(readers);
    if (target === 'gold') setGoldImages(p => [...p, ...compressedUrls]);
    else setGoldBagImages(p => [...p, ...compressedUrls]);
  };

  const removeImage = (index, target) => {
    if (target === 'gold') setGoldImages(p => p.filter((_, i) => i !== index));
    else setGoldBagImages(p => p.filter((_, i) => i !== index));
  };

  const handleAddOrnamentOption = () => {
    if (!newOrnamentName.trim()) {
      showToast(L('कृपया नाव प्रविष्ट करा', 'Please enter a name'), 'warning');
      return;
    }
    if (ornamentOptions.includes(newOrnamentName.trim())) {
      showToast(L('हे नाव आधीपासूनच आहे', 'This name already exists'), 'warning');
      return;
    }
    setOrnamentOptions([...ornamentOptions, newOrnamentName.trim()]);
    setNewOrnamentName('');
    setShowAddModal(false);
    showToast(L('दागिना यशस्वीरित्या जोडला', 'Ornament added successfully'), 'success');
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!basic.customerName?.trim()) {
      showToast(L('कृपया ग्राहकाचे नाव प्रविष्ट करा', 'Please enter customer name'), 'warning');
      return;
    }

    // VALIDATION: Sanction <= Limit
    const limit = parseFloat(loanSummary.loanLimit) || 0;
    const sanction = parseFloat(loanSummary.loanSanction) || 0;
    if (sanction > limit) {
      showAlert(L('मर्यादा चेतावणी', 'Limit Warning'), L('मंजूर कर्ज मर्यादा कर्जाच्या मर्यादेपेक्षा जास्त असू शकत नाही', 'Loan Sanction cannot exceed Loan Limit'), 'warning');
      return; // Stop submission on warning as requested by "Dialogue instead of Toast"
    }

    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem('tushgpt_jwt');
      const cleanValue = (v) => (v === '' ? null : v);

      const payload = {
        id: currentId,
        ...Object.fromEntries(Object.entries(basic).map(([k, v]) => [k, cleanValue(v)])),
        ...Object.fromEntries(Object.entries(loanSummary).map(([k, v]) => [k, cleanValue(v)])),
        totalDeduction: parseFloat(String(totalDeduction).replace(/,/g, '')) || 0,
        totalPayable: parseFloat(String(totalPayable).replace(/,/g, '')) || 0,
        ornaments: ornaments
          .filter(o => o.particular || o.qty || o.grossWt)
          .map(o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, cleanValue(v)]))),
        deductions: deductions
          .filter(d => d.name || d.per || d.charges || d.deduction)
          .map(d => Object.fromEntries(Object.entries(d).map(([k, v]) => [k, cleanValue(v)]))),
        goldImages,
        goldBagImages
      };

      const res = await fetch(`${API_BASE_URL}/GoldLoan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let errMsg = 'Failed to save application';
        try {
          const errorData = await res.json();
          errMsg = errorData.message || errMsg;
        } catch {
          const textError = await res.text();
          errMsg = textError || errMsg;
        }
        throw new Error(errMsg);
      }

      const data = await res.json();
      setCurrentId(data.id);
      showToast(L('अर्ज यशस्वीरित्या जतन झाला!', 'Application Saved Successfully!'), 'success');

      // Redirect after a short delay so the user sees the success
      setTimeout(() => {
        navigate('/gold-loan-print', { state: { id: data.id } });
      }, 800);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="gold-loan-wrapper no-print">
      <header className="gl-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="gl-btn gl-btn-outline" onClick={() => navigate('/gold-loan')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '4px 8px' }}>
            <ChevronLeft size={18} />
          </button>
          <div className="gl-title">
            <Coins size={20} style={{ verticalAlign: 'middle', marginRight: '8px', color: 'var(--gl-accent)' }} />
            {L('सुवर्ण कर्ज अर्ज', 'Gold Loan Application Form')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="bl-lang-switcher" style={{ background: 'rgba(255,255,255,0.1)', padding: '2px', borderRadius: '4px' }}>
            <button className={`bl-lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
            <button className={`bl-lang-btn ${lang === 'mr' ? 'active' : ''}`} onClick={() => setLang('mr')}>मराठी</button>
          </div>
        </div>
      </header>

      <div className="gl-form-container">
        {/* SECTION 1: BASIC DETAILS */}
        <section className="gl-card">
          <div className="gl-card-title">{L('१. मूलभूत तपशील', '1. Basic Details')}</div>
          <div className="gl-grid-4">
            <TI
              label={L('कर्जदाराचे नाव', 'Customer Name')}
              value={basic.customerName}
              onChange={v => setBasic({ ...basic, customerName: v })}
              required
            />
            <Select
              label={L('सुवर्ण कर्ज योजना', 'Gold Loan Scheme')}
              value={basic.scheme}
              onChange={v => setBasic({ ...basic, scheme: v })}
              options={SCHEMES}
            />
            <TI
              label={L('मंजुरी तारीख', 'Sanction Date')}
              type="date"
              value={basic.sanctionDate}
              onChange={v => setBasic({ ...basic, sanctionDate: v })}
            />
            <TI
              label={L('सोने बॅग क्र.', 'Gold Bag No')}
              value={basic.goldBagNo}
              onChange={v => setBasic({ ...basic, goldBagNo: v })}
            />
          </div>
        </section>

        {/* SECTION 2: ORNAMENT DETAILS */}
        <section className="gl-card">
          <div className="gl-card-title">{L('२. दागिन्यांचा तपशील', '2. Ornament Details')}</div>
          <div className="gl-table-container">
            <table className="gl-table">
              <thead>
                <tr>
                  <th className="col-sr">Sr.No</th>
                  <th className="col-part">Particular</th>
                  <th className="col-qty">Qty</th>
                  <th className="col-wt">Gross Wt.</th>
                  <th className="col-wt">Net Wt.</th>
                  <th className="col-rate">Rate</th>
                  <th className="col-price">Price</th>
                  <th className="col-val">Value Price</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {ornaments.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: 'center' }}>{row.id}</td>
                    <td>
                      <select value={row.particular} onChange={e => handleOrnamentChange(idx, 'particular', e.target.value)}>
                        <option value="">--Select--</option>
                        {ornamentOptions.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </td>
                    <td><input type="number" className="num-input" value={row.qty} onChange={e => handleOrnamentChange(idx, 'qty', e.target.value)} /></td>
                    <td><input type="number" className="num-input" value={row.grossWt} onChange={e => handleOrnamentChange(idx, 'grossWt', e.target.value)} /></td>
                    <td><input type="number" className="num-input" value={row.netWt} onChange={e => handleOrnamentChange(idx, 'netWt', e.target.value)} /></td>
                    <td className="highlight-col"><input type="number" className="num-input" readOnly value={row.rate} /></td>
                    <td className="highlight-col"><input type="text" className="num-input" readOnly value={row.price} /></td>
                    <td><input type="number" className="num-input" value={row.valuerPrice} onChange={e => handleOrnamentChange(idx, 'valuerPrice', e.target.value)} /></td>
                    <td style={{ textAlign: 'center' }}>
                      {idx > 0 && (
                        <button
                          className="gl-remove-row-btn"
                          onClick={() => removeRow(idx)}
                          title={L('ओळ काढून टाका', 'Remove Row')}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="gl-table-footer">
                <tr>
                  <td colSpan="2" style={{ textAlign: 'right', paddingRight: '20px' }}>Sub Total</td>
                  <td style={{ textAlign: 'right' }}>{totals.qty}</td>
                  <td style={{ textAlign: 'right' }}>{totals.gross.toFixed(3)}</td>
                  <td style={{ textAlign: 'right' }}>{totals.net.toFixed(3)}</td>
                  <td style={{ textAlign: 'right' }}>{totals.rate.toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>{totals.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="highlight-col" style={{ textAlign: 'right' }}>₹ {totals.valuerPrice.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button className="gl-btn gl-btn-primary" onClick={addRow}><Plus size={14} /> {L('नवीन ओळ जोडा', 'Add New Row')}</button>
            <button className="gl-btn gl-btn-outline" onClick={() => setShowAddModal(true)}><Plus size={14} /> {L('नवीन दागिना', 'Add New Ornament')}</button>
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
          {/* SECTION 3: SANCTION DETAILS */}
          <section className="gl-card">
            <div className="gl-card-title">{L('३. कर्ज मंजुरी तपशील', '3. Sanction Details')}</div>
            <div className="gl-grid-2" style={{ marginBottom: '15px' }}>
              <TI label="Loan Limit" highlight value={loanSummary.loanLimit} readOnly />
              <TI
                label="Loan Sanction"
                value={loanSummary.loanSanction}
                onChange={v => setLoanSummary({ ...loanSummary, loanSanction: v })}
                onBlur={e => {
                  const val = parseFloat(e.target.value) || 0;
                  const limit = parseFloat(loanSummary.loanLimit) || 0;
                  if (val > limit) {
                    showAlert(L('मर्यादा चेतावणी', 'Limit Warning'), L('मंजूर कर्ज मर्यादा कर्जाच्या मर्यादेपेक्षा जास्त असू शकत नाही', 'Loan Sanction cannot exceed Loan Limit'), 'warning');
                  }
                }}
              />
            </div>

            <table className="gl-table" style={{ border: '1px solid var(--gl-border)' }}>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>Sr No</th>
                  <th>Name</th>
                  <th style={{ width: '80px' }}>Per (%)</th>
                  <th style={{ width: '100px' }}>Charges</th>
                  <th>Deduction</th>
                </tr>
              </thead>
              <tbody>
                {deductions.map((row, idx) => {
                  const name = (row.name || '').toLowerCase();
                  const isPercentBased = name.includes('service') || name.includes('valuer');
                  return (
                    <tr key={idx}>
                      <td className="highlight-col" style={{ textAlign: 'center' }}>{row.id}</td>
                      <td style={{ padding: '4px 8px', fontWeight: 600, color: 'var(--gl-primary)' }}>
                        {row.name}
                      </td>
                      <td className="highlight-col" style={{ backgroundColor: isPercentBased ? 'var(--gl-highlight)' : 'transparent' }}>
                        <input type="text" readOnly className="num-input" value={isPercentBased ? row.per : ''} />
                      </td>
                      <td className="highlight-col" style={{ backgroundColor: !isPercentBased ? 'var(--gl-highlight)' : 'transparent' }}>
                        <input type="text" readOnly className="num-input" value={!isPercentBased ? row.charges : ''} />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="num-input calc-field"
                          placeholder="0"
                          value={row.deduction || ''}
                          readOnly
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Total Deduction Voucher:</span>
                <input type="text" className="calc-field" style={{ width: '120px', height: '30px', border: '1px solid var(--gl-border)', borderRadius: '4px', padding: '0 8px', background: 'var(--gl-highlight)' }} readOnly value={totalDeduction} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Total Payable Amount:</span>
                <input type="text" className="calc-field" style={{ width: '120px', height: '30px', border: '1px solid var(--gl-border)', borderRadius: '4px', padding: '0 8px', background: 'var(--gl-highlight)' }} readOnly value={totalPayable} />
              </div>
            </div>
          </section>

          {/* SECTION 4: IMAGE UPLOADS */}
          <section className="gl-card">
            <div className="gl-card-title">{L('४. फोटो अपलोड', '4. Image Uploads')}</div>

            <div className="gl-upload-grid">
              {/* Gold Ornaments Photo */}
              <div className="gl-upload-card">
                <div className="gl-upload-label">
                  <ImageIcon size={18} /> {L('दागिन्यांचा फोटो', 'Gold Photo')}
                </div>

                <div className="gl-preview-box">
                  {goldImages.length > 0 ? (
                    <div className="gl-preview-grid">
                      {goldImages.map((src, i) => (
                        <div key={i} className="gl-preview-item">
                          <img src={src} alt="Gold" />
                          <button className="gl-remove-img" onClick={() => removeImage(i, 'gold')}><X size={10} /></button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="gl-preview-empty">
                      <Camera size={40} />
                      <span>{L('फोटो नाही', 'No Photo')}</span>
                    </div>
                  )}
                </div>

                <div className="gl-upload-btn-container" style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <button
                    className="gl-btn gl-btn-outline"
                    style={{ flex: 1, justifyContent: 'center', height: '40px' }}
                    onClick={() => openCamera('gold')}
                  >
                    <Camera size={16} /> {L('कॅप्चर करा', 'Capture')}
                  </button>
                  <label className="gl-btn gl-btn-primary" style={{ flex: 1, justifyContent: 'center', cursor: 'pointer', height: '40px', alignItems: 'center' }}>
                    <Upload size={16} style={{ marginRight: '8px' }} /> {L('अपलोड करा', 'Upload')}
                    <input type="file" multiple accept="image/*" onChange={e => handleFileUpload(e, 'gold')} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              {/* Gold Bag Photo */}
              <div className="gl-upload-card">
                <div className="gl-upload-label">
                  <Plus size={18} /> {L('गोल्ड बॅग फोटो', 'Gold Bag Photo')}
                </div>

                <div className="gl-preview-box">
                  {goldBagImages.length > 0 ? (
                    <div className="gl-preview-grid">
                      {goldBagImages.map((src, i) => (
                        <div key={i} className="gl-preview-item">
                          <img src={src} alt="Bag" />
                          <button className="gl-remove-img" onClick={() => removeImage(i, 'goldBag')}><X size={10} /></button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="gl-preview-empty">
                      <Camera size={40} />
                      <span>{L('फोटो नाही', 'No Photo')}</span>
                    </div>
                  )}
                </div>

                <div className="gl-upload-btn-container" style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <button
                    className="gl-btn gl-btn-outline"
                    style={{ flex: 1, justifyContent: 'center', height: '40px' }}
                    onClick={() => openCamera('goldBag')}
                  >
                    <Camera size={16} /> {L('कॅप्चर करा', 'Capture')}
                  </button>
                  <label className="gl-btn gl-btn-primary" style={{ flex: 1, justifyContent: 'center', cursor: 'pointer', height: '40px', alignItems: 'center' }}>
                    <Upload size={16} style={{ marginRight: '8px' }} /> {L('अपलोड करा', 'Upload')}
                    <input type="file" multiple accept="image/*" onChange={e => handleFileUpload(e, 'goldBag')} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>

      <div className="gl-form-sub-footer">
        <button className="gl-footer-btn gl-btn-back" onClick={() => navigate('/gold-loans')}>
          <ChevronLeft size={18} /> {L('मागे सुवर्ण कर्ज डॅशबोर्डवर', 'Back to Gold Loan Dashboard')}
        </button>
        <button
          className="gl-footer-btn gl-btn-submit"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <><Loader2 size={18} className="animate-spin" /> {L('प्रक्रिया चालू आहे...', 'Processing...')}</>
          ) : (
            <><Save size={18} /> {currentId ? L('अर्ज अपडेट करा', 'Update Application') : L('अर्ज सादर करा', 'Submit Application')}</>
          )}
        </button>
      </div>

      {/* ADD NEW ORNAMENT MODAL */}
      {showAddModal && (
        <div className="gl-modal-overlay">
          <div className="gl-modal-card">
            <div className="gl-modal-header">
              <h3>{L('नवीन दागिना जोडा', 'Add New Ornament')}</h3>
              <button className="gl-close-modal" onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <div className="gl-modal-body">
              <TI
                label={L('दागिन्याचे नाव', 'Ornament Name')}
                value={newOrnamentName}
                onChange={setNewOrnamentName}
                placeholder={L('उदा. सोन्याचे कडे', 'e.g. Gold Bracelet')}
                required
              />
            </div>
            <div className="gl-modal-footer">
              <button className="gl-btn gl-btn-outline" onClick={() => setShowAddModal(false)}>
                {L('रद्द करा', 'Cancel')}
              </button>
              <button className="gl-btn gl-btn-primary" onClick={handleAddOrnamentOption}>
                {L('ओके', 'OK')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ALERT DIALOG */}
      {alert.show && (
        <div className="gl-modal-overlay" style={{ zIndex: 2000 }}>
          <div className="gl-modal-card" style={{ maxWidth: '450px' }}>
            <div className="gl-modal-header" style={{ background: alert.type === 'error' ? '#fef2f2' : '#fffbeb' }}>
              <h3 style={{ color: alert.type === 'error' ? '#991b1b' : '#92400e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {alert.type === 'error' ? <X size={18} /> : <Coins size={18} />}
                {alert.title}
              </h3>
              <button className="gl-close-modal" onClick={() => setAlert({ ...alert, show: false })}><X size={20} /></button>
            </div>
            <div className="gl-modal-body" style={{ padding: '30px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '15px', color: '#334155', lineHeight: '1.5', fontWeight: '500' }}>
                {alert.message}
              </div>
            </div>
            <div className="gl-modal-footer">
              <button
                className="gl-btn gl-btn-primary"
                style={{ background: alert.type === 'error' ? '#ef4444' : 'var(--gl-navy)', width: '100px', display: 'flex', justifyContent: 'center' }}
                onClick={() => setAlert({ ...alert, show: false })}
              >
                {L('ओके', 'OK')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CAMERA MODAL */}
      {showCamera && (
        <div className="gl-modal-overlay" style={{ zIndex: 3000 }}>
          <div className="gl-modal-card camera-modal">
            <div className="gl-modal-header">
              <h3>
                <Camera size={18} style={{ marginRight: '8px' }} />
                {cameraTarget === 'gold' ? L('दागिना फोटो कॅप्चर करा', 'Capture Gold Photo') : L('बॅग फोटो कॅप्चर करा', 'Capture Bag Photo')}
              </h3>
              <button className="gl-close-modal" onClick={stopCamera}><X size={20} /></button>
            </div>
            <div className="gl-modal-body" style={{ padding: '0', position: 'relative', background: '#000' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: '100%', display: 'block', maxHeight: '400px', objectFit: 'cover' }}
              />

              {devices.length > 1 && (
                <div className="camera-switch">
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => startCamera(e.target.value)}
                    style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}
                  >
                    {devices.map(d => (
                      <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${devices.indexOf(d) + 1}`}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="gl-modal-footer" style={{ justifyContent: 'center', padding: '15px' }}>
              <button
                className="gl-btn capture-circle-btn"
                onClick={capturePhoto}
                title={L('फोटो काढा', 'Take Photo')}
              >
                <div className="inner-circle" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
