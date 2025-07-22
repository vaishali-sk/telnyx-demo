# Telnyx Softphone Setup Guide

Your web-based softphone application is running! Here's how to connect it to your Telnyx account:

## 1. Get Your Telnyx API Token

1. Log into your [Telnyx Dashboard](https://portal.telnyx.com/)
2. Go to **Auth** > **API Keys** in the left sidebar
3. Create a new API key or copy an existing one
4. Make sure it has WebRTC permissions enabled

## 2. Configure the Softphone

1. In the softphone interface, click the **Settings** button in the bottom left
2. In the settings modal, go to the **Telnyx Credentials** tab
3. Enter your API key in the "Telnyx API Key" field
4. Optional: Configure SIP username/password if you have them
5. Click **Test Connection** to verify it works
6. Click **Save Settings**

## 3. Set Up Your Phone Number (Optional)

If you want to receive incoming calls:

1. In your Telnyx Dashboard, go to **Numbers** > **My Numbers**
2. Purchase a phone number if you don't have one
3. Go to **Messaging** > **TeXML Applications**
4. Create a new TeXML application
5. Set the webhook URL to your softphone's domain
6. Assign your phone number to this application

## 4. Test Your Setup

After configuring:

1. The connection status should show "Connected to Telnyx" (green dot)
2. Try making a test call using the dialpad
3. Check that call history is being recorded
4. Test audio device selection in the sidebar

## Features Available

✅ **Basic Calling**
- Make outbound calls
- Receive inbound calls
- Call history tracking

✅ **Call Controls**
- Mute/unmute
- Hold/resume
- Hangup
- Call transfer

✅ **Conference Calling**
- Start conference from active call
- Add participants to conference
- Manage conference participants
- Conference call history

✅ **Device Management**
- Select microphone/speaker
- Audio device detection
- Real-time device switching

## Troubleshooting

**"Not Connected" Error:**
- Check your API key is correct
- Ensure your Telnyx account has WebRTC enabled
- Check browser permissions for microphone access

**Audio Issues:**
- Allow microphone/speaker permissions in browser
- Check device selection in sidebar
- Test with different audio devices

**Call Quality Issues:**
- Check your internet connection
- Try different Telnyx connection servers in settings
- Monitor the call quality indicator in the top bar

## Need Your API Key?

I can help you configure the connection if you provide your Telnyx API token. The token should start with something like "KEY" followed by alphanumeric characters.