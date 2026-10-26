import { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  HiSparkles, 
  HiPaperAirplane, 
  HiPlus, 
  HiTrash, 
  HiClipboard, 
  HiCheck, 
  HiArrowPath, 
  HiMagnifyingGlass,
  HiCpuChip,
  HiDocumentText,
  HiPaperClip,
  HiArrowDownTray,
  HiPhoto,
  HiChatBubbleBottomCenterText,
  HiArrowsPointingOut,
  HiBolt,
  HiAdjustmentsHorizontal,
  HiPaintBrush,
  HiXMark
} from 'react-icons/hi2';
import { useAuth } from '../contexts/AuthContext';
import { getConversations, saveConversation, deleteConversation, checkQuota, recordAIQuery } from '../services/dataService';
import { sendMessage, streamMessage, AI_MODELS, getAIConfig, saveAIConfig } from '../lib/ai';
import { 
  exportToPDF, 
  exportToWord, 
  generateAIImageUrl, 
  downloadImageAsBlob,
  IMAGE_STYLES,
  ASPECT_RATIOS,
  IMAGE_MODELS,
  DEFAULT_SHOWCASE_IMAGES
} from '../lib/aiDocumentGenerator';
import toast from 'react-hot-toast';

export default function AIAssistant() {
  const { user } = useAuth();
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [selectedModel, setSelectedModel] = useState(() => getAIConfig().model || 'gemini-3.5-flash-lite');
  const [searchQuery, setSearchQuery] = useState('');
  const [quotaInfo, setQuotaInfo] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => getAIConfig().apiKey || '');
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'image'
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageStyle, setImageStyle] = useState('photorealistic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageModel, setImageModel] = useState('turbo');
  const [autoEnhance, setAutoEnhance] = useState(true);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [loadedImageMap, setLoadedImageMap] = useState(() => {
    const map = {};
    DEFAULT_SHOWCASE_IMAGES.forEach(img => {
      map[img.id] = true;
    });
    return map;
  });

  // Gallery initialized from localStorage with high-res showcase presets
  const [generatedImages, setGeneratedImages] = useState(() => {
    try {
      const saved = localStorage.getItem('nexora_ai_studio_gallery');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_SHOWCASE_IMAGES;
    } catch {
      return DEFAULT_SHOWCASE_IMAGES;
    }
  });

  const messagesEndRef = useRef(null);

  async function loadQuota() {
    try {
      const q = await checkQuota('ai');
      setQuotaInfo(q);
    } catch (e) {}
  }

  // Initialize conversations
  useEffect(() => {
    loadConversations();
    loadQuota();
  }, []);

  // Listen for query params e.g. from Dashboard quick prompt
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      handleSendPrompt(q);
    }
  }, [location.search]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  async function loadConversations() {
    const list = await getConversations();
    setConversations(list);
    if (list.length > 0) {
      setActiveConvId(list[0].id);
      setMessages(list[0].messages || []);
    } else {
      startNewConversation();
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function startNewConversation() {
    const newConv = {
      id: 'conv-' + Date.now(),
      title: 'New Strategy Session',
      createdAt: new Date().toISOString(),
      messages: [
        {
          role: 'assistant',
          content: `👋 Hello ${user?.name || 'there'}! I am **NEXORA AI**, your intelligent co-pilot.\n\nI can help you:\n- **Decompose projects** into high-priority tasks and subtasks\n- **Analyze sprint bottlenecks** and suggest timeline realignments\n- **Draft technical specifications**, user stories, and architecture docs\n- **Write & debug code** with clean syntax highlighting\n\nWhat are we building or optimizing today?`
        }
      ]
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConvId(newConv.id);
    setMessages(newConv.messages);
    saveConversation(newConv);
  }

  function handleSelectConversation(conv) {
    setActiveConvId(conv.id);
    setMessages(conv.messages || []);
  }

  async function handleDeleteConversation(e, id) {
    e.stopPropagation();
    await deleteConversation(id);
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    if (activeConvId === id) {
      if (updated.length > 0) {
        setActiveConvId(updated[0].id);
        setMessages(updated[0].messages || []);
      } else {
        startNewConversation();
      }
    }
    toast.success('Conversation removed');
  }

  async function handleSendPrompt(promptText) {
    const textToSend = promptText || input;
    if (!textToSend.trim() || loading) return;

    try {
      const quota = await checkQuota('ai');
      if (!quota.allowed) {
        toast.error(`Plan limit: You have reached ${quota.current}/${quota.max} AI queries this month on ${quota.planName}. Upgrade in Subscriptions!`);
        return;
      }
      await recordAIQuery();
      loadQuota();
    } catch (e) {}

    const userMsg = { role: 'user', content: textToSend };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    setStreamingText('');

    // Update conversation title if first user prompt
    const currentConv = conversations.find(c => c.id === activeConvId);
    if (currentConv && currentConv.title === 'New Strategy Session') {
      currentConv.title = textToSend.slice(0, 32) + (textToSend.length > 32 ? '...' : '');
    }

    try {
      let aiResponseText = '';

      // Auto-detect provider from selected model
      const isOpenAI = selectedModel.startsWith('gpt-');
      const provider = isOpenAI ? 'openai' : 'gemini';
      
      // Try streaming first, fallback to standard call if stream stalls
      try {
        const stream = streamMessage(updatedMessages, { model: selectedModel, provider });
        for await (const chunk of stream) {
          aiResponseText += chunk;
          setStreamingText(aiResponseText);
        }
      } catch (streamErr) {
        console.warn('Stream failed or unsupported, using standard API call:', streamErr);
        aiResponseText = await sendMessage(updatedMessages, { model: selectedModel, provider });
        setStreamingText(aiResponseText);
      }

      if (!aiResponseText.trim()) {
        aiResponseText = await sendMessage(updatedMessages, { model: selectedModel, provider });
      }

      const assistantMsg = { role: 'assistant', content: aiResponseText };
      const finalMessages = [...updatedMessages, assistantMsg];
      setMessages(finalMessages);
      setStreamingText('');

      if (currentConv) {
        currentConv.messages = finalMessages;
        await saveConversation(currentConv);
      }
    } catch (error) {
      console.error(error);
      const errMsg = error.message || 'Error communicating with AI service.';
      // Provide a helpful, user-friendly error without showing raw API jargon
      const friendlyMsg = errMsg.includes('not found') || errMsg.includes('no longer available')
        ? `⚠️ The selected model is not available for your API key. Please switch to **Gemini 3.5 Flash Lite** or **Gemini 3.5 Flash** from the model selector above and try again.`
        : `⚠️ AI error: ${errMsg}`;
      const fallbackMsg = { role: 'assistant', content: friendlyMsg };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
      setStreamingText('');
    }
  }

  function generateSmartAssistantReply(prompt) {
    const lower = prompt.toLowerCase();

    // Prompts / Website ideas / E-commerce
    if (lower.includes('perfume') || lower.includes('fragrance') || (lower.includes('website') && lower.includes('prompt'))) {
      return `### 🌸 Master Prompt for Luxury Perfume & Fragrance Website\n\nHere is a complete architectural specification you can copy-paste into your AI generator:\n\n\`\`\`markdown\nCreate an ultra-luxury E-Commerce Website for a premium fragrance brand named "AURA PERFUMES".\nStack: React 19 + Tailwind CSS + Framer Motion.\n\nVibe & Aesthetic:\n- Obsidian dark luxury mode with champagne gold accents (#D4AF37) and cream white typography.\n- Sensory fragrance discovery experience with interactive Scent Pyramids (Top, Heart, Base notes).\n\nKey Modules to Include:\n1. Hero: Cinematic background video banner, gold serif branding, "Explore Scents" & "Find Signature Scent" CTA.\n2. Scent Quiz: 3-step interactive question flow recommending the customer's ideal perfume profile.\n3. Product Catalog: Luxury bottle cards with Sillage/Longevity meters, price, 50ml/100ml selectors, and "Add to Bag".\n4. Scent Notes Matrix: Visual breakdown of Oud, Bergamot, Amber, Rose, and Vanilla notes.\n5. Customer Discovery Set: Upsell banner for 5-vial sampler set with redeemable voucher.\n6. Cart & Fast Checkout: Slide-over cart drawer with free luxury gift packaging option.\n\`\`\`\n\n*Would you like me to generate the full React component code for the Hero or Product Catalog next?*`;
    }

    if (lower.includes('prompt') || lower.includes('idea') || lower.includes('build')) {
      return `### 💡 Tailored Project Specification & Prompt\n\nHere is an executive prompt structured for your vision: **"${prompt.slice(0, 50)}"**\n\n- **Target Audience:** Modern professionals looking for high-end aesthetic experiences.\n- **Key Value Proposition:** Seamless UX, zero latency, responsive mobile-first architecture.\n- **Recommended Feature Set:**\n  1. Interactive visual showcase with real-time filters.\n  2. Fast 1-click onboarding flow.\n  3. Integrated analytics and performance dashboard.\n\n*Tell me which specific section or feature you'd like me to draft detailed code or copy for!*`;
    }

    if (lower.includes('task') || lower.includes('break') || lower.includes('decompose') || lower.includes('kanban')) {
      return `### 📋 Proposed Task Breakdown for: "${prompt.slice(0, 40)}..."\n\nHere is an actionable agile breakdown structured for your Kanban board:\n\n1. **Architecture & Contract Definition** (\`Priority: Urgent\`)\n   - Finalize JSON schema and interface contracts\n   - Setup unit test harness\n\n2. **Core Implementation & State Machine** (\`Priority: High\`)\n   - Integrate local persistence and optimistic UI updates\n   - Connect to Appwrite database collection\n\n3. **Quality Assurance & Performance Benchmarking** (\`Priority: Medium\`)\n   - Verify lighthouse performance score > 95\n   - Conduct regression testing across responsive viewports\n\n*Would you like me to push these tasks directly to your active project board?*`;
    }

    if (lower.includes('code') || lower.includes('react') || lower.includes('component') || lower.includes('function')) {
      return `Here is a clean, production-ready React implementation with Tailwind CSS:\n\n\`\`\`jsx\nimport { useState } from 'react';\n\nexport default function SmartTaskWidget({ title, initialCount = 0 }) {\n  const [count, setCount] = useState(initialCount);\n\n  return (\n    <div className="p-4 rounded-xl bg-navy-800 border border-white/10 text-white shadow-lg">\n      <h3 className="font-semibold text-sm mb-2 text-blue-400">{title}</h3>\n      <div className="flex items-center gap-3">\n        <button \n          onClick={() => setCount(c => c + 1)}\n          className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold transition-all shadow-md"\n        >\n          Resolved Tasks: {count}\n        </button>\n      </div>\n    </div>\n  );\n}\n\`\`\`\n\nThis follows our NEXORA design tokens and uses modern functional state management.`;
    }

    return `### NEXORA Workspace Assistant\n\nRegarding: **"${prompt}"**\n\n1. **Core Objective:** Establish high-clarity requirements and structured milestones.\n2. **Best Practice:** Keep user friction minimal and implement progressive disclosure for complex workflows.\n3. **Next Steps:**\n   - Define the data model and visual design system.\n   - Wire up real-time state management.\n   - Test responsive layout across mobile and desktop.`;
  }

  function handleCopy(content, idx) {
    navigator.clipboard.writeText(content);
    setCopiedId(idx);
    toast.success('Response copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleExportPDF(content, idx) {
    try {
      const currentConv = conversations.find(c => c.id === activeConvId);
      const title = currentConv?.title || 'NEXORA AI Document';
      toast.loading('Generating branded PDF...', { id: 'pdf-toast' });
      exportToPDF(title, content);
      toast.success('PDF downloaded successfully! 📄', { id: 'pdf-toast' });
    } catch (e) {
      toast.error('Failed to generate PDF', { id: 'pdf-toast' });
    }
  }

  async function handleExportWord(content, idx) {
    try {
      const currentConv = conversations.find(c => c.id === activeConvId);
      const title = currentConv?.title || 'NEXORA AI Document';
      toast.loading('Generating Word document...', { id: 'word-toast' });
      await exportToWord(title, content);
      toast.success('Word document (.docx) downloaded! 📝', { id: 'word-toast' });
    } catch (e) {
      toast.error('Failed to generate Word document', { id: 'word-toast' });
    }
  }

  async function handleGenerateImage(e, retryPrompt = null, retryOptions = null) {
    if (e) e.preventDefault();
    const promptToUse = (retryPrompt || imagePrompt).trim();
    if (!promptToUse || generatingImage) return;

    const tempId = 'img-' + Date.now();
    const selectedRatio = retryOptions?.aspectRatio || aspectRatio;
    const dims = ASPECT_RATIOS[selectedRatio] || ASPECT_RATIOS['1:1'];
    const selectedStyle = retryOptions?.style || imageStyle;
    const selectedModel = retryOptions?.model || imageModel;

    setGeneratingImage(true);

    try {
      const quota = await checkQuota('ai');
      if (!quota.allowed) {
        toast.error(`Plan limit: You have reached ${quota.current}/${quota.max} AI queries.`);
        setGeneratingImage(false);
        return;
      }
      await recordAIQuery();
      loadQuota();

      // Generate Image Config & URLs
      const imgData = generateAIImageUrl(promptToUse, {
        width: dims.width,
        height: dims.height,
        style: selectedStyle,
        model: selectedModel,
        enhance: autoEnhance
      });

      // Insert ready image into gallery immediately (browser streams image bytes directly)
      const newImg = {
        id: tempId,
        prompt: promptToUse,
        enhancedPrompt: imgData.enhancedPrompt,
        url: imgData.url,
        fallbackUrl: imgData.fallbackUrl,
        fallbackUrl2: imgData.fallbackUrl2,
        fallbackPhoto: imgData.fallbackPhoto,
        style: selectedStyle,
        aspectRatio: selectedRatio,
        model: selectedModel,
        status: 'ready',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        width: dims.width,
        height: dims.height,
        seed: imgData.seed
      };

      setGeneratedImages(prev => {
        const updated = [newImg, ...prev.filter(i => i.id !== tempId)].slice(0, 30);
        try {
          localStorage.setItem('nexora_ai_studio_gallery', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      if (!retryPrompt) setImagePrompt('');
      toast.success('Rendering 4K AI visual! 🎨');
    } catch (err) {
      console.error('Image Generation Error:', err);
      toast.error('Image generation request failed. Please try again.');
    } finally {
      setGeneratingImage(false);
    }
  }

  async function handleDownloadImage(img) {
    setDownloadingId(img.id);
    toast.loading('Downloading 4K HD image...', { id: 'img-dl' });
    try {
      const filename = `nexora_${img.style || 'art'}_${img.id}.jpg`;
      const success = await downloadImageAsBlob(img.url, filename);
      if (success) {
        toast.success('Downloaded to your device! 💾', { id: 'img-dl' });
      } else {
        toast.dismiss('img-dl');
      }
    } catch {
      toast.error('Download failed', { id: 'img-dl' });
    } finally {
      setDownloadingId(null);
    }
  }

  function handleRegenerate(img) {
    handleGenerateImage(null, img.prompt, {
      style: img.style,
      aspectRatio: img.aspectRatio,
      model: img.model
    });
  }

  function handleDeleteImage(id) {
    setGeneratedImages(prev => {
      const updated = prev.filter(i => i.id !== id);
      try {
        localStorage.setItem('nexora_ai_studio_gallery', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    toast.success('Image removed from gallery');
  }

  function handleClearGallery() {
    if (window.confirm('Reset gallery to default showcase artwork?')) {
      setGeneratedImages(DEFAULT_SHOWCASE_IMAGES);
      localStorage.removeItem('nexora_ai_studio_gallery');
      toast.success('Gallery reset to showcase presets');
    }
  }

  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-7.5rem)] flex rounded-2xl bg-navy-900 border border-white/10 overflow-hidden shadow-2xl">
      {/* Sidebar: Conversation History */}
      <div className="w-72 bg-navy-950/80 border-r border-white/10 flex flex-col shrink-0 hidden md:flex">
        {/* New Chat Button */}
        <div className="p-3.5 border-b border-white/10 space-y-3">
          <button
            onClick={startNewConversation}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
          >
            <HiPlus className="w-4 h-4" /> New Conversation
          </button>

          <div className="relative">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* List of past conversations */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredConversations.map(conv => {
            const isActive = conv.id === activeConvId;
            return (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={`w-full group flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white/10 text-white font-medium border border-white/10'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <HiDocumentText className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-gray-500'}`} />
                  <span className="truncate">{conv.title}</span>
                </div>
                <button
                  onClick={e => handleDeleteConversation(e, conv.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 rounded transition-opacity"
                  title="Delete chat"
                >
                  <HiTrash className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col bg-navy-900/60 overflow-hidden">
        {/* Chat Header with Super AI Suite Modes */}
        <div className="h-14 px-4 sm:px-6 border-b border-white/10 flex items-center justify-between bg-navy-950/40">
          <div className="flex items-center gap-3">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center p-1 bg-white/5 rounded-xl border border-white/10">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'chat'
                    ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <HiChatBubbleBottomCenterText className="w-3.5 h-3.5" />
                <span>AI Docs & Chat</span>
              </button>
              <button
                onClick={() => setActiveTab('image')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'image'
                    ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <HiPhoto className="w-3.5 h-3.5" />
                <span>AI Image Studio</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30">HD</span>
              </button>
            </div>

            {quotaInfo && (
              <Link
                to="/subscriptions"
                className="hidden lg:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] text-violet-300 font-medium hover:bg-violet-500/20 transition"
                title="View Resource Quotas in Subscriptions"
              >
                <span>{quotaInfo.current} / {quotaInfo.max} credits</span>
              </Link>
            )}
          </div>

          {/* Model Selector & Admin Settings */}
          <div className="flex items-center gap-2">
            <HiCpuChip className="w-4 h-4 text-violet-400" />
            <select
              value={selectedModel}
              onChange={e => { setSelectedModel(e.target.value); saveAIConfig({ model: e.target.value }); }}
              className="bg-navy-800 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash Lite (Fastest & Stable)</option>
              <option value="gemini-3.5-flash">Gemini 3.5 Flash (Deep Reasoning)</option>
              <option value="gemini-3.8-flash">Gemini 3.8 Flash (Flagship)</option>
            </select>
            {/* API Key management is restricted ONLY to Admin (wa363969@gmail.com) */}
            {user?.email?.toLowerCase() === 'wa363969@gmail.com' && (
              <button
                onClick={() => setShowSettings(s => !s)}
                className={`p-1.5 rounded-lg border transition-all text-xs font-bold ${
                  getAIConfig().hasKey
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20 animate-pulse'
                }`}
                title={getAIConfig().hasKey ? 'Admin Master AI Key Connected ✓' : 'Admin: Configure Master AI Key'}
              >
                🔑 Admin Key
              </button>
            )}
          </div>
        </div>

        {/* Admin AI Key Settings Panel - ONLY for Admin */}
        {showSettings && user?.email?.toLowerCase() === 'wa363969@gmail.com' && (
          <div className="mx-4 sm:mx-6 mt-3 p-4 rounded-xl bg-navy-950/80 border border-white/10 space-y-3 animate-in slide-in-from-top">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              🔑 Admin Master AI Key Configuration
              <span className="text-[10px] text-gray-400">(This key powers the AI Co-Pilot for all clients)</span>
            </h4>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKeyInput}
                onChange={e => setApiKeyInput(e.target.value)}
                placeholder="Paste Gemini API key here (AIzaSy...)"
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <button
                onClick={() => {
                  if (!apiKeyInput.trim()) {
                    toast.error('API key is empty!');
                    return;
                  }
                  saveAIConfig({ apiKey: apiKeyInput.trim() });
                  toast.success('✅ Master AI Key saved! All clients can now use the AI seamlessly.');
                  setShowSettings(false);
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shrink-0"
              >
                Save Master Key
              </button>
            </div>
            <div className="text-[11px] text-gray-400 space-y-1">
              <p>🔒 <strong>Secure:</strong> Regular clients will never see this panel or key. They just type and get instant AI responses.</p>
              {getAIConfig().hasKey && (
                <p className="text-emerald-400 font-medium">✅ Master Key Active — Platform AI is live for all users!</p>
              )}
            </div>
          </div>
        )}
        {/* Main Body: Either Chat or Image Studio */}
        {activeTab === 'image' ? (
          <div className="flex-1 flex flex-col overflow-hidden bg-navy-950/60">
            {/* Image Studio Compact Generator Command Bar */}
            <div className="p-3 sm:p-4 border-b border-white/10 bg-navy-900/90 backdrop-blur-md space-y-2.5 shrink-0">
              <div className="max-w-5xl mx-auto space-y-2.5">
                {/* Header Title & Mode Toggles */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20 shrink-0">
                      <HiPhoto className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                        NEXORA AI Image Studio
                        <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                          4K HD
                        </span>
                      </h3>
                      <p className="text-[11px] text-gray-400 hidden sm:block">
                        Generate production-ready artwork, logos & concepts in English or Roman Urdu.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Ratio Pills */}
                    <div className="hidden md:flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
                      {Object.values(ASPECT_RATIOS).map(ar => (
                        <button
                          key={ar.id}
                          type="button"
                          onClick={() => setAspectRatio(ar.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                            aspectRatio === ar.id
                              ? 'bg-blue-600 text-white shadow'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {ar.id}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleClearGallery}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-[11px] font-medium transition border border-white/10"
                      title="Reset gallery to default showcase artwork"
                    >
                      Reset Gallery
                    </button>
                  </div>
                </div>

                {/* Primary Prompt Form */}
                <form onSubmit={handleGenerateImage} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={imagePrompt}
                      onChange={e => setImagePrompt(e.target.value)}
                      placeholder="Describe what you want: e.g. 'Luxury modern car', 'Cyberpunk city', 'Minimalist logo'..."
                      disabled={generatingImage}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-white/15 text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:opacity-50 transition"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={generatingImage || !imagePrompt.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-pink-500/25 disabled:opacity-50 shrink-0 cursor-pointer"
                  >
                    {generatingImage ? (
                      <>
                        <HiArrowPath className="w-4 h-4 animate-spin" />
                        <span>Rendering...</span>
                      </>
                    ) : (
                      <>
                        <HiSparkles className="w-4 h-4" />
                        <span>Generate 4K</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Visual Styles Scroll Bar & Quick Idea Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-0.5 custom-scrollbar">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 shrink-0 flex items-center gap-1">
                    <HiPaintBrush className="w-3 h-3 text-pink-400" /> Style:
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {Object.values(IMAGE_STYLES).map(st => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setImageStyle(st.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all border ${
                          imageStyle === st.id
                            ? 'bg-gradient-to-r from-pink-500/25 to-purple-500/25 text-white border-pink-500 shadow-sm'
                            : 'bg-white/[0.03] text-gray-400 hover:text-white border-white/10 hover:border-white/20'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  <span className="text-gray-600 shrink-0">|</span>

                  {/* Quick Idea Chips */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {[
                      { label: '🏎️ Supercar (gari)', prompt: 'Luxury modern sports supercar on coastal highway at sunset' },
                      { label: '🦁 Royal Lion (sher)', prompt: 'Majestic royal lion with golden mane in African golden grassland' },
                      { label: '💎 Modern Logo', prompt: 'Minimalist corporate eagle emblem logo on clean background' },
                      { label: '⚡ Cyberpunk City', prompt: 'Futuristic cyberpunk neon metropolis with holographic skyscrapers' },
                      { label: '🏔️ Northern Mountains', prompt: 'Breathtaking alpine northern mountains with crystal turquoise river' }
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setImagePrompt(chip.prompt);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-gray-300 hover:text-white text-[11px] whitespace-nowrap transition cursor-pointer"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Generated Images Grid Container */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 custom-scrollbar">
              <div className="max-w-5xl mx-auto space-y-4">
                {/* Gallery Title Header */}
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <HiSparkles className="w-3.5 h-3.5 text-pink-400" />
                      4K AI Studio Gallery ({generatedImages.length})
                    </span>
                    <span className="text-[10px] text-gray-400 hidden sm:inline">
                      • Click any artwork to preview in 4K, zoom, or download
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                    ✓ Instant Stream Active
                  </span>
                </div>
                {generatedImages.length === 0 ? (
                  <div className="text-center py-20 space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shadow-xl">
                      <HiPhoto className="w-10 h-10" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-white">NEXORA AI Image Studio Ready</h4>
                      <p className="text-xs text-gray-400 max-w-md mx-auto">
                        Type any prompt in English or Roman Urdu above to generate high-resolution marketing artwork, UI mockups, and logos.
                      </p>
                    </div>
                    <div className="flex justify-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setImagePrompt('Luxury sports car on coastal highway at sunset, 8k');
                          setImageStyle('photorealistic');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300"
                      >
                        Try: "Luxury sports car on coastal highway"
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {generatedImages.map(img => {
                      const ratioClass = 
                        img.aspectRatio === '16:9' ? 'aspect-video' :
                        img.aspectRatio === '9:16' ? 'aspect-[9/16]' :
                        img.aspectRatio === '4:3' ? 'aspect-[4/3]' : 'aspect-square';
                      const isLoaded = !!loadedImageMap[img.id];

                      return (
                        <div
                          key={img.id}
                          className="rounded-2xl bg-navy-900 border border-white/10 overflow-hidden shadow-xl group hover:border-pink-500/40 transition-all flex flex-col justify-between"
                        >
                          {/* Image Box */}
                          <div className={`relative ${ratioClass} overflow-hidden bg-navy-950 flex items-center justify-center`}>
                            {/* Shimmer Skeleton while loading image */}
                            {!isLoaded && (
                              <div className="absolute inset-0 bg-navy-950 flex flex-col items-center justify-center p-6 text-center space-y-3 z-10 transition-opacity">
                                <div className="w-12 h-12 mx-auto rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 animate-pulse">
                                  <HiSparkles className="w-6 h-6 animate-spin" />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-bold text-white">Synthesizing 4K Pixels...</p>
                                  <p className="text-[10px] text-gray-400">Rendering visual with {img.style || 'Photorealistic'} Style</p>
                                </div>
                                <div className="w-3/4 mx-auto h-1.5 rounded-full bg-white/10 overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 animate-pulse w-full" />
                                </div>
                              </div>
                            )}

                            <img
                              src={img.url}
                              alt={img.prompt}
                              loading="eager"
                              onLoad={() => setLoadedImageMap(p => ({ ...p, [img.id]: true }))}
                              onError={(e) => {
                                // Multi-tier fallback cascade:
                                const currentSrc = e.target.src;
                                if (img.fallbackUrl && currentSrc !== img.fallbackUrl && !e.target.dataset.fb1) {
                                  e.target.dataset.fb1 = '1';
                                  e.target.src = img.fallbackUrl;
                                } else if (img.fallbackUrl2 && currentSrc !== img.fallbackUrl2 && !e.target.dataset.fb2) {
                                  e.target.dataset.fb2 = '1';
                                  e.target.src = img.fallbackUrl2;
                                } else if (img.fallbackPhoto && currentSrc !== img.fallbackPhoto && !e.target.dataset.fb3) {
                                  e.target.dataset.fb3 = '1';
                                  e.target.src = img.fallbackPhoto;
                                } else {
                                  setLoadedImageMap(p => ({ ...p, [img.id]: true }));
                                }
                              }}
                              className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 cursor-pointer ${
                                isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                              }`}
                              onClick={() => setLightboxImage(img)}
                            />

                            {/* Top Badges */}
                            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-20">
                              <span className="px-2 py-0.5 rounded-full bg-navy-950/80 backdrop-blur-md text-[10px] font-bold text-white border border-white/20 uppercase">
                                {img.style || 'Art'}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-navy-950/80 backdrop-blur-md text-[10px] font-mono text-gray-300 border border-white/20">
                                {img.aspectRatio || '1:1'}
                              </span>
                            </div>

                            {/* Hover Action Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3 z-20">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setLightboxImage(img)}
                                  className="p-2 rounded-xl bg-navy-950/80 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition cursor-pointer"
                                  title="View Fullscreen"
                                >
                                  <HiArrowsPointingOut className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRegenerate(img)}
                                  className="p-2 rounded-xl bg-navy-950/80 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition cursor-pointer"
                                  title="Re-roll / Regenerate variation"
                                >
                                  <HiArrowPath className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(img.prompt);
                                    toast.success('Prompt copied!');
                                  }}
                                  className="p-2 rounded-xl bg-navy-950/80 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition cursor-pointer"
                                  title="Copy Prompt"
                                >
                                  <HiClipboard className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleDownloadImage(img)}
                                  disabled={downloadingId === img.id}
                                  className="px-3 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg transition cursor-pointer"
                                >
                                  <HiArrowDownTray className="w-4 h-4" />
                                  <span>{downloadingId === img.id ? 'Saving...' : 'Download'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteImage(img.id)}
                                  className="p-2 rounded-xl bg-navy-950/80 hover:bg-rose-600 text-gray-400 hover:text-white border border-white/20 backdrop-blur-md transition cursor-pointer"
                                  title="Delete"
                                >
                                  <HiTrash className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Card Caption */}
                          <div className="p-3.5 space-y-1">
                            <p className="text-xs font-semibold text-white line-clamp-2 leading-relaxed" title={img.prompt}>
                              {img.prompt}
                            </p>
                            <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-white/5">
                              <span>{img.createdAt}</span>
                              <span className="font-mono text-pink-300 font-bold">{img.model?.toUpperCase() || 'TURBO'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Fullscreen Lightbox / Zoom Modal */}
            {lightboxImage && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                onClick={() => setLightboxImage(null)}
              >
                <div 
                  className="relative max-w-4xl w-full bg-navy-900 border border-white/20 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-5"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <HiPhoto className="w-4 h-4 text-pink-400" /> Fullscreen 4K AI Preview
                      </h4>
                      <p className="text-xs text-gray-400 font-mono">
                        {lightboxImage.width}x{lightboxImage.height} • Style: {lightboxImage.style} • Seed: {lightboxImage.seed}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLightboxImage(null)}
                      className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                    >
                      <HiXMark className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="relative max-h-[65vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black/60">
                    <img
                      src={lightboxImage.url}
                      alt={lightboxImage.prompt}
                      className="max-h-[65vh] w-auto object-contain rounded-xl shadow-2xl"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Prompt:</span>
                    <p className="text-xs text-white leading-relaxed">{lightboxImage.prompt}</p>
                    {lightboxImage.enhancedPrompt && lightboxImage.enhancedPrompt !== lightboxImage.prompt && (
                      <p className="text-[11px] text-gray-400 italic">
                        Enhanced: {lightboxImage.enhancedPrompt}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(lightboxImage.prompt);
                        toast.success('Prompt copied to clipboard!');
                      }}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center gap-1.5 transition"
                    >
                      <HiClipboard className="w-4 h-4" />
                      <span>Copy Prompt</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadImage(lightboxImage)}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg transition"
                    >
                      <HiArrowDownTray className="w-4 h-4" />
                      <span>Download 4K HD File</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-violet-500 flex items-center justify-center text-white shrink-0 mt-1 shadow-md shadow-violet-500/25">
                    <HiSparkles className="w-4 h-4" />
                  </div>
                )}

                <div className={`relative group max-w-3xl rounded-2xl p-4 sm:p-5 text-sm ${
                  isUser
                    ? 'bg-blue-600/30 border border-blue-500/40 text-blue-50 rounded-tr-none'
                    : 'bg-navy-950/70 border border-white/10 text-gray-200 rounded-tl-none shadow-xl'
                }`}>
                  <div className="prose prose-invert prose-sm max-w-none prose-headings:font-bold prose-headings:text-white prose-p:leading-relaxed prose-pre:bg-navy-950 prose-pre:border prose-pre:border-white/10">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>

                  {!isUser && (
                    <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-white/5 text-xs">
                      {/* PDF Export Button */}
                      <button
                        onClick={() => handleExportPDF(msg.content, idx)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-all font-medium"
                        title="Export this response as a formatted PDF"
                      >
                        <HiArrowDownTray className="w-3.5 h-3.5 text-rose-400" />
                        <span>PDF</span>
                      </button>

                      {/* Word Export Button */}
                      <button
                        onClick={() => handleExportWord(msg.content, idx)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 transition-all font-medium"
                        title="Export as Microsoft Word (.docx)"
                      >
                        <HiArrowDownTray className="w-3.5 h-3.5 text-blue-400" />
                        <span>Word (.docx)</span>
                      </button>

                      {/* Copy Markdown */}
                      <button
                        onClick={() => handleCopy(msg.content, idx)}
                        className="hover:text-white flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/5 text-gray-400 transition-colors ml-auto"
                      >
                        {copiedId === idx ? <HiCheck className="w-3.5 h-3.5 text-emerald-400" /> : <HiClipboard className="w-3.5 h-3.5" />}
                        <span>{copiedId === idx ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-1">
                    {(user?.name || 'U').slice(0, 2).toUpperCase()}
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Real-time Streaming Response Chunk */}
          {loading && streamingText && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-violet-500 flex items-center justify-center text-white shrink-0 mt-1">
                <HiSparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="max-w-3xl rounded-2xl p-5 bg-navy-950/70 border border-white/10 text-gray-200 rounded-tl-none text-sm prose prose-invert prose-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {streamingText}
                </ReactMarkdown>
              </div>
            </motion.div>
          )}

          {/* Typing Indicator */}
          {loading && !streamingText && (
            <div className="flex items-center gap-3 text-xs text-gray-400 pl-12">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce [animation-delay:0.4s]" />
              </div>
              <span>NEXORA AI is reasoning...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-4 border-t border-white/10 bg-navy-950/70">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendPrompt();
              }}
              className="flex items-center gap-2 max-w-4xl mx-auto"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask NEXORA AI to write specs, decompose tasks, analyze metrics..."
                  disabled={loading}
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => toast('Attachment support configured via Appwrite Storage', { icon: '📎' })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  title="Attach file / spec"
                >
                  <HiPaperClip className="w-4 h-4" />
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25"
              >
                <HiPaperAirplane className="w-5 h-5" />
              </button>
            </form>
          </div>
        </>
        )}
      </div>
    </div>
  );
}
