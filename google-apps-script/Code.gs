const SHEET_NAME = 'Registration Responses';
const SPREADSHEET_ID = '1bt3wP8S6rkLYxOru4EQFq_sIw_0xEHoiFdaE56i_O8M';
const NOTIFICATION_EMAIL = 'info@w-robotic.com';
const MAX_FIELD_LENGTH = 1000;

function doPost(event) {
  try {
    const data = parseRequest_(event);
    validate_(data);

    // A hidden field catches basic automated spam without affecting families.
    if (data.website) return response_({ ok: true });

    rateLimit_(data.email);

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
      if (!sheet) throw new Error('Registration sheet not found.');

      sheet.appendRow([
        new Date(),
        clean_(data.studentName),
        clean_(data.studentAge),
        clean_(data.guardianName),
        clean_(data.email),
        clean_(data.experience),
        clean_(arrayText_(data.interest)),
        clean_(data.preferredTime),
        clean_(data.language),
        clean_(data.phone),
        clean_(data.suburb),
        clean_(data.notes),
        data.consent ? 'Yes' : 'No',
        'Website',
        'Unassigned',
        '',
        'New enquiry',
        '',
      ]);
    } finally {
      lock.releaseLock();
    }

    try {
      MailApp.sendEmail({
        to: NOTIFICATION_EMAIL,
        subject: 'New WRC registration enquiry',
        htmlBody: '<p>A new registration enquiry has been added to the WRC Google Sheet.</p>' +
          '<p><strong>Student:</strong> ' + html_(data.studentName) + '<br>' +
          '<strong>Age:</strong> ' + html_(data.studentAge) + '<br>' +
          '<strong>Parent/guardian:</strong> ' + html_(data.guardianName) + '<br>' +
          '<strong>Email:</strong> ' + html_(data.email) + '</p>',
      });
    } catch (mailError) {
      console.warn('Notification email failed', mailError);
    }

    return response_({ ok: true });
  } catch (error) {
    console.error(error);
    return response_({ ok: false, message: 'Unable to submit registration.' });
  }
}

function parseRequest_(event) {
  if (!event || !event.postData) throw new Error('Missing request body.');
  const contentType = String(event.postData.type || '').toLowerCase();
  if (contentType.indexOf('application/json') !== -1) {
    return JSON.parse(event.postData.contents || '{}');
  }
  return event.parameter || {};
}

function validate_(data) {
  const required = ['studentName', 'studentAge', 'guardianName', 'email', 'experience'];
  required.forEach(function (key) {
    if (!String(data[key] || '').trim()) throw new Error('Missing required field: ' + key);
  });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email))) throw new Error('Invalid email.');
  if (!data.consent) throw new Error('Consent is required.');
  Object.keys(data).forEach(function (key) {
    if (String(data[key] || '').length > MAX_FIELD_LENGTH) throw new Error('Field too long.');
  });
}

function rateLimit_(email) {
  const digest = Utilities.base64EncodeWebSafe(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(email).toLowerCase()),
  ).slice(0, 32);
  const cache = CacheService.getScriptCache();
  const key = 'registration:' + digest;
  if (cache.get(key)) throw new Error('Please wait before submitting again.');
  cache.put(key, '1', 60);
}

function clean_(value) {
  const text = String(value || '').trim().slice(0, MAX_FIELD_LENGTH);
  // Prevent spreadsheet formula injection in user-controlled cells.
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function arrayText_(value) {
  return Array.isArray(value) ? value.join('; ') : value;
}

function html_(value) {
  return String(value || '').replace(/[&<>"']/g, function (character) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character];
  });
}

function response_(body) {
  return ContentService.createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
