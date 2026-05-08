import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { sendMessage as apiSendMessage } from '../services/api'
import API_BASE_URL from '../config'

const AppContext = createContext(null)

const STORAGE_KEY = 'tushgpt_conversations'
const SETTINGS_KEY = 'tushgpt_groq_config'
const THEME_KEY = 'tushgpt_theme'

const DEFAULT_SETTINGS = {
  model: 'llama-3.3-70b-versatile',
}

function generateTitle(text) {
  return text.trim().slice(0, 42) + (text.length > 42 ? '…' : '')
}

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    const decoded = JSON.parse(jsonPayload)
    return {
      userId: decoded.sub || decoded.nameid || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
      name: decoded.unique_name || decoded.name || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
      clientCode: decoded.ClientCode || decoded.clientCode || decoded.ClientId || decoded.clientid,
      role: decoded.Role || decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
      clientIp: decoded.ClientIp || decoded.clientIp || decoded.clientip,
      lastLogin: decoded.LastLogin || decoded.lastLogin || decoded.lastlogin,
      impersonated: decoded.Impersonated || decoded.impersonated,
      originalRole: decoded.OriginalRole || decoded.originalRole
    }
  } catch (e) {
    return null
  }
}

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    // Removed console.error
  }
}

function loadSettings() {
  const saved = loadFromStorage(SETTINGS_KEY, DEFAULT_SETTINGS)
  // Fallback to default if the saved model isn't a valid Groq one
  const isGroqModel = saved?.model?.includes('llama') || saved?.model?.includes('mixtral')
  const model = isGroqModel ? saved.model : DEFAULT_SETTINGS.model
  
  return { ...DEFAULT_SETTINGS, model }
}

const REPORTS_KEY = 'tushgpt_reports'

export function AppProvider({ children }) {
  const [conversations, setConversations] = useState(() =>
    loadFromStorage(STORAGE_KEY, [])
  )
  const [reports, setReports] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const [settings, setSettings] = useState(loadSettings)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [theme, setTheme] = useState(() => 
    localStorage.getItem(THEME_KEY) || 'light'
  )
  const [balance, setBalance] = useState(0)
  const [clientInfo, setClientInfo] = useState(null)

  const showToast = useCallback((message, type = 'info') => {
    const id = uuidv4();
    setNotifications(prev => {
      // Prevent exact duplicate messages from stacking
      const filtered = prev.filter(n => n.message !== message);
      // Limit to 3 toasts at a time to avoid screen clutter
      const limited = filtered.slice(-2); 
      return [...limited, { id, message, type }];
    });
  }, []);

  const removeToast = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Persist conversations
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
  }, [conversations])

  // Persist reports (Client Specific)
  useEffect(() => {
    if (user?.clientCode) {
      const clientKey = `tushgpt_reports_${user.clientCode}`
      localStorage.setItem(clientKey, JSON.stringify(reports))
    }
  }, [reports, user])

  // Load reports from storage when user changes
  useEffect(() => {
    if (user?.clientCode) {
      const clientKey = `tushgpt_reports_${user.clientCode}`
      const saved = loadFromStorage(clientKey, [])
      setReports(saved)
      
      // Cleanup old global key if it exists
      if (localStorage.getItem('tushgpt_reports')) {
        localStorage.removeItem('tushgpt_reports')
      }
    } else {
      setReports([])
    }
  }, [user])

  // Persist settings
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])

  // Persist theme
  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  // Handle Initial Token Load
  useEffect(() => {
    const token = sessionStorage.getItem('tushgpt_jwt')
    if (token) {
      const decoded = parseJwt(token)
      if (decoded) setUser(decoded)
    }
  }, [])

  const fetchBalance = useCallback(async () => {
    const token = sessionStorage.getItem('tushgpt_jwt');
    if (!token || !user) return;
    try {
      const resp = await fetch(`${API_BASE_URL}/Credit/balance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        setBalance(data.balance || 0);
      }
    } catch (err) {}
  }, [user]);

  const refreshReports = useCallback(async () => {
    const token = sessionStorage.getItem('tushgpt_jwt');
    if (!token || !user) return;
    try {
      const response = await fetch(`${API_BASE_URL}/reports`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const parsed = data.map(r => ({
            ...JSON.parse(r.dataJson),
            dbId: r.id
          }));
          setReports(parsed);
        } else {
          setReports([]);
        }
      }
    } catch (err) { }
  }, [user]);

  const fetchClientInfo = useCallback(async () => {
    const token = sessionStorage.getItem('tushgpt_jwt');
    if (!token || !user?.clientCode) {
      setClientInfo(null);
      return;
    }
    // Handle GLOBAL client code (Super Admin)
    if (user.clientCode === 'GLOBAL') {
      setClientInfo({
        name: 'AVS AI 360 Admin',
        logoUrl: '',
        clientCode: 'GLOBAL'
      });
      return;
    }

    try {
      const resp = await fetch(`${API_BASE_URL}/Client/${user.clientCode}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        setClientInfo(data);
      } else {
        // Fallback for failed fetch (e.g. 404)
        setClientInfo({
          name: 'AVS AI 360',
          logoUrl: '',
          clientCode: user.clientCode
        });
      }
    } catch (err) {
      setClientInfo({
        name: 'AVS AI 360',
        logoUrl: '',
        clientCode: user.clientCode
      });
    }
  }, [user]);

  // Fetch balance & client info from DB on mount and user change (Global Shell Data)
  useEffect(() => {
    const fetchGlobalData = async () => {
      const token = sessionStorage.getItem('tushgpt_jwt');
      if (!token || !user) return;
      fetchBalance();
      fetchClientInfo();
    };
    fetchGlobalData();
  }, [user, fetchBalance, fetchClientInfo]);

  const addReport = async (newReport) => {
    // 1. Update UI immediately (Optimistic)
    setReports(prev => {
      const existingIdx = prev.findIndex(r => r.appId === newReport.appId);
      let updated;
      if (existingIdx !== -1) {
        updated = [...prev];
        updated[existingIdx] = newReport;
      } else {
        updated = [newReport, ...prev];
      }
      if (user?.clientCode) {
        const clientKey = `tushgpt_reports_${user.clientCode}`
        saveToStorage(clientKey, updated);
      }
      return updated;
    });

    // 2. Sync to DB
    const token = sessionStorage.getItem('tushgpt_jwt');
    try {
      const response = await fetch(`${API_BASE_URL}/reports`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          appId: newReport.appId,
          memberName: newReport.input.memberName,
          dataJson: JSON.stringify(newReport),
          createdBy: 'System'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        showToast(errorData.message || 'डेटाबेसमध्ये माहिती साठवण्यात अडचण आली.', 'error');
      } else {
        showToast('माहिती यशस्वीरित्या साठवली गेली.', 'success');
      }
    } catch (err) { 
      showToast('सर्व्हरशी संपर्क होऊ शकला नाही.', 'error');
    }
  }

  const login = (token) => {
    sessionStorage.setItem('tushgpt_jwt', token)
    const decoded = parseJwt(token)
    if (decoded) setUser(decoded)
  }

  const switchSession = (token) => {
    sessionStorage.setItem('tushgpt_jwt', token);
    window.location.reload(); // Refresh to clear all context states
  }

  const logout = () => {
    sessionStorage.removeItem('tushgpt_jwt')
    if (user?.clientCode) {
      localStorage.removeItem(`tushgpt_reports_${user.clientCode}`)
    }
    setReports([])
    setUser(null)
    window.location.href = '/' // Force redirect to root on logout
  }

  const createConversation = useCallback(() => {
    const id = uuidv4()
    const newConv = {
      id,
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setConversations(prev => [newConv, ...prev])
    setActiveId(id)
    setError(null)
    return id
  }, [])

  const deleteConversation = useCallback((id) => {
    setConversations(prev => prev.filter(c => c.id !== id))
    setActiveId(prev => (prev === id ? null : prev))
  }, [])

  const activeConversation = conversations.find(c => c.id === activeId) || null

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return

    let convId = activeId
    if (!convId) {
      convId = uuidv4()
      const newConv = {
        id: convId,
        title: generateTitle(text),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      setConversations(prev => [newConv, ...prev])
      setActiveId(convId)
    }

    const userMsg = {
      id: uuidv4(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }

    setConversations(prev =>
      prev.map(c => {
        if (c.id !== convId) return c
        const updated = {
          ...c,
          messages: [...c.messages, userMsg],
          updatedAt: Date.now(),
          title: c.title === 'New Chat' ? generateTitle(text) : c.title,
        }
        return updated
      })
    )

    try {
      setIsLoading(true)
      setError(null)

      const conv = conversations.find(c => c.id === convId)
      const history = conv ? conv.messages : []
      const allMessages = [...history, userMsg]

      const assistantId = uuidv4()
      const initialAssistantMsg = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      }

      setConversations(prev =>
        prev.map(c => {
          if (c.id !== convId) return c
          return {
            ...c,
            messages: [...c.messages, initialAssistantMsg],
            updatedAt: Date.now(),
          }
        })
      )

      await apiSendMessage(allMessages, settings, (chunkText) => {
        setConversations(prev =>
          prev.map(c => {
            if (c.id !== convId) return c
            return {
              ...c,
              messages: c.messages.map(m =>
                m.id === assistantId ? { ...m, content: m.content + chunkText } : m
              ),
              updatedAt: Date.now(),
            }
          })
        )
      })
    } catch (err) {
      setError(err.message || 'Failed to get response')
    } finally {
      setIsLoading(false)
    }
  }, [activeId, conversations, settings])

  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  return (
    <AppContext.Provider value={{
      conversations,
      reports,
      refreshReports,
      activeId,
      setActiveId,
      activeConversation,
      createConversation,
      deleteConversation,
      addReport,
      selectedReport,
      setSelectedReport,
      sendMessage,
      isLoading,
      error,
      setError,
      settings,
      updateSettings,
      notifications,
      showToast,
      removeToast,
      theme,
      toggleTheme,
      user,
      login,
      logout,
      switchSession,
      balance,
      fetchBalance,
      clientInfo,
      setClientInfo,
      fetchClientInfo
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
