const chatWidget = document.getElementById('chat-widget');
const openChatBtn = document.getElementById('open-chat');
const closeChatBtn = document.getElementById('close-chat');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');
const sendBtn = document.getElementById('send-btn');

let isSending = false;
let conversation = [
  {
    role: 'system',
    content:
      'Du bist ein höflicher, hilfreicher deutschsprachiger Assistent. Antworte klar, konkret und ohne unnötige Füllsätze.'
  }
];

function appendMessage(role, text) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('message', role === 'user' ? 'user' : 'bot');

  const bubble = document.createElement('div');
  bubble.classList.add('bubble');
  bubble.textContent = text;

  wrapper.appendChild(bubble);
  chatMessages.appendChild(wrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function setLoading(loading) {
  isSending = loading;
  chatInput.disabled = loading;
  sendBtn.disabled = loading;
  if (loading) {
    sendBtn.textContent = '...';
  } else {
    sendBtn.textContent = 'Senden';
  }
}

openChatBtn?.addEventListener('click', () => {
  chatWidget.classList.remove('hidden');
  chatInput.focus();
});

closeChatBtn?.addEventListener('click', () => {
  chatWidget.classList.add('hidden');
});

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (isSending) return;

  const text = chatInput.value.trim();
  if (!text) return;

  appendMessage('user', text);
  conversation.push({ role: 'user', content: text });
  chatInput.value = '';

  setLoading(true);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: conversation })
    });

    if (!res.ok) {
      throw new Error('Fehler vom Server');
    }

    const data = await res.json();
    const reply = data.reply || 'Es ist ein unerwarteter Fehler aufgetreten.';
    appendMessage('bot', reply);
    conversation.push({ role: 'assistant', content: reply });
  } catch (err) {
    console.error(err);
    appendMessage(
      'bot',
      'Da ist etwas schiefgelaufen. Bitte probier es gleich nochmal.'
    );
  } finally {
    setLoading(false);
  }
});

chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    chatForm.dispatchEvent(new Event('submit'));
  }
});
