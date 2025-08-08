export function emailVarificationHtml(otp: string) {
  return `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: linear-gradient(135deg, #000000 0%, #0a0a0a 100%); color: #ffffff; padding: 0; margin: 0; width: 100%;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #000000; border: 1px solid #1a1a1a; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
        
        <!-- Header -->
        <div style="background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px 40px; text-align: center;">
          <div style="display: inline-block; padding: 8px 16px; background-color: rgba(255, 255, 255, 0.1); border-radius: 6px; margin-bottom: 12px;">
            <span style="font-size: 20px;">🚀</span>
          </div>
          <h1 style="color: #ffffff; font-size: 28px; font-weight: 600; margin: 0; letter-spacing: -0.5px;">DevKit</h1>
          <p style="color: rgba(255, 255, 255, 0.8); font-size: 16px; margin: 8px 0 0 0;">Developer Toolkit Platform</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px;">
          <h2 style="color: #ffffff; font-size: 24px; font-weight: 600; margin: 0 0 16px 0; text-align: center;">Verify Your Developer Account</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #cccccc; margin: 0 0 32px 0; text-align: center;">
            Welcome to the developer community!.
          </p>

          <!-- OTP Box -->
          <div style="text-align: center; margin: 32px 0;">
            <div style="display: inline-block; background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); border: 2px solid #3b82f6; border-radius: 12px; padding: 24px 32px; margin: 0 auto;">
              <p style="color: #888888; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0; font-weight: 500;">Verification Code</p>
              <div style="font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 26px; font-weight: 700; color: #22c55e; letter-spacing: 8px; margin: 0;">
                ${otp}
              </div>
            </div>
          </div>

          <!-- Instructions -->
          <div style="background-color: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 8px; padding: 20px; margin: 32px 0;">
            <h3 style="color: #ffffff; font-size: 14px; margin: 0 0 12px 0; display: flex; align-items: center;">
              <span style="margin-right: 8px;">⚡</span> Quick Setup
            </h3>
            <ol style="color: #cccccc; font-size: 12px; line-height: 1.5; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Copy the 6-digit code above</li>
              <li style="margin-bottom: 0;">Paste the code to verify your account</li>
            </ol>
          </div>

          <!-- Security Note -->
          <div style="background-color: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="color: #f59e0b; font-size: 12px; margin: 0; display: flex; align-items: flex-start;">
              <span style="margin-right: 8px; margin-top: 2px;">🔒</span>
              <span><strong>Security Notice:</strong> This code expires in 15 minutes. Never share it with anyone. Our team will never ask for this code.</span>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #0a0a0a; border-top: 1px solid #1a1a1a; padding: 24px 40px; text-align: center;">
          <p style="color: #888888; font-size: 14px; margin: 0 0 16px 0;">
            Need help? Contact our support team.
          </p>
          <p style="color: #666666; font-size: 12px; margin: 20px 0 0 0;">
            © 2025 DevKit. Built for developers, by developers.
          </p>
        </div>
      </div>
    </div>
  `;
}
