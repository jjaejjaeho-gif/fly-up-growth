const SPREADSHEET_ID = '1HO6CFjUJi5tsU0MQ-D1A_4hx-5kd8FpEmJP2r9tqcMw';
const SHEET_NAME = 'Records';

function doGet(e) {
  try {
    if (!e || !e.parameter || !e.parameter.callback) {
      return jsonText(JSON.stringify({ ok: true, message: 'Fly-Up API is running' }));
    }

    const callback = cleanCallback(e.parameter.callback);
    const payload = JSON.parse(e.parameter.payload || '{}');
    const result = saveRecord(payload);

    return jsText(callback + '(' + JSON.stringify(result) + ');');
  } catch (error) {
    const callback = e && e.parameter ? cleanCallback(e.parameter.callback || 'callback') : 'callback';
    return jsText(callback + '(' + JSON.stringify({ ok: false, error: error.message }) + ');');
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.parameter.payload || '{}');
    const result = saveRecord(payload);
    return text(JSON.stringify(result));
  } catch (error) {
    return text(JSON.stringify({ ok: false, error: error.message }));
  }
}

function saveRecord(payload) {
  if (!payload || payload.action !== 'createGrowthRecord') {
    throw new Error('Invalid action');
  }

  const record = payload.record;
  if (!record) throw new Error('Missing record');
  if (!record.studentName) throw new Error('Missing studentName');
  if (!record.activities || record.activities.length === 0) throw new Error('Missing activities');

  const sheet = getSheet();
  const reflection = record.reflection || {};

  sheet.appendRow([
    record.submissionId || Utilities.getUuid(),
    new Date(),
    record.date || '',
    record.studentName,
    Array.isArray(record.activities) ? record.activities.join(', ') : record.activities,
    Number(reflection.cooperation || 0),
    Number(reflection.participation || 0),
    Number(reflection.cheering || 0),
    Number(reflection.rules || 0),
    Number(reflection.selfPractice || 0),
    Number(record.reflectionAverage || 0),
    record.memo || ''
  ]);

  return { ok: true, message: 'saved' };
}

function getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

  if (!sheet.getRange(1, 1).getValue()) {
    sheet.appendRow([
      'submissionId', 'savedAt', 'date', 'studentName', 'activities',
      'cooperation', 'participation', 'cheering', 'rules',
      'selfPractice', 'reflectionAverage', 'memo'
    ]);
  }

  return sheet;
}

function cleanCallback(value) {
  return String(value || 'callback').replace(/[^\w.$]/g, '');
}

function jsonText(value) {
  return ContentService
    .createTextOutput(value)
    .setMimeType(ContentService.MimeType.JSON);
}

function jsText(value) {
  return ContentService
    .createTextOutput(value)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
