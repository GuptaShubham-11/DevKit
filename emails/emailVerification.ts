export function emailVerificationHtml(otp: string) {
  return `
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 6px;">
        
        <h2 style="text-align: center; color: #333; margin-bottom: 5px;">DevKit Email Verification</h2>

        <div style="text-align: center; margin-bottom: 10px;">
          <div style="display: inline-block; padding: 12px 20px; background-color: #f0f0f0; border-radius: 4px;">
            <span style="font-size: 20px; font-weight: bold; color: #2563eb; letter-spacing: 4px;">${otp}</span>
          </div>
        </div>

        <p style="font-size: 13px; color: #666; text-align: center;">
          This code will expire in 15 minutes. Please do not share it with anyone.
        </p>

        <p style="font-size: 12px; color: #999; text-align: center;">
          © 2025 DevKit. All rights reserved.
        </p>

      </div>
  `;
}
