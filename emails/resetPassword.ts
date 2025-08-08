export function resetPasswordHtml(otp: string) {
  return `
    <div style="font-family: 'Inter', Arial, sans-serif; background-color: #000000; color: #ffffff; max-width: 480px; margin: 0 auto; border-radius: 12px; border: 1px solid #1a1a1a; padding: 32px 24px;">
      <h1 style="font-size: 28px; font-weight: 600; color: #3b82f6; margin: 0 0 18px 0; text-align: center;">Reset Your Password</h1>
      <p style="font-size: 16px; color: #cccccc; text-align: center; margin-bottom: 32px;">
        We received a request to reset your DevKit account password.<br>
        Please enter this code to continue:
      </p>
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 26px; font-family: 'JetBrains Mono', monospace; font-weight: bold; color: #22c55e; background: #1a1a1a; border-radius: 8px; padding: 14px 32px; display: inline-block; cursor: copy; border: 2px solid #3b82f6;">
          ${otp}
        </div>
      </div>
      <div style="background-color: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 16px; margin: 24px 0;">
        <ul style="padding-left: 20px; color: #ffffff; font-size: 15px; margin: 0;">
          <li>This OTP is valid for 15 minutes and can only be used once.</li>
          <li>Do not share this code with anyone for security reasons.</li>
          <li>If you did not make this request, you can safely ignore this email.</li>
        </ul>
      </div>
      <p style="text-align: center; font-size: 13px; color: #888888; margin-top: 36px;">
        &copy; 2025 DevKit
      </p>
    </div>
  `;
}
