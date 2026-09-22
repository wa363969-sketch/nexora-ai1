import { useState, useRef } from 'react';
import { 
  HiCommandLine, 
  HiListBullet, 
  HiCodeBracket, 
  HiChatBubbleBottomCenterText,
  HiExclamationCircle
} from 'react-icons/hi2';

export default function SlashEditor({ value, onChange, placeholder = 'Type text or press "/" for Notion-style commands...' }) {
  const [showCommands, setShowCommands] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const textareaRef = useRef(null);

  const COMMANDS = [
    { id: 'todo', label: 'To-Do Checkbox', snippet: '- [ ] ', icon: HiListBullet },
    { id: 'h1', label: 'Heading 1', snippet: '# ', icon: HiCommandLine },
    { id: 'h2', label: 'Heading 2', snippet: '## ', icon: HiCommandLine },
    { id: 'code', label: 'Code Snippet Block', snippet: '```js\n// Implementation\n```\n', icon: HiCodeBracket },
    { id: 'quote', label: 'Blockquote Quote', snippet: '> ', icon: HiChatBubbleBottomCenterText },
    { id: 'callout', label: 'Alert Callout Note', snippet: '> [!NOTE]\n> ', icon: HiExclamationCircle },
  ];

  function handleKeyUp(e) {
    const text = e.target.value;
    const cursorPos = e.target.selectionStart;
    const beforeCursor = text.slice(0, cursorPos);
    const lastWord = beforeCursor.split(/\s/).pop();

    if (lastWord.startsWith('/')) {
      setShowCommands(true);
      setCommandQuery(lastWord.slice(1).toLowerCase());
    } else {
      setShowCommands(false);
    }
  }

  function insertCommand(cmd) {
    const text = value || '';
    const cursorPos = textareaRef.current?.selectionStart || text.length;
    const beforeCursor = text.slice(0, cursorPos);
    const lastSlashIdx = beforeCursor.lastIndexOf('/');
    
    if (lastSlashIdx !== -1) {
      const newText = text.slice(0, lastSlashIdx) + cmd.snippet + text.slice(cursorPos);
      onChange(newText);
      setShowCommands(false);
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursor = lastSlashIdx + cmd.snippet.length;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursor, newCursor);
        }
      }, 50);
    }
  }

  const filtered = COMMANDS.filter(c => c.label.toLowerCase().includes(commandQuery));

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        rows={4}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyUp={handleKeyUp}
        placeholder={placeholder}
        className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono resize-none leading-relaxed"
      />

      {/* Slash Commands Dropdown Menu */}
      {showCommands && (
        <div className="absolute left-3 bottom-full mb-2 w-64 rounded-xl bg-navy-900 border border-white/10 shadow-2xl p-1.5 z-50 space-y-1">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-white/5">
            Slash Commands
          </div>
          {filtered.length === 0 ? (
            <div className="p-2 text-xs text-gray-400">No matching command</div>
          ) : (
            filtered.map(cmd => (
              <button
                key={cmd.id}
                type="button"
                onClick={() => insertCommand(cmd)}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-white/10 text-left transition-colors"
              >
                <cmd.icon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{cmd.label}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
