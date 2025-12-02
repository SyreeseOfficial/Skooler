# Skooler Chrome Extension

AI-powered response generator with brand voice consistency.

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select this directory (`skooler`)

## Setup

1. Open the extension popup
2. Click the settings icon (⚙️)
3. Enter your Gemini API key in the "Gemini API Key" field
4. Configure other settings as needed:
   - Brand Voice: Toggle and enter your brand voice guidelines (up to 10,000 characters)
   - Auto-Copy: Toggle to automatically copy generated responses

## Usage

1. Paste your source text in the "Source Input" field
2. Select a tone (Encouraging, Direct, Empathetic, Salesy, Detailed, or Concise)
3. Choose output length (Short, Medium, or Long)
4. Optionally add custom refinement instructions
5. Click "Generate"
6. Copy the generated response or refine it using the dropdown

## Features

- **AI Generation**: Uses Google Gemini 2.0 Flash model
- **Tone Selection**: 6 distinct tone options
- **Brand Voice**: Customizable brand voice guidelines
- **Usage Tracking**: Tracks monthly usage (300 Free / 4,500 Premium)
- **Auto-Copy**: Automatically copy generated responses
- **Refinement**: Quick refinement options (shorter, formal, casual, emojis, grammar)

## API Key Management

The API key is stored locally in browser storage for development/testing purposes. Before public launch, this should be replaced with a proxy server URL.

## Icons

Before loading the extension, you need to create the icon files. You have two options:

1. **Using the HTML generator**: Open `generate_icons.html` in your browser and click "Generate All Icons". The icons will be downloaded automatically. Move them to the `icons/` directory.

2. **Using Python script**: Install Pillow (`pip install Pillow`) and run `python3 create_icons.py` to generate the icons.

3. **Manual creation**: Create your own 16x16, 48x48, and 128x128 PNG files and place them in the `icons/` directory as `icon16.png`, `icon48.png`, and `icon128.png`.

