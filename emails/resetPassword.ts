export function resetPasswordHtml(otp: string) {
  return `
<div style="font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333; padding: 30px;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 24px; border-radius: 6px; border: 1px solid #e0e0e0;">
        
        <h2 style="text-align: center; color: #2563eb; margin-bottom: 5px;">Reset Your Password</h2>
        <p style="text-align: center; font-size: 14px; color: #555; margin-bottom: 10px;">
          We received a request to reset your DevKit account password.<br />
          Use the code below to continue.
        </p>

        <div style="text-align: center; margin: 20px 0;">
          <div style="display: inline-block; padding: 12px 20px; background-color: #f0f0f0; border-radius: 4px; border: 1px solid #2563eb;">
            <span style="font-size: 20px; font-weight: bold; color: #2563eb; letter-spacing: 4px;">398726</span>
          </div>
        </div>

        <p style="font-size: 13px; color: #666; text-align: center; margin: 20px 0;">
          This code will expire in 15 minutes. Do not share it with anyone.
        </p>

        <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
          If you did not request this, please ignore this email.
        </p>

        <p style="font-size: 12px; color: #aaa; text-align: center; margin-top: 2px;">
          &copy; 2025 DevKit. All rights reserved.
        </p>
      </div>
    </div>
  `;
}
