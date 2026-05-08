import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Fingerprint, Send, ShieldCheck, Loader2, RotateCcw, User, Calendar, MapPin, Phone, ChevronLeft, CheckCircle2, AlertCircle, Search, Download, FileText, Smartphone, Camera, CameraOff, X } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import jsPDF from 'jspdf';
import CustomerAccountForm from './CustomerAccountForm';
import SecurityInfoWidget from '../Shared/SecurityInfoWidget';
import HowItWorksWidget from '../Shared/HowItWorksWidget';
import './AadharVerification.css';
import API_BASE_URL from '../../config';

const AADHAAR_API_BASE = `${API_BASE_URL}/AadharProxy`;

const formatAadhaar = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 12);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
};

const validateAadhaar = (num) => {
  const digits = num.replace(/\s/g, '');
  return /^\d{12}$/.test(digits);
};

export default function AadharVerification() {
  const { showToast, balance, user, fetchBalance, clientInfo } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState('');
  const [aadhaarData, setAadhaarData] = useState(null);
  const [otpTimer, setOtpTimer] = useState(0);
  const [clientId, setClientId] = useState('');
  const [history, setHistory] = useState([]);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [selectedForAccount, setSelectedForAccount] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [existingAccounts, setExistingAccounts] = useState([]);
  const [reportModeData, setReportModeData] = useState(null);
  const [agreedToAadhar, setAgreedToAadhar] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLocationFetching, setIsLocationFetching] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const recordsPerPage = 10;

  const filteredHistory = history.filter(record =>
    record.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.aadhaarNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredHistory.length / recordsPerPage);
  const currentRecords = filteredHistory.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  useEffect(() => {
    fetchHistory();
    fetchExistingAccounts();
  }, []);

  const fetchExistingAccounts = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/membership`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        setExistingAccounts(data || []);
      }
    } catch (err) {
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await fetch(`${AADHAAR_API_BASE}/history?t=${new Date().getTime()}`, {
        headers: { 
          'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (response.ok) {
        const data = await response.json();
        const sorted = (data || []).sort((a, b) => new Date(b.verifiedAt || b.VerifiedAt) - new Date(a.verifiedAt || a.VerifiedAt));
        setHistory(sorted);
        return sorted;
      } else {
        setHistory([]);
        return [];
      }
    } catch (err) {
      setHistory([]);
      return [];
    } finally {
      setHistoryLoading(false);
    }
  };

  // Extract full Aadhaar from rawResponse (for older masked records)
  const getFullAadhaar = (record) => {
    if (!record) return '';
    // Primary: Check the direct property (allowing for casing variance)
    const directNo = record.aadhaarNo || record.AadhaarNo || '';
    if (directNo && directNo.length >= 12) return directNo.replace(/\D/g, '').slice(0, 12);

    if (record.rawResponse) {
      try {
        const raw = JSON.parse(record.rawResponse);
        if (raw._fullAadhaar) return raw._fullAadhaar;
        const d = raw.data || raw;
        const fullNo = d.aadhaar_number || d.adharNo || d.aadhaar || d.AadhaarNo || '';
        if (fullNo && fullNo.length >= 12) return fullNo.replace(/\D/g, '').slice(0, 12);
      } catch (e) { /* ignore */ }
      
      const paramMatch = record.rawResponse.match(/adharNo["=:]\s*["']?(\d{12})/i);
      if (paramMatch) return paramMatch[1];
      
      const digitMatch = record.rawResponse.match(/\d{12}/);
      if (digitMatch) return digitMatch[0];
    }
    return '';
  };

  const saveToHistory = async (data, rawNum, rawResponse, overridePhoto = null) => {
    console.log("[AadharVerification] saveToHistory triggered. Full Name:", data.fullName, "Captured PAN:", data.extractedPan || data.panMatchResult?.panNo);
    try {
      // Inject full Aadhaar into rawResponse so it's always recoverable
      let enrichedRaw = rawResponse || '';
      try {
        const parsed = JSON.parse(enrichedRaw);
        parsed._fullAadhaar = rawNum;
        enrichedRaw = JSON.stringify(parsed);
      } catch (e) {
        enrichedRaw = JSON.stringify({ _fullAadhaar: rawNum, _originalResponse: enrichedRaw });
      }

      const cleanLocation = (!currentLocation || currentLocation.includes("Fetching") || currentLocation.includes("Permission")) ? "" : currentLocation;

      const payload = {
        AadhaarNo: rawNum,
        Name: data.fullName,
        Dob: data.dob,
        Gender: data.gender,
        Address: typeof data.address === 'string' ? data.address : `${data.address.house || ''}, ${data.address.street || ''}, ${data.address.locality || ''}, ${data.address.district || ''}, ${data.address.state || ''} - ${data.address.pincode || ''}`,
        Photo: data.photo || '',
        CapturedPhoto: overridePhoto || capturedImage || '',
        LocationInfo: cleanLocation,
        RawResponse: enrichedRaw,
        PanNo: data.extractedPan || data.panMatchResult?.panNo || ''
      };
      const resp = await fetch(`${AADHAAR_API_BASE}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}`
        },
        body: JSON.stringify(payload)
      });
      if (resp.ok) {
        fetchHistory();
      }
    } catch (err) {
    }
  };

  const handleAadhaarChange = (e) => {
    setAadhaarNumber(formatAadhaar(e.target.value));
    setError('');
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
    setError('');
  };

  const startTimer = () => {
    setOtpTimer(30);
    const interval = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    // Credit Check
    if (user?.role !== 'SUPER_ADMIN' && balance <= 0) {
      showToast('please add credits', 'warning');
      return;
    }

    const rawNumber = aadhaarNumber.replace(/\s/g, '');
    if (!validateAadhaar(rawNumber)) {
      setError('Invalid 12-digit Aadhaar number');
      return;
    }

    if (!agreedToAadhar) {
      setError('Please check the consent box to agree to Aadhaar verification');
      return;
    }

    // Fresh history refresh before checking
    const freshHistory = await fetchHistory();
    const currentList = freshHistory && freshHistory.length > 0 ? freshHistory : history;

    // Check if Aadhaar is already verified
    const normalizedUserAadhaar = rawNumber.replace(/\D/g, '');

    const existingRecord = currentList.find(record => {
       const dbAadhaar = (getFullAadhaar(record) || '').replace(/\D/g, '');
       return dbAadhaar === normalizedUserAadhaar;
    });
    
    if (existingRecord) {
      showToast(`Aadhaar already verified for ${existingRecord.name}. Proceeding with new verification if you continue.`, 'warning');
    }

    setLoading(true);
    setError('');
    try {
      const url = `${AADHAAR_API_BASE}/send-otp?adharNo=${rawNumber}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
      });
      const responseText = await response.text();
      if (!response.ok) throw new Error(`Server error: ${responseText.substring(0, 100)}`);

      try {
        const parsed = JSON.parse(responseText);
        if (parsed.status === false) throw new Error(parsed.message || 'Provider error');
        if (parsed.data && parsed.data.client_id) setClientId(parsed.data.client_id);
        else if (parsed.clientId) setClientId(parsed.clientId);
        else if (parsed.ClientID) setClientId(parsed.ClientID);
      } catch (e) {
        if (e.message !== 'Unexpected token < in JSON at position 0' && !e.message.includes('Unexpected token')) throw e;
      }
      setStep(2);
      startTimer();
    } catch (err) {
      setError('OTP Failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Enter 6-digit OTP');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const rawNumber = aadhaarNumber.replace(/\s/g, '');
      const params = new URLSearchParams({
        Clientiid: clientId || '1',
        ClientID: clientId || '1',
        OTP: otp,
        BankName: 'AVS',
        adharNo: rawNumber
      });
      const response = await fetch(`${AADHAAR_API_BASE}/verify-otp?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
      });
      const responseText = await response.text();
      if (!response.ok) throw new Error(`Server error: ${responseText.substring(0, 100)}`);

      let parsedData = null;
      try { parsedData = JSON.parse(responseText); } catch (e) { }

      if (!parsedData) {
        throw new Error(`Invalid response format`);
      }

      if (parsedData.status === false || parsedData.success === false || parsedData.statusCode === 422 || parsedData.status_code === 422) {
        throw new Error(parsedData.message || 'Verification failed');
      }

      const d = parsedData.data || parsedData;
      if (!d.full_name && !d.name && !d.fullName && !d.Name) {
        throw new Error(parsedData.message || 'Verification Failed: Could not fetch Aadhaar profile details');
      }

      const addr = d.address || parsedData.address || {};

      let photoUrl = null;
      if (d.profile_image) photoUrl = d.profile_image.startsWith('data:image') ? d.profile_image : `data:image/jpeg;base64,${d.profile_image}`;
      else if (d.photo || d.Photo) {
        const img = d.photo || d.Photo;
        photoUrl = img.startsWith('data:image') ? img : `data:image/jpeg;base64,${img}`;
      }

      let formattedDob = d.dob || d.DOB || d.dateOfBirth || '';
      if (typeof formattedDob === 'string' && formattedDob.includes('-') && formattedDob.split('-')[0].length === 4) {
        const [yyyy, mm, dd] = formattedDob.split('-');
        formattedDob = `${dd}-${mm}-${yyyy}`;
      }

      let genderRaw = d.gender || d.Gender || '';
      let formattedGender = genderRaw && typeof genderRaw === 'string'
        ? genderRaw.charAt(0).toUpperCase() + genderRaw.slice(1).toLowerCase() : '';

      let phoneDisplay = 'Not Linked';
      if (d.mobile_verified === true || (d.mobile_hash && d.mobile_hash.trim().length > 0)) phoneDisplay = 'Linked';

      // PAN Match Check Logic
      const panRaw = d.pan_number || d.panNo || d.pan || d.pan_no || '';
      let extractedPan = panRaw;
      if (!extractedPan || extractedPan === 'N/A') {
        const panMatchReg = responseText.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/);
        if (panMatchReg) extractedPan = panMatchReg[0];
      }
      if (typeof extractedPan === 'string' && extractedPan.startsWith('pan_number:')) {
        extractedPan = extractedPan.replace('pan_number:', '');
      }

      let panMatchResult = { isMatch: false };
      const fullName = d.full_name || d.name || d.fullName || d.Name || '';

      try {
        const params = new URLSearchParams({ name: fullName });
        if (extractedPan && extractedPan !== 'N/A') params.append('pan', extractedPan);

        const pmResp = await fetch(`${AADHAAR_API_BASE}/check-pan-match?${params.toString()}`, {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
        });
        if (pmResp.ok) {
          panMatchResult = await pmResp.json();
        }
      } catch (e) { console.error("PAN Match Error:", e); }

      const finalData = {
        fullName,
        dob: formattedDob,
        gender: formattedGender,
        phone: phoneDisplay,
        address: {
          house: addr.house || '', street: addr.street || addr.loc || '', landmark: addr.landmark || '',
          locality: addr.vtc || addr.po || addr.locality || '', district: addr.dist || addr.district || '',
          state: addr.state || '', pincode: d.zip || addr.pincode || addr.pc || ''
        },
        photo: photoUrl, aadhaarNo: rawNumber,
        panMatchResult,
        extractedPan: extractedPan || '',
        rawResponse: responseText // PERSIST FOR SUBSEQUENT ACTIONS (PHOTO CAPTURE)
      };
      setAadhaarData(finalData);
      saveToHistory(finalData, rawNumber, responseText);
      setStep(3);
      showToast('Aadhaar Verification Successful', 'success');
      fetchHistory();
      fetchBalance();
    } catch (err) {
      setError('Verification Failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = (data) => {
    setSelectedForAccount({
      ...data,
      aadhaarNo: getFullAadhaar(data)
    });
    setShowAccountForm(true);
  };

  const handleApplyLoan = (record) => {
    const fullRecord = {
      ...record,
      aadhaarNo: getFullAadhaar(record)
    };
    navigate('/home-loan', { state: { aadharData: fullRecord } });
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    setLoading(true); setError(''); setOtp('');
    try {
      const rawNumber = aadhaarNumber.replace(/\s/g, '');
      const response = await fetch(`${AADHAAR_API_BASE}/send-otp?adharNo=${rawNumber}`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
      });
      if (!response.ok) throw new Error('Failed to resend OTP');
      startTimer();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1); setAadhaarNumber(''); setOtp(''); setError(''); setAadhaarData(null); setClientId(''); setOtpTimer(0); setAgreedToAadhar(false);
    setCapturedImage(null); setShowCamera(false);
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      // Added a more specific timeout for the address lookup itself
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`, {
        signal: controller.signal,
        headers: { 'Accept-Language': 'en' }
      });
      clearTimeout(timeoutId);

      if (resp.ok) {
        const data = await resp.json();
        if (data.display_name) return data.display_name;
        if (data.address) {
          const a = data.address;
          return [a.road, a.suburb, a.city || a.town, a.state, a.postcode].filter(Boolean).join(", ");
        }
      }
    } catch (e) {
      console.error("Reverse Geocoding Error:", e.name === 'AbortError' ? 'Timeout' : e.message);
    }
    return `Lat: ${lat.toFixed(6)}, Long: ${lon.toFixed(6)}`;
  };

  const startCamera = async (deviceId = null) => {
    try {
      if ("geolocation" in navigator && !currentLocation && !isLocationFetching) {
        setIsLocationFetching(true);
        setCurrentLocation("Fetching live address...");
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            setCurrentLocation(`Lat: ${lat.toFixed(6)}, Long: ${lon.toFixed(6)}`);
            
            const address = await reverseGeocode(lat, lon);
            setCurrentLocation(address);
            setIsLocationFetching(false);
          },
          (err) => {
            console.warn("Location permission denied or error:", err.message);
            const msg = err.code === 3 ? "Location Timeout (Try again outdoors)" : "Location Permission Denied";
            setCurrentLocation(msg);
            setIsLocationFetching(false);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      } else if (!("geolocation" in navigator)) {
        setCurrentLocation("Geolocation Not Supported");
      }

      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: deviceId && typeof deviceId === 'string' ? { deviceId: { exact: deviceId } } : { facingMode: 'user' }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      setShowCamera(true);

      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = deviceList.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      
      if ((!deviceId || typeof deviceId !== 'string') && videoDevices.length > 0) {
        const activeLabel = stream.getVideoTracks()[0]?.label;
        const activeDevice = videoDevices.find(d => d.label === activeLabel);
        if (activeDevice) {
          setSelectedDeviceId(activeDevice.deviceId);
        } else {
          setSelectedDeviceId(videoDevices[0].deviceId);
        }
      } else if (typeof deviceId === 'string') {
        setSelectedDeviceId(deviceId);
      }
    } catch (err) {
      showToast("Camera Error: " + err.message, 'error');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    const video = document.getElementById('camera-preview');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');
    setCapturedImage(dataUrl);
    stopCamera();
    // After capturing, if we have aadhaarData, update the record in DB to include the photo
    if (aadhaarData) {
      // Pass dataUrl directly to avoid React state race condition
      saveToHistory(aadhaarData, aadhaarData.aadhaarNo, aadhaarData.rawResponse, dataUrl);
    }
  };

  const handleDownloadEKycPdf = async (record) => {
    if (!record) return;
    
    let fullRecord = record;
    // Always fetch full details for historical records to ensure rawResponse is present for PAN check
    if (record.id) {
      setLoading(true);
      try {
        const resp = await fetch(`${AADHAAR_API_BASE}/history/${record.id}`, {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
        });
        if (resp.ok) {
          fullRecord = await resp.json();
        }
      } catch (err) {
        console.error("Error fetching record details:", err);
      } finally {
        setLoading(false);
      }
    }

    showToast('Preparing one-page e-KYC Certificate...', 'info');

    const bankName = clientInfo?.name || "SAI SHREE CO-OP BANK LTD.";
    const branchName = "Main Branch"; // Could be dynamic
    const today = new Date().toLocaleDateString('en-GB');
    const time = new Date().toLocaleTimeString();

    // Reconstruct address for the certificate
    const addressStr = typeof fullRecord.address === 'object' 
      ? `${fullRecord.address.house || ''}, ${fullRecord.address.locality || ''}, ${fullRecord.address.district || ''}, ${fullRecord.address.state || ''} - ${fullRecord.address.pincode || ''}`
      : fullRecord.address;

    // Dynamic Statuses: Enhanced with re-verification and DB persistence check
    let isPanVerified = fullRecord.panNo ? true : (fullRecord.panMatchResult?.isMatch || (aadhaarData?.panMatchResult?.isMatch && aadhaarData?.aadhaarNo === getFullAadhaar(fullRecord)));
    
    // If not verified in memory OR DB, try to re-verify based on rawResponse (handles old history records)
    if (!isPanVerified && fullRecord.rawResponse) {
      try {
        const raw = JSON.parse(fullRecord.rawResponse || '{}');
        const d = raw.data || raw || {};
        const name = fullRecord.name || d.full_name || d.name || 'N/A';
        const panRaw = d.pan_number || d.panNo || d.pan || d.pan_no || '';
        let extractedPan = panRaw;
        
        if (!extractedPan || extractedPan === 'N/A') {
          const panMatchReg = (fullRecord.rawResponse || '').match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/);
          if (panMatchReg) extractedPan = panMatchReg[0];
        }
        if (typeof extractedPan === 'string' && extractedPan.startsWith('pan_number:')) {
          extractedPan = extractedPan.replace('pan_number:', '');
        }

        if (extractedPan && extractedPan !== 'N/A') {
          isPanVerified = true; // If we extracted it directly from Aadhaar, it's verified
          fullRecord.panNo = extractedPan; // Set it so it can be printed
        }

        // STILL try to enrich with name match across verified_pans DB, especially if extractedPan was empty
        const params = new URLSearchParams({ name });
        if (extractedPan && extractedPan !== 'N/A') {
            params.append('pan', extractedPan);
        }

        const pmResp = await fetch(`${AADHAAR_API_BASE}/check-pan-match?${params.toString()}`, {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
        });

        if (pmResp.ok) {
          const pmResult = await pmResp.json();
          if (pmResult.isMatch) {
             isPanVerified = true;
             if (pmResult.panNo) fullRecord.panNo = pmResult.panNo;
          }
        }
      } catch (e) { /* ignore re-verification errors */ }
    }

    const isPhotoCaptured = fullRecord.capturedPhoto || (fullRecord === aadhaarData && capturedImage);
    const panText = isPanVerified ? 'Verified' : 'Not Verified';
    const photoText = isPhotoCaptured ? 'Captured' : 'Not Captured';

    // Create a temporary container for the PDF content
    const element = document.createElement('div');
    element.style.padding = '25px';
    element.style.fontFamily = "'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
    element.style.color = '#1e293b';
    element.style.width = '794px'; // A4 Width
    element.style.backgroundColor = '#fff';

    element.innerHTML = `
      <div style="border: 2px solid #800000; padding: 10px; position: relative;">
        <div style="text-align: center; margin-bottom: 10px;">
          <h1 style="color: #800000; margin: 0; font-size: 24px; text-transform: uppercase;">${bankName}</h1>
          <p style="margin: 2px 0; font-size: 13px; color: #64748b;">(Scheduled Co-operative Bank)</p>
          <div style="background-color: #800000; color: #fff; padding: 8px; margin-top: 10px; font-weight: bold; font-size: 16px;">
            e-KYC VERIFICATION CERTIFICATE
          </div>
          <p style="margin: 6px 0; font-size: 11px; color: #b91c1c; font-weight: 600;">
            (OTP Based Aadhaar Authentication | PAN Verification | Live Photo Capture)
          </p>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: bold; font-size: 13px;">
          <span>Branch: ${branchName}</span>
          <span>Date: ${today}</span>
        </div>

        <div style="background-color: #f1f5f9; padding: 6px 12px; font-weight: bold; color: #1e40af; margin-bottom: 6px; border-radius: 4px; font-size: 13px;">
          CUSTOMER DETAILS
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 13px;">
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px; font-weight: bold; width: 30%;">Customer Name</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px;">${fullRecord.name || fullRecord.fullName}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px; font-weight: bold;">Aadhaar Number</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px;">XXXX XXXX ${getFullAadhaar(fullRecord).slice(-4)}</td>
          </tr>
        </table>

        <div style="color: #800000; font-weight: bold; margin-bottom: 8px; font-size: 14px;">
          e-KYC VERIFICATION DETAILS
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 12px; text-align: center;">
          <thead>
            <tr style="background-color: #800000; color: #fff;">
              <th style="border: 1px solid #800000; padding: 6px; width: 10%;">Sr.</th>
              <th style="border: 1px solid #800000; padding: 6px; width: 30%;">Verification Type</th>
              <th style="border: 1px solid #800000; padding: 6px; width: 40%;">Details / Number</th>
              <th style="border: 1px solid #800000; padding: 6px; width: 20%;">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #cbd5e1; padding: 6px;">1</td>
              <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: left;">Aadhaar OTP Verification</td>
              <td style="border: 1px solid #cbd5e1; padding: 6px;">Valid Aadhaar Authentication</td>
              <td style="border: 1px solid #cbd5e1; padding: 6px; color: #059669; font-weight: bold;">Verified</td>
            </tr>
            <tr>
              <td style="border: 1px solid #cbd5e1; padding: 6px;">2</td>
              <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: left;">PAN Verification</td>
              <td style="border: 1px solid #cbd5e1; padding: 6px;">Matching as per UIDAI Name</td>
              <td style="border: 1px solid #cbd5e1; padding: 6px; color: ${isPanVerified ? '#059669' : '#b91c1c'}; font-weight: bold;">${panText}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #cbd5e1; padding: 6px;">3</td>
              <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: left;">Live Photo Capture</td>
              <td style="border: 1px solid #cbd5e1; padding: 6px;">Live Biometric Match</td>
              <td style="border: 1px solid #cbd5e1; padding: 6px; color: ${isPhotoCaptured ? '#059669' : '#b91c1c'}; font-weight: bold;">${photoText}</td>
            </tr>
          </tbody>
        </table>

        <div style="background-color: #fff7ed; padding: 6px 10px; margin-bottom: 10px; border-left: 3px solid #c2410c;">
          <div style="color: #c2410c; font-weight: bold; font-size: 13px; margin-bottom: 2px;">CUSTOMER DECLARATION</div>
          <p style="margin: 0; font-size: 10px; line-height: 1.4; font-weight: 500;">
            I, the undersigned, hereby declare and confirm that:<br/>
            1. I have personally visited the branch for e-KYC verification.
            2. I have voluntarily provided my Aadhaar number and authorized OTP-based authentication.
            3. I have provided my PAN details for verification purposes.
            4. My live photograph has been captured at the branch with my consent.
            5. All information provided by me is true, correct, and complete to the best of my knowledge.
            6. I am signing this declaration in the presence of the Bank's authorized official.
          </p>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 8px; margin-bottom: 15px;">
          <div style="text-align: center; width: 40%;">
            <div style="border-bottom: 1px solid #000; height: 40px; margin-bottom: 6px;"></div>
            <p style="margin: 0; font-size: 12px; font-weight: bold;">CUSTOMER SIGNATURE</p>
            <p style="margin: 4px 0 0; font-size: 10px; color: #64748b;">(Signed in presence of Bank Official)</p>
          </div>
          <div style="text-align: center; width: 40%;">
            <div style="border: 1px solid #cbd5e1; width: 85px; height: 85px; margin: 0 auto 6px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
              ${fullRecord.capturedPhoto || (fullRecord === aadhaarData && capturedImage) ? `<img src="${fullRecord.capturedPhoto || (fullRecord === aadhaarData && capturedImage)}" style="width: 100%; height: 100%; object-fit: cover;"/>` : '<span style="font-size: 10px; color: #94a3b8;">NO PHOTO</span>'}
            </div>
            <p style="margin: 0; font-size: 12px; font-weight: bold; color: #b91c1c;">LIVE PHOTO</p>
            ${fullRecord.locationInfo || currentLocation ? `<p style="margin: 4px auto 0; font-size: 9px; color: #000; font-weight: bold; font-family: sans-serif; max-width: 160px; word-break: break-word; line-height: 1.2; text-align: center;">Verification Location: ${fullRecord.locationInfo || currentLocation}</p>` : ''}
          </div>
        </div>

        <div style="background-color: #f1f5f9; padding: 5px 12px; font-weight: bold; color: #1e40af; margin-bottom: 6px; border-radius: 4px; font-size: 13px;">
          FOR BANK USE ONLY
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11px;">
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 5px; font-weight: bold; width: 25%;">Verified By</td>
            <td style="border: 1px solid #cbd5e1; padding: 5px; width: 25%;">${user?.name || 'System'}</td>
            <td style="border: 1px solid #cbd5e1; padding: 5px; font-weight: bold; width: 25%;">Code</td>
            <td style="border: 1px solid #cbd5e1; padding: 5px; width: 25%;">${user?.id || '101'}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 5px; font-weight: bold;">Designation</td>
            <td style="border: 1px solid #cbd5e1; padding: 5px;">Bank Officer</td>
            <td style="border: 1px solid #cbd5e1; padding: 5px; font-weight: bold;">Date & Time</td>
            <td style="border: 1px solid #cbd5e1; padding: 5px;">${today} ${time}</td>
          </tr>
        </table>

        <div style="display: flex; justify-content: space-between; margin-top: 10px;">
          <div style="text-align: left; width: 45%;">
            <div style="border-bottom: 1px solid #000; width: 180px; margin-bottom: 4px; height: 25px;"></div>
            <p style="margin: 0; font-size: 11px; font-weight: bold;">Bank Official Signature</p>
            <p style="margin: 2px 0 0; font-size: 9px; font-style: italic;">(With Stamp)</p>
          </div>
          <div style="text-align: right; width: 45%;">
            <div style="border-bottom: 1px solid #000; width: 180px; margin-left: auto; margin-bottom: 4px; height: 25px;"></div>
            <p style="margin: 0; font-size: 11px; font-weight: bold;">Branch Manager Signature</p>
            <p style="margin: 2px 0 0; font-size: 9px; font-style: italic;">(With Seal)</p>
          </div>
        </div>

        <div style="text-align: center; border-top: 1px solid #cbd5e1; margin-top: 10px; padding-top: 4px;">
          <p style="margin: 0; font-size: 9px; color: #64748b;">This is a system-generated certificate for e-KYC verification completed through OTP-based Aadhaar Authentication.</p>
          <p style="margin: 2px 0 0; font-size: 9px; font-weight: bold; color: #800000;">${bankName}</p>
        </div>
      </div>
    `;

    const opt = {
      margin: [5, 0, 5, 0], // Top, Left, Bottom, Right margin in mm
      filename: `eKyc_Certificate_${fullRecord.name || fullRecord.fullName}_${today}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 1.6, useCORS: true, logging: false, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().from(element).set(opt).save();
  };

  const handleDownloadPdf = async (record) => {
    if (!record) return;

    setLoading(true);
    try {
      let fullRecord = record;
      let panMatchResult = { isMatch: false, panNo: fullRecord.panNo || '' };

      // Optimized: Fetch full record and PAN match in parallel
      const dataPromises = [];
      
      // 1. Always fetch full details for historical records (ensures rawResponse presence)
      if (record.id) {
        dataPromises.push(
          fetch(`${AADHAAR_API_BASE}/history/${record.id}`, {
            headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
          }).then(r => r.ok ? r.json() : null)
        );
      } else {
        dataPromises.push(Promise.resolve(record));
      }

      const [updatedRecord] = await Promise.all(dataPromises);
      if (updatedRecord) {
        fullRecord = updatedRecord;
        if (fullRecord.panNo) {
          panMatchResult = { isMatch: true, panNo: fullRecord.panNo };
        }
      }

      // Prepare PAN extraction and secondary re-verification ONLY if missing from DB
      let raw = {};
      try { raw = JSON.parse(fullRecord.rawResponse || '{}'); } catch (e) { }
      const d = raw.data || raw || {};
      const name = fullRecord.name || d.full_name || d.name || 'N/A';

      if (!panMatchResult.isMatch) {
         const panRaw = d.pan_number || d.panNo || d.pan || d.pan_no || '';
         let extractedPan = panRaw;
         if (!extractedPan || extractedPan === 'N/A') {
           const panMatchReg = (fullRecord.rawResponse || '').match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/);
           if (panMatchReg) extractedPan = panMatchReg[0];
         }
         if (typeof extractedPan === 'string' && extractedPan.startsWith('pan_number:')) {
           extractedPan = extractedPan.replace('pan_number:', '');
         }

         // 2. Fetch PAN match (Search by direct PAN or fallback to strictly Name search)
         const params = new URLSearchParams({ name });
         if (extractedPan && extractedPan !== 'N/A') {
           params.append('pan', extractedPan);
         }
         
         const pmResp = await fetch(`${AADHAAR_API_BASE}/check-pan-match?${params.toString()}`, {
           headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
         });
         
         if (pmResp.ok) {
           panMatchResult = await pmResp.json();
           if (!extractedPan || extractedPan === 'N/A') {
              extractedPan = panMatchResult.panNo; // Ensure we have the PAN string to print
           }
         }
      }

      const aadhaar = fullRecord.aadhaarNo || d.aadhaar_number || d.adharNo || 'N/A';
      const dob = fullRecord.dob || d.dob || d.dob_date || 'N/A';
      const gender = fullRecord.gender || d.gender || 'N/A';
      const address = fullRecord.address || 'N/A';
      const photo = fullRecord.photo || d.profile_image || d.photo || '';
      const bankName = clientInfo?.name || 'Authorized Bank';

      const printContainer = document.createElement('div');
      printContainer.style.position = 'absolute';
      printContainer.style.left = '-9999px';

      printContainer.innerHTML = `
        <div id="pdf-content" style="width: 210mm; min-height: 296mm; padding: 25mm 20mm; font-family: sans-serif; color: #000; background: white; box-sizing: border-box; position: relative;">
          <!-- Content Border -->
          <div style="position: absolute; top: 10mm; left: 10mm; right: 10mm; bottom: 10mm; border: 4px solid #000; pointer-events: none;"></div>

          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #000;">${bankName}</h1>
            <h3 style="margin: 10px 0 5px; font-size: 18px; font-weight: bold;">Aadhar And Pan Verification Certificate</h3>
            <h4 style="margin: 0; font-size: 15px; font-weight: bold;">TO WHOMSOEVER IT MAY CONCERN</h4>
          </div>

          <p style="font-size: 15px; line-height: 1.6; margin-bottom: 25px;">
            This is to Certify that <strong>${name}</strong> Adhar no. <strong>${aadhaar}</strong> are verified form 
            <span style="color: blue; text-decoration: underline;">https://uidai.gov.in/</span> using with OTP 
            ${panMatchResult.isMatch ? `and also verified Pan No. <strong>${panMatchResult.panNo}</strong>` : ''}
          </p>

          <div style="border: 2px solid #000; display: flex; margin-bottom: 40px;">
            <div style="flex: 1; padding: 20px; border-right: 2px solid #000;">
              <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
                <tr><td style="padding: 6px 0; font-weight: bold;">Name : ${name}</td></tr>
                <tr><td style="padding: 6px 0; font-weight: bold;">Adhar Number : ${aadhaar}</td></tr>
                ${panMatchResult.isMatch ? `
                <tr><td style="padding: 6px 0; font-weight: bold;">Pan Number : ${panMatchResult.panNo}</td></tr>
                <tr><td style="padding: 6px 0; font-weight: bold; color: green;">PAN Verified Successfully</td></tr>
                ` : ''}
                <tr><td style="padding: 6px 0; font-weight: bold;">DOB : ${dob}</td></tr>
                <tr><td style="padding: 6px 0; font-weight: bold;">Gender : ${gender}</td></tr>
                <tr><td style="padding: 6px 0; font-weight: bold; line-height: 1.4;">Address : ${address}</td></tr>
              </table>
            </div>
            <div style="width: 200px; display: flex; align-items: center; justify-content: center; background: #fff; padding: 15px;">
              ${photo ? `<img src="${photo}" style="max-width: 160px; max-height: 200px; object-fit: cover; border: 1px solid #ddd;" />` : `<div style="width: 140px; height: 170px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; color: #999;">Photo</div>`}
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; margin-top: 60px; font-size: 14px;">
            <div style="width: 45%;">
              <p style="font-weight: bold; margin-bottom: 40px;">(Signature of the Authorised Signatory)</p>
              <p>Name : ________________________</p>
              <p style="margin: 15px 0;">Designation : _________________</p>
              <p>Phone no. : ___________________</p>
              <p style="margin-top: 50px;">(Bank Seal)</p>
            </div>
            <div style="width: 45%;">
              <p style="font-weight: bold; margin-bottom: 40px;">(Signature of the Branch Manager)</p>
              <p>Name : ________________________</p>
              <p style="margin: 15px 0;">Designation : _________________</p>
              <p>Date : ________________________</p>
              <p style="margin-top: 50px; text-align: right; font-weight: bold;">Verified By: manager</p>
              <p style="text-align: right; font-weight: bold;"></p>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(printContainer);

      const opt = {
        margin: 0,
        filename: `Aadhar_Certificate_${aadhaar.slice(-4)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 1.6, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().from(printContainer.querySelector('#pdf-content')).set(opt).save();
      document.body.removeChild(printContainer);
    } catch (err) {
      console.error("PDF Error:", err);
      showToast("Error generating PDF: " + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (showAccountForm) {
    return (
      <CustomerAccountForm
        isOpen={true}
        onClose={() => setShowAccountForm(false)}
        initialData={selectedForAccount}
        onAccountCreated={fetchExistingAccounts}
      />
    );
  }

  if (reportModeData) {
    return (
      <CustomerAccountForm
        isOpen={true}
        onClose={() => setReportModeData(null)}
        initialData={reportModeData}
        readOnlyAndShowReport={true}
      />
    );
  }

  return (
    <div className="aadhar-module-v3">
      <div className="aadhar-grid">
        {/* Left Column: Form and Informational Cards */}
        <div className="vh-col-left">
          {/* Main Verification Form */}
          {step === 1 && (
            <div className="vh-card vh-form-card animate-fade-in">
              <div className="vh-card-header">
                <div className="vh-card-icon"><Fingerprint size={20} /></div>
                <div className="vh-card-titles">
                  <h2>Aadhaar Number</h2>
                  <p>UIDAI Authenticated Verification</p>
                </div>
              </div>
              <div className="vh-form-group">
                <label>Aadhaar Number</label>
                <div className="vh-input-wrap">
                  <Fingerprint className="vh-input-prefix" size={20} style={{ left: '0.8rem' }} />
                  <input
                    type="text"
                    value={aadhaarNumber}
                    onChange={handleAadhaarChange}
                    placeholder="Enter Aadhar No."
                    maxLength={14}
                    className="vh-input"
                    style={{ paddingLeft: '3rem' }}
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                  />
                </div>
                <span className="vh-hint">OTP will be sent to the registered mobile</span>
              </div>



              <div className="vh-form-group" style={{ marginBottom: '1rem' }}>
                <label className="checkbox-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'normal', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={agreedToAadhar}
                    onChange={(e) => setAgreedToAadhar(e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span>Click to agree to Aadhaar verification and continue your application.</span>
                </label>
              </div>

              {error && <div className="vh-alert error"><AlertCircle size={16} /> {error}</div>}
              <div className="vh-form-actions-wrap">
                <button className="vh-btn-teal" onClick={handleSendOtp} disabled={loading || aadhaarNumber.replace(/\s/g, '').length < 12 || !agreedToAadhar}>
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : <><Send size={18} /> Send OTP</>}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="vh-card vh-form-card animate-fade-in">
              <div className="vh-card-header">
                <div className="vh-card-icon"><ShieldCheck size={20} /></div>
                <div className="vh-card-titles">
                  <h2>OTP Verification</h2>
                  <p>Sent to Aadhaar ending in {aadhaarNumber.slice(-4)}</p>
                </div>
              </div>
              <div className="vh-form-group">
                <input
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="● ● ● ● ● ●"
                  maxLength={6}
                  className="vh-input otp-center"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
                />
              </div>
              <div className="vh-actions-space">
                <button className="vh-btn-text" onClick={() => { setStep(1); setOtp(''); setError(''); }}><ChevronLeft size={16} /> Back</button>
                {otpTimer > 0 ? <span className="vh-timer">Resend in {otpTimer}s</span> : <button className="vh-btn-link" onClick={handleResendOtp} disabled={loading}>Resend OTP</button>}
              </div>
              {error && <div className="vh-alert error"><AlertCircle size={16} /> {error}</div>}
              <div className="vh-form-actions-wrap">
                <button className="vh-btn-teal" onClick={handleVerifyOtp} disabled={loading || otp.length < 6}>
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Verifying...</> : <><ShieldCheck size={18} /> Verify OTP</>}
                </button>
              </div>
            </div>
          )}

          {step === 3 && aadhaarData && (
            <div className="vh-card vh-result-card animate-fade-in">
              <div className="vh-result-banner success">
                <CheckCircle2 size={18} /> Verification Successful
              </div>
              <div className="vh-result-body">
                <div className="vh-result-profile">
                  {aadhaarData.photo ? <img src={aadhaarData.photo} className="vh-profile-img" alt="photo" /> : <div className="vh-profile-placeholder"><User size={24} /></div>}
                  <div className="vh-profile-info">
                    <h3>{aadhaarData.fullName}</h3>
                    <p>{aadhaarData.aadhaarNo}</p>
                    <span className="vh-badge-verified"><ShieldCheck size={10} /> Verified</span>
                  </div>
                </div>
                <div className="vh-details-grid">
                  <div className="vh-detail-item"><label>DOB</label><span>{aadhaarData.dob}</span></div>
                  <div className="vh-detail-item"><label>Gender</label><span>{aadhaarData.gender}</span></div>
                  {aadhaarData.panMatchResult?.isMatch && (
                    <div className="vh-detail-item success"><label>PAN No.</label><span>{aadhaarData.panMatchResult.panNo}</span></div>
                  )}
                </div>
                <div className="vh-result-actions" style={{ display: 'flex', flexDirection: 'row', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                  <button className="vh-btn-outline" style={{ flex: 1, margin: 0, minWidth: '160px' }} onClick={handleReset}>
                    <RotateCcw size={18} /> New Verification
                  </button>
                  
                  {capturedImage && (
                    <button className="vh-btn-teal" style={{ flex: 1, margin: 0, minWidth: '200px', background: '#842020' }} onClick={() => handleDownloadEKycPdf(aadhaarData)}>
                      <FileText size={18} /> Download Certificate
                    </button>
                  )}
                  
                  {!capturedImage ? (
                    <button 
                      className="vh-btn-secondary-v3" 
                      style={{ 
                        flex: 1, 
                        background: isLocationFetching ? '#94a3b8' : '#6366f1', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '10px', 
                        padding: '0.85rem', 
                        fontWeight: '600', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '0.5rem', 
                        margin: 0, 
                        minWidth: '200px',
                        cursor: isLocationFetching ? 'not-allowed' : 'pointer'
                      }} 
                      onClick={startCamera}
                      disabled={isLocationFetching}
                    >
                      {isLocationFetching ? <><Loader2 size={18} className="animate-spin" /> Fetching location...</> : <><Camera size={18} /> Capture Photo</>}
                    </button>
                  ) : (
                    <div className="captured-preview-v3" style={{ flex: 'none', width: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.5rem', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                        <img src={capturedImage} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px', border: '1px solid #209677' }} alt="captured" />
                        <button onClick={() => setCapturedImage(null)} style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <X size={10} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {showCamera && (
                  <div className="vh-camera-overlay">
                    <div className="vh-camera-modal">
                      <div className="vh-camera-header">
                        <h3>Capture Identity Photo</h3>
                        <button onClick={stopCamera}><X size={20} /></button>
                      </div>
                      <div className="vh-camera-view">
                        <video id="camera-preview" autoPlay playsInline muted ref={el => { if (el && cameraStream) el.srcObject = cameraStream; }} />
                        <div className="camera-frame-guide"></div>
                      </div>
                      <div className="vh-camera-footer">
                        <div className="vh-camera-controls">
                          {devices.length > 1 && (
                            <div className="vh-camera-selector">
                              <select 
                                value={selectedDeviceId} 
                                onChange={(e) => startCamera(e.target.value)}
                              >
                                {devices.map((d, index) => (
                                  <option key={d.deviceId || index} value={d.deviceId}>
                                    {d.label || `Camera ${index + 1}`}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                          <button className="vh-btn-capture" onClick={capturePhoto}>
                            <div className="capture-inner"></div>
                          </button>
                        </div>
                        <p>Position face within the frame and capture</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Verification Process Card */}
          <div className="vh-card vh-process-card">
            <div className="vh-process-header">
              <h3>VERIFICATION PROCESS</h3>
              <p>Simple, secure, and instant</p>
            </div>
            <div className="vh-stepper">
              <div className="vh-step-item active">
                <div className="vh-step-circle"><FileText size={18} /></div>
                <span>Input Data</span>
              </div>
              <div className="vh-step-line" />
              <div className={`vh-step-item ${step >= 2 ? 'active' : ''}`}>
                <div className="vh-step-circle"><ShieldCheck size={18} /></div>
                <span>Secure Auth</span>
              </div>
              <div className="vh-step-line" />
              <div className={`vh-step-item ${step >= 3 ? 'active' : ''}`}>
                <div className="vh-step-circle"><CheckCircle2 size={18} /></div>
                <span>Get Results</span>
              </div>
            </div>
          </div>

          {/* Trusted Badges Grid */}
          {/* <div className="vh-features-grid">
            <div className="vh-feature-card">
              <div className="vh-feature-icon"><ShieldCheck size={18} /></div>
              <div className="vh-feature-text">
                <h4>256-Bit Encryption</h4>
                <p>End-to-end encrypted</p>
              </div>
            </div>
            <div className="vh-feature-card">
              <div className="vh-feature-icon"><CheckCircle2 size={18} /></div>
              <div className="vh-feature-text">
                <h4>100% Compliant</h4>
                <p>RBI & Govt standard</p>
              </div>
            </div>
            <div className="vh-feature-card">
              <div className="vh-feature-icon"><RotateCcw size={18} /></div>
              <div className="vh-feature-text">
                <h4>No Data Retention</h4>
                <p>No PII stored</p>
              </div>
            </div>
            <div className="vh-feature-card">
              <div className="vh-feature-icon"><Smartphone size={18} /></div>
              <div className="vh-feature-text">
                <h4>Real-Time</h4>
                <p>Ultra-fast API</p>
              </div>
            </div>
          </div> */}
        </div>

        {/* Right Column: History */}
        <div className="vh-col-right">
          <div className="vh-card vh-history-card">
            <div className="vh-history-header">
              <h3>Recent Verifications</h3>
              <div className="vh-search-wrap">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="vh-history-body">
              <table className="vh-table">
                <thead>
                  <tr>
                    <th>NAME</th>
                    <th>AADHAAR</th>
                    <th>DATE</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {historyLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td colSpan="4">
                          <div className="skeleton skeleton-table-row" style={{ height: '40px', margin: '4px 0' }}></div>
                        </td>
                      </tr>
                    ))
                  ) : currentRecords.length > 0 ? currentRecords.map(record => (
                    <tr key={record.id || record.aadhaarNo + Math.random()}>
                      <td className="vh-td-name">{record.name}</td>
                      <td className="vh-td-code">{getFullAadhaar(record)}</td>
                      <td className="vh-td-date">{new Date(record.verifiedAt).toLocaleDateString()} {new Date(record.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>
                        <div className="vh-td-actions">
                          <button onClick={() => handleDownloadPdf(record)} title="Download Aadhaar Document"><Download size={16} /></button>
                          <button onClick={() => handleDownloadEKycPdf(record)} title="Download e-KYC Certificate"><FileText size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" className="vh-no-data">No history available</td></tr>
                  )}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="vh-table-footer">
                  <span className="vh-page-info">Page {currentPage} of {totalPages}</span>
                  <div className="vh-pagination">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Prev</button>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
