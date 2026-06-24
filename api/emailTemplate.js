// api/emailTemplate.js
// Shared branded email template for Blue Mountain Bookkeeping.
// Used by both subscribe.js (free downloads) and webhook.js (paid purchases).
//
// Font note: email clients don't support Google Fonts.
// We use 'Helvetica Neue', Arial for body (closest to Inter)
// and Georgia, serif for display text (closest to Playfair Display).

const FONT_BODY    = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const FONT_DISPLAY = "Georgia, 'Times New Roman', serif";

const YEAR = new Date().getFullYear();

/**
 * buildFreeEmail — for free resource delivery
 * @param {string} firstName
 * @param {string} intro        — resource-specific opening line
 * @param {string} downloadUrl  — direct link to the PDF
 * @param {string} siteUrl      — e.g. https://yourdomain.com
 */
function buildFreeEmail({ firstName, intro, downloadUrl, siteUrl }) {
  const logoUrl = `${siteUrl}/images/logo.jpg`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Your Free Download</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F8FA;font-family:${FONT_BODY};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F8FA;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 16px rgba(27,46,75,0.09);">

          <!-- HEADER -->
          <tr>
            <td style="background-color:#1B2E4B;padding:28px 32px;text-align:center;">
              <img src="${logoUrl}" alt="Blue Mountain Bookkeeping logo"
                width="90" height="90"
                style="display:block;margin:0 auto 14px;border-radius:50%;border:2px solid #2ABFBF;object-fit:cover;" />
              <p style="margin:0;font-family:${FONT_DISPLAY};font-style:italic;font-size:18px;color:#2ABFBF;letter-spacing:0.02em;">
                Blue Mountain Bookkeeping
              </p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:36px 36px 28px;">
              <h1 style="margin:0 0 14px;font-family:${FONT_DISPLAY};font-size:22px;font-weight:normal;color:#1B2E4B;line-height:1.3;">
                Hi ${firstName}! Your download is ready.
              </h1>
              <p style="margin:0 0 18px;font-size:15px;color:#4A6070;line-height:1.75;">
                ${intro}
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#4A6070;line-height:1.75;">
                Your download should have started automatically in your browser. If it didn't, use the button below anytime.
              </p>

              <!-- BUTTON -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background-color:#2ABFBF;border-radius:4px;">
                    <a href="${downloadUrl}"
                      style="display:inline-block;padding:14px 30px;font-family:${FONT_BODY};font-size:15px;font-weight:700;color:#1B2E4B;text-decoration:none;letter-spacing:0.02em;">
                      Download Your Free Guide
                    </a>
                  </td>
                </tr>
              </table>

              <!-- UPSELL -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                style="background-color:#F5F8FA;border-radius:6px;padding:18px 20px;margin-bottom:24px;">
                <tr>
                  <td>
                    <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#1B2E4B;">
                      Ready to go further?
                    </p>
                    <p style="margin:0 0 10px;font-size:14px;color:#4A6070;line-height:1.65;">
                      Our paid tools are built to save you hours every month and give you a real system for your finances.
                    </p>
                    <a href="${siteUrl}/#tools"
                      style="font-size:14px;color:#1A7A7A;text-decoration:none;font-weight:600;">
                      Browse Bookkeeping Tools &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- FALLBACK LINK -->
              <p style="margin:0;font-size:12px;color:#8FAABB;line-height:1.6;border-top:1px solid #EDF4F7;padding-top:18px;">
                Trouble with the button? Copy and paste this link into your browser:<br>
                <a href="${downloadUrl}" style="color:#2ABFBF;word-break:break-all;">${downloadUrl}</a>
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#132238;padding:18px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:rgba(123,184,212,0.55);line-height:1.8;">
                &copy; ${YEAR} Blue Mountain Bookkeeping &nbsp;&bull;&nbsp;
                <a href="${siteUrl}/privacy.html" style="color:#2ABFBF;text-decoration:none;">Privacy Policy</a>
                &nbsp;&bull;&nbsp;
                <a href="${siteUrl}/terms.html" style="color:#2ABFBF;text-decoration:none;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * buildPurchaseEmail — for paid product delivery
 * @param {string} firstName
 * @param {string} productName
 * @param {string} downloadUrl  — direct link to the ZIP
 * @param {string} siteUrl
 */
function buildPurchaseEmail({ firstName, productName, downloadUrl, siteUrl }) {
  const logoUrl = `${siteUrl}/images/logo.jpg`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Your Purchase</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F8FA;font-family:${FONT_BODY};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F8FA;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 16px rgba(27,46,75,0.09);">

          <!-- HEADER -->
          <tr>
            <td style="background-color:#1B2E4B;padding:28px 32px;text-align:center;">
              <img src="${logoUrl}" alt="Blue Mountain Bookkeeping logo"
                width="90" height="90"
                style="display:block;margin:0 auto 14px;border-radius:50%;border:2px solid #2ABFBF;object-fit:cover;" />
              <p style="margin:0;font-family:${FONT_DISPLAY};font-style:italic;font-size:18px;color:#2ABFBF;letter-spacing:0.02em;">
                Blue Mountain Bookkeeping
              </p>
            </td>
          </tr>

          <!-- CONFIRMATION BANNER -->
          <tr>
            <td style="background-color:#E1F5F5;padding:16px 36px;text-align:center;">
              <p style="margin:0;font-size:15px;font-weight:600;color:#1A7A7A;">
                ✓ &nbsp;Payment confirmed — thank you!
              </p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:36px 36px 28px;">
              <h1 style="margin:0 0 14px;font-family:${FONT_DISPLAY};font-size:22px;font-weight:normal;color:#1B2E4B;line-height:1.3;">
                You're all set, ${firstName}!
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#4A6070;line-height:1.75;">
                Thank you for purchasing <strong style="color:#1B2E4B;">${productName}</strong>.
                Your files are packaged and ready to download below.
              </p>

              <!-- BUTTON -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background-color:#2ABFBF;border-radius:4px;">
                    <a href="${downloadUrl}"
                      style="display:inline-block;padding:14px 30px;font-family:${FONT_BODY};font-size:15px;font-weight:700;color:#1B2E4B;text-decoration:none;letter-spacing:0.02em;">
                      Download Your Files
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;font-size:14px;color:#4A6070;line-height:1.75;">
                Save the ZIP file somewhere easy to find — your desktop or a dedicated business folder works great.
                If you have any questions getting started, just reply to this email.
              </p>

              <!-- FALLBACK LINK -->
              <p style="margin:0;font-size:12px;color:#8FAABB;line-height:1.6;border-top:1px solid #EDF4F7;padding-top:18px;">
                Trouble with the button? Copy and paste this link into your browser:<br>
                <a href="${downloadUrl}" style="color:#2ABFBF;word-break:break-all;">${downloadUrl}</a>
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#132238;padding:18px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:rgba(123,184,212,0.55);line-height:1.8;">
                &copy; ${YEAR} Blue Mountain Bookkeeping &nbsp;&bull;&nbsp;
                <a href="${siteUrl}/privacy.html" style="color:#2ABFBF;text-decoration:none;">Privacy Policy</a>
                &nbsp;&bull;&nbsp;
                <a href="${siteUrl}/terms.html" style="color:#2ABFBF;text-decoration:none;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

module.exports = { buildFreeEmail, buildPurchaseEmail };