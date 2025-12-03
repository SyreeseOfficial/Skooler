// Storage Keys
const STORAGE_KEYS = {
  BRAND_VOICE_ENABLED: 'skooler_brand_voice_enabled',
  BRAND_VOICE_TEXT: 'skooler_brand_voice_text',
  AUTO_COPY: 'skooler_auto_copy',
  USAGE_COUNT: 'skooler_usage_count',
  USAGE_MONTH: 'skooler_usage_month',
  IS_PREMIUM: 'skooler_is_premium',
  LICENSE_KEY: 'skooler_license_key'
};

// Constants
const FREE_LIMIT = 300;
const PREMIUM_LIMIT = 4500;
const PROXY_URL = 'https://skooler.vercel.app/api';

// State
let selectedTone = null;
let currentOutput = '';

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  initializeUI();
  loadSettings();
  updateUsageDisplay();
  setupEventListeners();
});

// Initialize UI elements
function initializeUI() {
  // Set default tone if none selected
  const firstToneBtn = document.querySelector('.tone-btn');
  if (firstToneBtn) {
    firstToneBtn.classList.add('active');
    selectedTone = firstToneBtn.dataset.tone;
  }
}

// Load settings from localStorage
function loadSettings() {
  // Brand Voice
  const brandVoiceEnabled = localStorage.getItem(STORAGE_KEYS.BRAND_VOICE_ENABLED) === 'true';
  document.getElementById('brandVoiceToggle').checked = brandVoiceEnabled;
  document.getElementById('brandVoiceContainer').style.display = brandVoiceEnabled ? 'block' : 'none';

  const brandVoiceText = localStorage.getItem(STORAGE_KEYS.BRAND_VOICE_TEXT) || '';
  document.getElementById('brandVoiceInput').value = brandVoiceText;
  updateCharCount();

  // Auto-Copy
  const autoCopy = localStorage.getItem(STORAGE_KEYS.AUTO_COPY) === 'true';
  document.getElementById('autoCopyToggle').checked = autoCopy;

  // License Key
  const licenseKey = localStorage.getItem(STORAGE_KEYS.LICENSE_KEY) || '';
  document.getElementById('licenseKeyInput').value = licenseKey;
}

// Setup event listeners
function setupEventListeners() {
  // Tone buttons
  document.querySelectorAll('.tone-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tone-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedTone = btn.dataset.tone;
    });
  });

  // Generate button
  document.getElementById('generateBtn').addEventListener('click', handleGenerate);

  // Copy button
  document.getElementById('copyBtn').addEventListener('click', handleCopy);

  // Refine select
  document.getElementById('refineSelect').addEventListener('change', handleRefine);

  // Settings toggle
  document.getElementById('settingsBtn').addEventListener('click', () => {
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('settingsPanel').style.display = 'flex';
  });

  // Close settings
  document.getElementById('closeSettingsBtn').addEventListener('click', () => {
    document.getElementById('settingsPanel').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
  });

  // Brand Voice toggle
  document.getElementById('brandVoiceToggle').addEventListener('change', (e) => {
    const enabled = e.target.checked;
    localStorage.setItem(STORAGE_KEYS.BRAND_VOICE_ENABLED, enabled);
    document.getElementById('brandVoiceContainer').style.display = enabled ? 'block' : 'none';
  });

  // Brand Voice textarea
  document.getElementById('brandVoiceInput').addEventListener('input', (e) => {
    const text = e.target.value;
    if (text.length <= 10000) {
      localStorage.setItem(STORAGE_KEYS.BRAND_VOICE_TEXT, text);
      updateCharCount();
    } else {
      e.target.value = text.substring(0, 10000);
      localStorage.setItem(STORAGE_KEYS.BRAND_VOICE_TEXT, e.target.value);
      updateCharCount();
    }
  });

  // Auto-Copy toggle
  document.getElementById('autoCopyToggle').addEventListener('change', (e) => {
    localStorage.setItem(STORAGE_KEYS.AUTO_COPY, e.target.checked);
  });

  // Upgrade button
  document.getElementById('upgradeBtn').addEventListener('click', handleUpgrade);

  // License key save button
  document.getElementById('saveLicenseBtn').addEventListener('click', handleSaveLicense);
}

// Update character count
function updateCharCount() {
  const text = document.getElementById('brandVoiceInput').value;
  document.getElementById('charCount').textContent = text.length;
}

// Check usage limit
function checkUsageLimit() {
  const now = new Date();
  const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  const storedMonth = localStorage.getItem(STORAGE_KEYS.USAGE_MONTH);

  // Reset if new month
  if (storedMonth !== currentMonth) {
    localStorage.setItem(STORAGE_KEYS.USAGE_COUNT, '0');
    localStorage.setItem(STORAGE_KEYS.USAGE_MONTH, currentMonth);
  }

  const usageCount = parseInt(localStorage.getItem(STORAGE_KEYS.USAGE_COUNT) || '0');
  const isPremium = localStorage.getItem(STORAGE_KEYS.IS_PREMIUM) === 'true';
  const limit = isPremium ? PREMIUM_LIMIT : FREE_LIMIT;

  return usageCount < limit;
}

// Increment usage
function incrementUsage() {
  const now = new Date();
  const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  const storedMonth = localStorage.getItem(STORAGE_KEYS.USAGE_MONTH);

  if (storedMonth !== currentMonth) {
    localStorage.setItem(STORAGE_KEYS.USAGE_COUNT, '1');
    localStorage.setItem(STORAGE_KEYS.USAGE_MONTH, currentMonth);
  } else {
    const currentCount = parseInt(localStorage.getItem(STORAGE_KEYS.USAGE_COUNT) || '0');
    localStorage.setItem(STORAGE_KEYS.USAGE_COUNT, String(currentCount + 1));
  }

  updateUsageDisplay();
}

// Update usage display
function updateUsageDisplay() {
  const now = new Date();
  const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  const storedMonth = localStorage.getItem(STORAGE_KEYS.USAGE_MONTH);

  let usageCount = 0;
  if (storedMonth === currentMonth) {
    usageCount = parseInt(localStorage.getItem(STORAGE_KEYS.USAGE_COUNT) || '0');
  }

  const isPremium = localStorage.getItem(STORAGE_KEYS.IS_PREMIUM) === 'true';
  const limit = isPremium ? PREMIUM_LIMIT : FREE_LIMIT;

  document.getElementById('usageCount').textContent = usageCount;
  document.getElementById('usageLimit').textContent = limit;

  const percentage = Math.min((usageCount / limit) * 100, 100);
  document.getElementById('progressFill').style.width = percentage + '%';

  // Show upgrade button for free users
  document.getElementById('upgradeBtn').style.display = isPremium ? 'none' : 'block';
}

// Build prompt
function buildPrompt(sourceText, tone, length, customRefinement, brandVoiceText) {
  let prompt = `Generate a ${tone} response to the following message:\n\n"${sourceText}"\n\n`;

  // Length instruction
  const lengthInstructions = {
    short: 'Keep it short (1-2 sentences).',
    medium: 'Make it medium length (3-5 sentences).',
    long: 'Make it longer (2 paragraphs).'
  };
  prompt += lengthInstructions[length] || lengthInstructions.medium;

  // Custom refinement
  if (customRefinement && customRefinement.trim()) {
    prompt += `\n\nAdditional instruction: ${customRefinement}`;
  }

  // Brand voice
  if (brandVoiceText && brandVoiceText.trim()) {
    prompt += `\n\nBrand Voice Guidelines:\n${brandVoiceText}`;
  }

  prompt += '\n\nGenerate the response now:';

  return prompt;
}

// Build refine prompt
function buildRefinePrompt(originalText, refinementType) {
  const refineInstructions = {
    shorter: 'Make this text shorter while keeping the main points.',
    formal: 'Make this text more formal and professional.',
    casual: 'Make this text more casual and friendly.',
    emojis: 'Add relevant emojis to this text where appropriate.',
    grammar: 'Fix any grammar and spelling errors in this text.'
  };

  return `Please ${refineInstructions[refinementType]}:\n\n"${originalText}"\n\nRevised text:`;
}

// Handle generate
async function handleGenerate() {
  const sourceText = document.getElementById('sourceInput').value.trim();

  if (!sourceText) {
    alert('Please paste some text in the source input field.');
    return;
  }

  // Check usage limit
  if (!checkUsageLimit()) {
    const isPremium = localStorage.getItem(STORAGE_KEYS.IS_PREMIUM) === 'true';
    const limit = isPremium ? PREMIUM_LIMIT : FREE_LIMIT;
    alert(`You've reached your monthly limit of ${limit} generations. Please upgrade to Premium or wait until next month.`);
    return;
  }

  const generateBtn = document.getElementById('generateBtn');
  const btnText = generateBtn.querySelector('.btn-text');
  const spinner = document.getElementById('spinner');

  // Show loading state
  generateBtn.disabled = true;
  btnText.style.display = 'none';
  spinner.style.display = 'block';

  try {
    const tone = selectedTone || 'encouraging';
    const length = document.getElementById('lengthSelect').value;
    const customRefinement = document.getElementById('customRefinement').value.trim();
    const brandVoiceEnabled = localStorage.getItem(STORAGE_KEYS.BRAND_VOICE_ENABLED) === 'true';
    const brandVoiceText = brandVoiceEnabled ? localStorage.getItem(STORAGE_KEYS.BRAND_VOICE_TEXT) || '' : '';

    const prompt = buildPrompt(sourceText, tone, length, customRefinement, brandVoiceText);

    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: 'Your response must be the raw, final output only. Do not include any introductory phrases, conversational comments, or concluding remarks like \'Here is your response\' or \'Does this sound alright?\'. Do not use any text formatting besides simple paragraphs and line breaks; do not use bold, italics, or other special characters as they are not supported by the platform. Bullet points are the only acceptable form of list formatting.'
          }]
        },
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
      throw new Error('Invalid response format from API');
    }

    const generatedText = data.candidates[0].content.parts[0].text;

    if (!generatedText) {
      throw new Error('No text generated');
    }

    // Display output
    currentOutput = generatedText;
    document.getElementById('outputText').textContent = generatedText;
    document.getElementById('outputSection').style.display = 'block';
    document.getElementById('refineSelect').value = '';

    // Increment usage
    incrementUsage();

    // Auto-copy if enabled
    const autoCopy = localStorage.getItem(STORAGE_KEYS.AUTO_COPY) === 'true';
    if (autoCopy) {
      await copyToClipboard(generatedText);
    }

    // Scroll to output
    document.getElementById('outputSection').scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  } catch (error) {
    console.error('Generation error:', error);
    alert('Error generating response: ' + error.message);
  } finally {
    // Reset loading state
    generateBtn.disabled = false;
    btnText.style.display = 'block';
    spinner.style.display = 'none';
  }
}

// Handle refine
async function handleRefine() {
  const refineSelect = document.getElementById('refineSelect');
  const refinementType = refineSelect.value;

  if (!refinementType) {
    return;
  }

  if (!currentOutput) {
    alert('No output to refine. Please generate a response first.');
    refineSelect.value = '';
    return;
  }

  // Check usage limit
  if (!checkUsageLimit()) {
    const isPremium = localStorage.getItem(STORAGE_KEYS.IS_PREMIUM) === 'true';
    const limit = isPremium ? PREMIUM_LIMIT : FREE_LIMIT;
    alert(`You've reached your monthly limit of ${limit} generations. Please upgrade to Premium or wait until next month.`);
    refineSelect.value = '';
    return;
  }

  const generateBtn = document.getElementById('generateBtn');
  const btnText = generateBtn.querySelector('.btn-text');
  const spinner = document.getElementById('spinner');

  // Show loading state
  generateBtn.disabled = true;
  btnText.style.display = 'none';
  spinner.style.display = 'block';

  try {
    const prompt = buildRefinePrompt(currentOutput, refinementType);

    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: 'Your response must be the raw, final output only. Do not include any em dashes. Do not include any introductory phrases, conversational comments, or concluding remarks like \'Here is your response\' or \'Does this sound alright?\'. Do not use any text formatting besides simple paragraphs and line breaks; do not use bold, italics, or other special characters as they are not supported by the platform. Bullet points are the only acceptable form of list formatting.'
          }]
        },
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
      throw new Error('Invalid response format from API');
    }

    const refinedText = data.candidates[0].content.parts[0].text;

    if (!refinedText) {
      throw new Error('No text generated');
    }

    // Update output
    currentOutput = refinedText;
    document.getElementById('outputText').textContent = refinedText;
    refineSelect.value = '';

    // Increment usage
    incrementUsage();

    // Auto-copy if enabled
    const autoCopy = localStorage.getItem(STORAGE_KEYS.AUTO_COPY) === 'true';
    if (autoCopy) {
      await copyToClipboard(refinedText);
    }

  } catch (error) {
    console.error('Refinement error:', error);
    alert('Error refining response: ' + error.message);
  } finally {
    // Reset loading state
    generateBtn.disabled = false;
    btnText.style.display = 'block';
    spinner.style.display = 'none';
  }
}

// Handle copy
async function handleCopy() {
  if (!currentOutput) {
    alert('No output to copy.');
    return;
  }

  await copyToClipboard(currentOutput);
}

// Copy to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    const copyBtn = document.getElementById('copyBtn');
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    copyBtn.style.backgroundColor = '#2a5a2a';

    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.style.backgroundColor = '';
    }, 2000);
  } catch (error) {
    console.error('Copy error:', error);
    alert('Failed to copy to clipboard. Please try again.');
  }
}

// Handle upgrade
function handleUpgrade() {
  const confirmed = confirm('This will open the upgrade page. Continue?');
  if (confirmed) {
    // Open upgrade URL
    chrome.tabs.create({ url: 'https://syreese.gumroad.com/l/skooler' });

    // Mock upgrade success (for testing)
    // In production, this would be handled by the upgrade page callback
    setTimeout(() => {
      const mockUpgrade = confirm('Mock upgrade: Would you like to activate Premium? (This is for testing only)');
      if (mockUpgrade) {
        localStorage.setItem(STORAGE_KEYS.IS_PREMIUM, 'true');
        updateUsageDisplay();
        alert('Premium activated! Your limit is now 4,500 generations per month.');
      }
    }, 1000);
  }
}

// Handle save license key
async function handleSaveLicense() {
  const licenseKeyInput = document.getElementById('licenseKeyInput');
  const saveBtn = document.getElementById('saveLicenseBtn');
  const messageDiv = document.getElementById('licenseMessage');
  
  const licenseKey = licenseKeyInput.value.trim();
  
  if (!licenseKey) {
    messageDiv.textContent = 'Please enter a license key.';
    messageDiv.className = 'license-message error';
    return;
  }

  // Show loading state
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';
  messageDiv.textContent = '';
  messageDiv.className = 'license-message';

  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        license_key: licenseKey
      })
    });

    const data = await response.json();

    if (data.valid === true) {
      // Save license key and set premium status
      localStorage.setItem(STORAGE_KEYS.LICENSE_KEY, licenseKey);
      localStorage.setItem(STORAGE_KEYS.IS_PREMIUM, 'true');
      
      messageDiv.textContent = 'License key saved successfully! Premium activated.';
      messageDiv.className = 'license-message success';
      
      // Update usage display to reflect premium status
      updateUsageDisplay();
    } else {
      // Invalid license key
      messageDiv.textContent = data.message || 'Invalid license key.';
      messageDiv.className = 'license-message error';
      
      // Clear premium status if it was set
      localStorage.setItem(STORAGE_KEYS.IS_PREMIUM, 'false');
      updateUsageDisplay();
    }
  } catch (error) {
    console.error('License validation error:', error);
    messageDiv.textContent = 'Error validating license key. Please try again.';
    messageDiv.className = 'license-message error';
  } finally {
    // Reset button state
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save';
  }
}

