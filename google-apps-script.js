// ============================================================================
// CRM TANGERANG - Google Apps Script Backend
// ============================================================================

var BUSINESS_SPREADSHEET_ID = '1_DQZYyDkzm6hjMsgX5ItEFTCyE3l1phKILN2bh7BvFc'; // Spreadsheet Bisnis
var USER_SPREADSHEET_ID = '1YRSrVZFm3gxTU7ZzCjPWYbMzgHo0EufvMQ9ZQ0XRPM4';     // Spreadsheet Users & ActivityLogs & LoginHistory
var KTP_FOLDER_ID = '1Nfgfh5duU-YvwoFFUbxOj-F4fREbNVeT';                       // Google Drive Folder untuk Foto KTP
var PROFILE_FOLDER_ID = '1E7yPKqTcSKdvRQ2csTX0gKoe0rVnrQiy';                   // Google Drive Folder untuk Foto Profil
var AGREEMENT_FOLDER_ID = '';                                                  // Google Drive Folder untuk Arsip Agreement (kosong = auto-create folder "AtlasCapture - Agreement Archive")
var AGREEMENT_TEMPLATE_DOC_ID = '12inF35IdFF1FOXhE5P-VNq9GHN36iPzhIVCKl6mJhiA';                                            // Google Docs Template ID untuk Agreement (Atlas Pilot Agreement Business MC - Native Google Doc)

function getBusinessSpreadsheet() {
  if (BUSINESS_SPREADSHEET_ID) {
    return SpreadsheetApp.openById(BUSINESS_SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getUserSpreadsheet() {
  if (USER_SPREADSHEET_ID) {
    return SpreadsheetApp.openById(USER_SPREADSHEET_ID);
  }
  return getBusinessSpreadsheet();
}

// ----------------------------------------------------------------------------
// Backend Login History Tracking (Stays exclusively in backend Google Sheet)
// ----------------------------------------------------------------------------
function getOrCreateLoginHistorySheet(ss) {
  var sheet = ss.getSheetByName('LoginHistory');
  if (!sheet) {
    sheet = ss.insertSheet('LoginHistory');
    sheet.appendRow([
      'Timestamp',
      'Email',
      'Name',
      'Role',
      'Method',
      'Status',
      'UserAgent',
      'Details'
    ]);
    try {
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#f1f5f9');
      sheet.setFrozenRows(1);
    } catch (e) { }
  }
  return sheet;
}

function recordLoginHistory(email, name, role, method, status, details, userAgent) {
  try {
    var userSs = getUserSpreadsheet();
    var sheet = getOrCreateLoginHistorySheet(userSs);
    var timestamp = new Date().toISOString();
    var detailsStr = (typeof details === 'object') ? JSON.stringify(details) : (details ? details.toString() : '');

    sheet.appendRow([
      timestamp,
      email || '',
      name || '',
      role || '',
      method || 'GOOGLE_SIGN_IN',
      status || 'SUCCESS',
      userAgent || '',
      detailsStr
    ]);
  } catch (err) {
    Logger.log("Error recording login history: " + err.toString());
  }
}

// ----------------------------------------------------------------------------
// Agreement Document Auto-Generation & Drive Archive
// ----------------------------------------------------------------------------
function getOrCreateAgreementFolder() {
  if (AGREEMENT_FOLDER_ID && AGREEMENT_FOLDER_ID.toString().trim() !== '') {
    try {
      return DriveApp.getFolderById(AGREEMENT_FOLDER_ID.toString().trim());
    } catch (err) {
      Logger.log("Could not find AGREEMENT_FOLDER_ID: " + err.toString());
    }
  }

  var folders = DriveApp.getFoldersByName("AtlasCapture - Agreement Archive");
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder("AtlasCapture - Agreement Archive");
}

function escapeRegexForDocs(str) {
  return str.replace(/[\^$\\.*+?()[\]{}|]/g, '\\$&');
}

function applySmartReplacements(container, tagMap) {
  if (!container) return;
  for (var key in tagMap) {
    var rawVal = (tagMap[key] !== undefined && tagMap[key] !== null) ? tagMap[key].toString() : '';
    // Escape \ and $ because Java regex Matcher treats them as escape / capture group references
    var safeVal = rawVal.replace(/\\/g, '\\\\').replace(/\$/g, '\\$');

    // 1. Direct exact regex replacement
    try {
      container.replaceText(escapeRegexForDocs(key), safeVal);
    } catch (e1) { }

    // 2. Flexible pattern matching (handles whitespace, uppercase/lowercase, hyphens, underscores, single/double curly braces, square brackets, < >)
    var cleanBase = key.replace(/[{}\[\]<>\s]/g, '');
    if (cleanBase) {
      var patternCore = cleanBase.replace(/[-_]/g, '[-_\\s]?');
      var patterns = [
        '(?i)\\{\\{\\s*' + patternCore + '\\s*\\}\\}',
        '(?i)\\{\\s*' + patternCore + '\\s*\\}',
        '(?i)\\{\\{?\\s*' + patternCore + '\\s*\\}?\\}',
        '(?i)\\[\\[\\s*' + patternCore + '\\s*\\]\\]',
        '(?i)\\[\\s*' + patternCore + '\\s*\\]',
        '(?i)<<\\s*' + patternCore + '\\s*>>',
        '(?i)<\\s*' + patternCore + '\\s*>',
        '(?i)«\\s*' + patternCore + '\\s*»'
      ];
      for (var p = 0; p < patterns.length; p++) {
        try {
          container.replaceText(patterns[p], safeVal);
        } catch (e2) { }
      }
    }
  }
}

function generateAgreementDocument(b) {
  try {
    var folder = getOrCreateAgreementFolder();
    var bizName = (b.businessName || 'Business').toString().trim();
    var subDate = (b.submissionDate || Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Jakarta', 'yyyy-MM-dd')).toString().trim();
    var fileName = 'Agreement - ' + bizName + ' - ' + subDate;
    var createdFile = null;

    var cleanNik = (b.ownerKtp || '').toString().trim().replace(/^'/, '');
    var cleanAcc = (b.accountNumber || '').toString().trim().replace(/^'/, '');
    var normPhone = normalizePhone(b.phone);
    var normHw = normalizeHardware(b.hardware);

    var fullAddr = (b.fullAddress || '').toString().trim();
    if (b.city && fullAddr.toLowerCase().indexOf(b.city.toString().toLowerCase()) === -1) {
      fullAddr += (fullAddr ? ', ' : '') + b.city;
    }
    if (b.postalCode && fullAddr.indexOf(b.postalCode.toString()) === -1) {
      fullAddr += ' ' + b.postalCode;
    }

    var titleVal = (b.title || b.ownerTitle || '').toString().trim() || ((b.accountType === 'COMPANY' || b.accountType === 'PT' || b.accountType === 'CV') ? 'Direktur / Penanggung Jawab' : 'Owner / Pemilik');

    if (AGREEMENT_TEMPLATE_DOC_ID && AGREEMENT_TEMPLATE_DOC_ID.toString().trim() !== '') {
      var templateId = AGREEMENT_TEMPLATE_DOC_ID.toString().trim();
      var template = DriveApp.getFileById(templateId);

      // Support auto-converting Word (.docx) to Google Docs if Advanced Drive Service is enabled
      var mime = template.getMimeType();
      var isWordDoc = mime === MimeType.MICROSOFT_WORD || mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || template.getName().toLowerCase().endsWith('.docx');

      if (isWordDoc && typeof Drive !== 'undefined' && Drive.Files) {
        try {
          var insertRes = Drive.Files.insert(
            { title: fileName, parents: [{ id: folder.getId() }] },
            template.getBlob(),
            { convert: true }
          );
          if (insertRes && insertRes.id) {
            createdFile = DriveApp.getFileById(insertRes.id);
          }
        } catch (apiErr) {
          Logger.log("Drive API convert failed: " + apiErr.toString());
        }
      }

      if (!createdFile) {
        createdFile = template.makeCopy(fileName, folder);
      }

      var doc = null;
      try {
        doc = DocumentApp.openById(createdFile.getId());
      } catch (openErr) {
        Logger.log("DocumentApp.openById failed: " + openErr.toString());
        throw new Error("Gagal membuka dokumen (Mime: " + createdFile.getMimeType() + ", Nama: " + createdFile.getName() + "): " + openErr.toString());
      }

      var body = doc.getBody();

      var replacements = {
        // Template exact tags (Atlas Pilot Agreement Business MC)
        '{{Submission-Date}}': subDate,
        '{{Submission-Date}': subDate,
        '{{Business-Name}}': bizName,
        '{{Full-Address}}': fullAddr,
        '{{Target-Hours}}': (b.hours || '0').toString(),
        '{{Kit-Quantity}}': (b.quantity || '1').toString(),
        '{{Account-Holder-Name}}': b.accountHolderName || bizName,
        '{{Title}}': titleVal,

        // Standard CRM tags
        '{{BUSINESS_NAME}}': bizName,
        '{{NAMA_BISNIS}}': bizName,
        '{{BUSINESS}}': bizName,
        '{{VENUE}}': bizName,
        '{{OWNER_NAME}}': b.accountHolderName || '',
        '{{NAMA_PEMILIK}}': b.accountHolderName || '',
        '{{ACCOUNT_HOLDER}}': b.accountHolderName || '',
        '{{SDR_NAME}}': b.sdrName || '',
        '{{SDR}}': b.sdrName || '',
        '{{DATE}}': subDate,
        '{{TANGGAL}}': subDate,
        '{{SUBMISSION_DATE}}': subDate,
        '{{HOURS}}': (b.hours || '0').toString(),
        '{{JAM}}': (b.hours || '0').toString(),
        '{{TARGET_JAM}}': (b.hours || '0').toString(),
        '{{HARDWARE}}': normHw,
        '{{QUANTITY}}': (b.quantity || '1').toString(),
        '{{JUMLAH}}': (b.quantity || '1').toString(),
        '{{QTY}}': (b.quantity || '1').toString(),
        '{{RATE}}': (b.rate || '0').toString(),
        '{{TARIF}}': (b.rate || '0').toString(),
        '{{BANK_NAME}}': b.bankName || '',
        '{{BANK}}': b.bankName || '',
        '{{ACCOUNT_NUMBER}}': cleanAcc,
        '{{NO_REK}}': cleanAcc,
        '{{REKENING}}': cleanAcc,
        '{{ACCOUNT_TYPE}}': b.accountType || 'PERSON',
        '{{TIPE_REKENING}}': b.accountType || 'PERSON',
        '{{CITY}}': b.city || '',
        '{{KOTA}}': b.city || '',
        '{{FULL_ADDRESS}}': fullAddr,
        '{{ADDRESS}}': fullAddr,
        '{{ALAMAT}}': fullAddr,
        '{{POSTAL_CODE}}': b.postalCode || '',
        '{{KODE_POS}}': b.postalCode || '',
        '{{EMAIL}}': b.email || '',
        '{{PHONE}}': normPhone,
        '{{TELEPON}}': normPhone,
        '{{NO_HP}}': normPhone,
        '{{NIK}}': cleanNik,
        '{{KTP}}': cleanNik,
        '{{NO_KTP}}': cleanNik,
        '{{STATUS}}': b.status || 'Running'
      };

      // Perform robust multi-pattern replacement across Body, Header, and Footer
      applySmartReplacements(body, replacements);

      try {
        var header = doc.getHeader();
        if (header) {
          applySmartReplacements(header, replacements);
        }
        var footer = doc.getFooter();
        if (footer) {
          applySmartReplacements(footer, replacements);
        }
      } catch (hfErr) { }

      doc.saveAndClose();
    } else {
      // 2. Structured fallback agreement document
      var doc = DocumentApp.create(fileName);
      var body = doc.getBody();

      var title = body.appendParagraph('SURAT PERJANJIAN KERJASAMA (AGREEMENT)');
      title.setHeading(DocumentApp.ParagraphHeading.HEADING_1);
      title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

      var sub = body.appendParagraph('AtlasCapture Operations — Capture Partnership Agreement\n');
      sub.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

      body.appendParagraph('Pada hari ini, ' + subDate + ', disepakati perjanjian kemitraan operasional visual capture antara pihak AtlasCapture dan entitas bisnis mitra dengan rincian data sebagai berikut:\n');

      var tableData = [
        ['Nama Bisnis (Venue)', bizName],
        ['SDR Penanggung Jawab', b.sdrName || '-'],
        ['Tanggal Pengajuan', subDate],
        ['Alamat Lengkap', (b.fullAddress || '') + (b.city ? ', ' + b.city : '') + (b.postalCode ? ' ' + b.postalCode : '')],
        ['Nomor Telepon / WhatsApp', normPhone || '-'],
        ['Email', b.email || '-'],
        ['Nama Pemilik / Rekening', b.accountHolderName || '-'],
        ['Nomor KTP (NIK)', cleanNik || '-'],
        ['Bank & Rekening', (b.bankName || '-') + ' — ' + cleanAcc + ' (' + (b.accountType || 'PERSON') + ')'],
        ['Tipe Hardware / Kit', normHw],
        ['Target Durasi (Hours)', (b.hours || '0') + ' Jam'],
        ['Kuantitas & Rate', (b.quantity || '1') + ' unit @ $' + (b.rate || '0') + '/hr'],
        ['Status Operasional', b.status || 'Running']
      ];

      var table = body.appendTable(tableData);
      table.setBorderWidth(1);
      table.setBorderColor('#CBD5E1');

      body.appendParagraph('\nKetentuan Kemitraan:');
      body.appendParagraph('1. Pihak Bisnis mengizinkan proses perekaman/visual capture sesuai jam dan kuota durasi yang disepakati.');
      body.appendParagraph('2. Seluruh data rekaman diproses secara aman sesuai standar perlindungan privasi AtlasCapture.');
      body.appendParagraph('3. Pembayaran kompensasi akan ditransfer ke rekening di atas setelah verifikasi kelayakan shoot tuntas diselesaikan.\n');

      body.appendParagraph('\nPIHAK PERTAMA (AtlasCapture)                PIHAK KEDUA (' + bizName + ')\n\n\n\n_________________________                  _________________________');

      doc.saveAndClose();

      var docFile = DriveApp.getFileById(doc.getId());
      folder.addFile(docFile);
      DriveApp.getRootFolder().removeFile(docFile);
      createdFile = docFile;
    }

    try {
      createdFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (permErr) {
      Logger.log("Warning setting file sharing permission: " + permErr.toString());
    }

    return createdFile.getUrl();
  } catch (err) {
    Logger.log("Error generating agreement document: " + err.toString());
    throw new Error(err.message || err.toString());
  }
}

function testAgreement() {
  var sample = {
    businessName: "Kopi Kenangan Test",
    sdrName: "Aldy",
    submissionDate: "2026-10-05",
    hours: 10,
    hardware: "MC",
    quantity: 1,
    rate: 5,
    accountHolderName: "Budi Santoso",
    bankName: "BCA",
    accountNumber: "1234567890",
    accountType: "PERSON",
    city: "Tangerang",
    fullAddress: "Jl. Merdeka No. 10",
    postalCode: "15111",
    phone: "+628123456789",
    email: "test@example.com",
    ownerKtp: "3671120910910005",
    title: "Owner of Kopi Kenangan Test"
  };
  var url = generateAgreementDocument(sample);
  Logger.log("Agreement Berhasil Dibuat: " + url);
  return url;
}

function getOrCreateActivityLogsSheet(ss) {
  var sheet = ss.getSheetByName('ActivityLogs');
  if (!sheet) {
    sheet = ss.insertSheet('ActivityLogs');
    sheet.appendRow([
      'LogId',
      'Timestamp',
      'ActorName',
      'ActorEmail',
      'ActorRole',
      'ActionType',
      'BusinessName',
      'SdrName',
      'Details'
    ]);
  }

  return sheet;
}

function recordActivityLog(actor, actionType, businessName, sdrName, details) {
  try {
    var userSs = getUserSpreadsheet();
    var logSheet = getOrCreateActivityLogsSheet(userSs);
    var logId = 'LOG-' + Date.now();
    var timestamp = new Date().toISOString();
    var actorName = (actor && actor.name) ? actor.name : 'System / Unknown';
    var actorEmail = (actor && actor.email) ? actor.email : '';
    var actorRole = (actor && actor.role) ? actor.role : '';
    var detailsStr = (typeof details === 'object') ? JSON.stringify(details) : (details ? details.toString() : '');

    logSheet.appendRow([
      logId,
      timestamp,
      actorName,
      actorEmail,
      actorRole,
      actionType,
      businessName || '',
      sdrName || '',
      detailsStr
    ]);
  } catch (err) {
    Logger.log("Error recording activity log: " + err.toString());
  }
}

function normalizeHardware(hw) {
  if (!hw) return 'MC';
  var str = hw.toString().trim();
  var lower = str.toLowerCase().replace(/[\s\-_]/g, '');
  if (lower === 'mc') return 'MC';
  if (lower === 'mono') return 'MONO';
  if (lower === 'egoexo' || lower === 'ego' || lower === 'exo') return 'EgoExo';
  if (lower === 'mc+mono' || lower === 'mc&mono' || lower === 'mcmono') return 'MC + MONO';
  return str;
}

function normalizePhone(p) {
  if (!p) return '';
  var clean = p.toString().trim().replace(/[^0-9+]/g, '');
  if (clean.indexOf('+62') === 0) {
    clean = '62' + clean.substring(3).replace(/^0+/, '');
  } else if (clean.indexOf('62') === 0) {
    clean = '62' + clean.substring(2).replace(/^0+/, '');
  } else if (clean.indexOf('0') === 0) {
    clean = '62' + clean.substring(1);
  } else if (clean.length > 0) {
    clean = '62' + clean;
  }
  return clean.replace(/[^0-9]/g, '');
}

function normalizeStatus(st) {
  if (!st) return 'Running';
  var lower = st.toString().trim().toLowerCase();
  if (lower === 'running') return 'Running';
  if (lower === 'approved' || lower === 'approve') return 'approved';
  if (lower === 'pending') return 'pending';
  if (lower === 'canceled' || lower === 'cancelled' || lower === 'cancel') return 'canceled';
  if (lower === 'stopped' || lower === 'stop' || lower === 'reject' || lower === 'rejected') return 'Stopped';
  if (lower === 'duplicate' || lower === 'duplikat' || lower === 'fraud') return 'Duplicate';
  return st.toString().trim();
}

function doGet(e) {
  try {
    var ss = getBusinessSpreadsheet();
    if (!ss) throw new Error("Spreadsheet Business tidak ditemukan. Harap periksa BUSINESS_SPREADSHEET_ID.");
    var sheets = ss.getSheets();

    var allRows = [];
    var validSdrNames = [];
    var excludeSheets = ['All Businesses', 'Wise Banks', 'Reynald', 'EditRequests', 'Users', 'ActivityLogs'];

    for (var k = 0; k < sheets.length; k++) {
      var sheet = sheets[k];
      var sheetName = sheet.getName();

      if (excludeSheets.indexOf(sheetName) !== -1) {
        continue;
      }

      validSdrNames.push(sheetName);

      var data = sheet.getDataRange().getDisplayValues();
      var rawValues = sheet.getDataRange().getValues();
      if (data.length <= 1) continue;

      var headers = data[0];
      for (var i = 1; i < data.length; i++) {
        var rowData = data[i];
        var rawRowData = rawValues[i];

        var isEmpty = true;
        for (var c = 0; c < rowData.length; c++) {
          if (rowData[c] && rowData[c].toString().trim() !== '') {
            isEmpty = false;
            break;
          }
        }
        if (isEmpty) continue;

        var obj = {};
        for (var j = 0; j < headers.length; j++) {
          obj[headers[j]] = rowData[j];
        }
        if (!obj['SDR Name'] || obj['SDR Name'].toString().trim() === '') {
          obj['SDR Name'] = sheetName;
        }

        // Accurately parse Hours if cell has Google Sheets date formatting
        if (rawRowData && rawRowData.length > 2) {
          var rawHours = rawRowData[2];
          if (typeof rawHours === 'number') {
            obj['Hours'] = rawHours;
          } else if (rawHours instanceof Date) {
            var epoch = new Date(1899, 11, 30);
            var diffDays = Math.round((rawHours.getTime() - epoch.getTime()) / (24 * 3600 * 1000));
            if (diffDays > 0 && diffDays < 10000) {
              obj['Hours'] = diffDays;
            }
          }
        }

        // Normalize hardware
        if (obj['Hardware']) {
          obj['Hardware'] = normalizeHardware(obj['Hardware']);
        }
        // Normalize status
        if (obj['Status']) {
          obj['Status'] = normalizeStatus(obj['Status']);
        }

        allRows.push(obj);
      }
    }

    // EditRequests removed as approval requests are disabled
    var editRequests = [];

    // Get Users list (without password)
    var usersList = [];
    try {
      var uSs = getUserSpreadsheet();
      var uSheet = uSs.getSheetByName('Users');
      if (uSheet) {
        var uData = uSheet.getDataRange().getValues();
        for (var u = 1; u < uData.length; u++) {
          var uRow = uData[u];
          if (uRow[0] || uRow[1]) {
            var parsedDed = [];
            try {
              var rDed = uRow[5];
              if (rDed) {
                parsedDed = typeof rDed === 'string' && rDed.startsWith('[') ? JSON.parse(rDed) : rDed.toString().split(',').map(function (s) { return s.trim(); });
              }
            } catch (e) { }
            usersList.push({
              name: uRow[0] || '',
              email: uRow[1] || '',
              role: uRow[3] || 'SDR',
              avatarUrl: uRow[4] || '',
              dedicatedSdrs: parsedDed
            });
          }
        }
      }
    } catch (uErr) {
      Logger.log("Could not load Users: " + uErr.toString());
    }

    // Get Activity Logs (last 300 entries, newest first)
    var activityLogs = [];
    try {
      var logSs = getUserSpreadsheet();
      var logSheet = logSs.getSheetByName('ActivityLogs');
      if (logSheet) {
        var logData = logSheet.getDataRange().getValues();
        var startRow = Math.max(1, logData.length - 300);
        for (var lIdx = logData.length - 1; lIdx >= startRow; lIdx--) {
          var lRow = logData[lIdx];
          if (lRow[0] && lRow[0] !== 'LogId') {
            activityLogs.push({
              logId: lRow[0] || '',
              timestamp: lRow[1] ? (lRow[1] instanceof Date ? lRow[1].toISOString() : lRow[1].toString()) : '',
              actorName: lRow[2] || 'System',
              actorEmail: lRow[3] || '',
              actorRole: lRow[4] || '',
              actionType: lRow[5] || 'ACTIVITY',
              businessName: lRow[6] || '',
              sdrName: lRow[7] || '',
              details: lRow[8] || ''
            });
          }
        }
      }
    } catch (lErr) {
      Logger.log("Could not load ActivityLogs: " + lErr.toString());
    }

    var result = {
      businesses: allRows,
      sdrList: validSdrNames,
      editRequests: editRequests,
      users: usersList,
      activityLogs: activityLogs
    };

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var ss = getBusinessSpreadsheet();
    var payload = JSON.parse(e.postData.contents);

    // --------------------------------------------------------------------------
    // 1. SIGNUP
    // --------------------------------------------------------------------------
    if (payload.action === 'signup') {
      var userSs = getUserSpreadsheet();
      var usersSheet = userSs.getSheetByName('Users');
      if (!usersSheet) {
        usersSheet = userSs.insertSheet('Users');
        usersSheet.appendRow(['Name', 'Email', 'Password', 'Role', 'AvatarUrl', 'DedicatedSdrs']);
      }
      var data = usersSheet.getDataRange().getValues();
      var email = (payload.email || '').trim().toLowerCase();
      var password = payload.password;
      var role = payload.role || 'SDR';
      var name = payload.name;
      var avatarUrl = payload.avatarUrl || '';
      var dedicatedSdrs = payload.dedicatedSdrs ? JSON.stringify(payload.dedicatedSdrs) : '[]';

      for (var i = 1; i < data.length; i++) {
        if ((data[i][1] || '').toString().trim().toLowerCase() === email) {
          return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Email already exists' }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
      usersSheet.appendRow([name, email, password, role, avatarUrl, dedicatedSdrs]);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Signup successful',
        user: { name: name, email: email, role: role, avatarUrl: avatarUrl, dedicatedSdrs: payload.dedicatedSdrs || [] }
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // --------------------------------------------------------------------------
    // 2. GOOGLE SIGN-IN AUTHENTICATION
    // --------------------------------------------------------------------------
    if (payload.action === 'google_login') {
      var email = (payload.email || '').trim().toLowerCase();
      var name = (payload.name || '').trim();
      var avatarUrl = payload.avatarUrl || '';
      var userAgent = payload.userAgent || '';

      if (!email) {
        recordLoginHistory(email, name, '', 'GOOGLE_SIGN_IN', 'FAILED', 'Email is missing', userAgent);
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Email wajib diisi' }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      var userSs = getUserSpreadsheet();
      var usersSheet = userSs.getSheetByName('Users');
      if (!usersSheet) {
        usersSheet = userSs.insertSheet('Users');
        usersSheet.appendRow(['Name', 'Email', 'Password', 'Role', 'AvatarUrl', 'DedicatedSdrs']);
      }
      var data = usersSheet.getDataRange().getValues();
      var userFound = false;
      var userObj = null;

      for (var i = 1; i < data.length; i++) {
        var rowEmail = (data[i][1] || '').toString().trim().toLowerCase();
        if (rowEmail === email) {
          userFound = true;
          var parsedDedicated = [];
          try {
            var rawD = data[i][5];
            if (rawD) {
              parsedDedicated = typeof rawD === 'string' && rawD.startsWith('[') ? JSON.parse(rawD) : rawD.toString().split(',').map(function (s) { return s.trim(); });
            }
          } catch (e) { }

          // Update avatar if not yet set or changed
          if (avatarUrl && !data[i][4]) {
            usersSheet.getRange(i + 1, 5).setValue(avatarUrl);
          }

          userObj = {
            name: data[i][0] || name,
            email: rowEmail,
            role: data[i][3] || 'SDR',
            avatarUrl: data[i][4] || avatarUrl || '',
            dedicatedSdrs: parsedDedicated
          };
          break;
        }
      }

      if (!userFound) {
        // Auto-register new Google user into Users sheet
        var assignedRole = (email.indexOf('admin') !== -1 || email === 'salsinatasya@gmail.com') ? 'Sales Manager' : 'SDR';
        var newDedicated = [];
        usersSheet.appendRow([name, email, 'GOOGLE_AUTH', assignedRole, avatarUrl, JSON.stringify(newDedicated)]);

        userObj = {
          name: name,
          email: email,
          role: assignedRole,
          avatarUrl: avatarUrl,
          dedicatedSdrs: newDedicated
        };
      }

      // Record login strictly in backend LoginHistory sheet (never sent to web)
      recordLoginHistory(userObj.email, userObj.name, userObj.role, 'GOOGLE_SIGN_IN', 'SUCCESS', 'Google Sign-In successful', userAgent);

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Google Sign-In successful',
        name: userObj.name,
        email: userObj.email,
        role: userObj.role,
        avatarUrl: userObj.avatarUrl,
        dedicatedSdrs: userObj.dedicatedSdrs,
        user: userObj
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // --------------------------------------------------------------------------
    // 2B. STANDARD LOGIN (Email & Password)
    // --------------------------------------------------------------------------
    if (payload.action === 'login') {
      var email = (payload.email || '').trim().toLowerCase();
      var password = payload.password;
      var userAgent = payload.userAgent || '';

      if (email === 'admin@crm.com' && password === 'admin123') {
        recordLoginHistory(email, 'Admin', 'Sales Manager', 'EMAIL_PASSWORD', 'SUCCESS', 'Admin master login', userAgent);
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          role: 'Sales Manager',
          name: 'Admin',
          email: email,
          avatarUrl: '',
          dedicatedSdrs: []
        })).setMimeType(ContentService.MimeType.JSON);
      }

      var userSs = getUserSpreadsheet();
      var usersSheet = userSs.getSheetByName('Users');
      if (!usersSheet) {
        recordLoginHistory(email, '', '', 'EMAIL_PASSWORD', 'FAILED', 'Sheet Users missing', userAgent);
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Sheet "Users" tidak ditemukan.' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      var data = usersSheet.getDataRange().getValues();

      for (var i = 1; i < data.length; i++) {
        var rowEmail = (data[i][1] || '').toString().trim().toLowerCase();
        var rowPass = (data[i][2] || '').toString();
        if (rowEmail === email && rowPass === password) {
          var parsedDedicated = [];
          try {
            var rawD = data[i][5];
            if (rawD) {
              parsedDedicated = typeof rawD === 'string' && rawD.startsWith('[') ? JSON.parse(rawD) : rawD.toString().split(',').map(function (s) { return s.trim(); });
            }
          } catch (e) { }

          var userRole = data[i][3] || 'SDR';
          var userName = data[i][0] || '';

          // Record login in backend sheet
          recordLoginHistory(email, userName, userRole, 'EMAIL_PASSWORD', 'SUCCESS', 'Standard login', userAgent);

          return ContentService.createTextOutput(JSON.stringify({
            success: true,
            name: userName,
            email: data[i][1],
            role: userRole,
            avatarUrl: data[i][4] || '',
            dedicatedSdrs: parsedDedicated
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }

      recordLoginHistory(email, '', '', 'EMAIL_PASSWORD', 'FAILED', 'Invalid email or password', userAgent);
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Invalid email or password' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // --------------------------------------------------------------------------
    // 3. CHANGE PASSWORD
    // --------------------------------------------------------------------------
    if (payload.action === 'change_password') {
      var email = (payload.email || '').trim().toLowerCase();
      var oldPassword = payload.oldPassword;
      var newPassword = payload.newPassword;

      if (!newPassword || newPassword.length < 6) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Password baru minimal 6 karakter' }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      var userSs = getUserSpreadsheet();
      var usersSheet = userSs.getSheetByName('Users');
      if (!usersSheet) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Sheet "Users" tidak ditemukan.' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      var data = usersSheet.getDataRange().getValues();
      var userFound = false;

      for (var i = 1; i < data.length; i++) {
        var rowEmail = (data[i][1] || '').toString().trim().toLowerCase();
        var rowPass = (data[i][2] || '').toString();
        if (rowEmail === email) {
          userFound = true;
          if (oldPassword && rowPass !== oldPassword) {
            return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Password lama tidak sesuai' }))
              .setMimeType(ContentService.MimeType.JSON);
          }
          usersSheet.getRange(i + 1, 3).setValue(newPassword);
          return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Password berhasil diubah!' }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
      if (!userFound) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'User tidak ditemukan' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    // --------------------------------------------------------------------------
    // 4. UPDATE PROFILE
    // --------------------------------------------------------------------------
    if (payload.action === 'update_profile') {
      var email = (payload.email || '').trim().toLowerCase();
      var newName = payload.name;
      var newAvatar = payload.avatarUrl;
      var newDedicated = payload.dedicatedSdrs;

      var userSs = getUserSpreadsheet();
      var usersSheet = userSs.getSheetByName('Users');
      if (!usersSheet) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Sheet "Users" tidak ditemukan.' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      var data = usersSheet.getDataRange().getValues();

      for (var i = 1; i < data.length; i++) {
        var rowEmail = (data[i][1] || '').toString().trim().toLowerCase();
        if (rowEmail === email) {
          if (newName) usersSheet.getRange(i + 1, 1).setValue(newName);
          if (typeof newAvatar !== 'undefined') usersSheet.getRange(i + 1, 5).setValue(newAvatar);
          if (typeof newDedicated !== 'undefined') {
            usersSheet.getRange(i + 1, 6).setValue(JSON.stringify(newDedicated));
          }
          return ContentService.createTextOutput(JSON.stringify({
            success: true,
            message: 'Profil berhasil diperbarui!',
            name: newName || data[i][0],
            avatarUrl: typeof newAvatar !== 'undefined' ? newAvatar : (data[i][4] || ''),
            dedicatedSdrs: newDedicated || []
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'User tidak ditemukan' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // --------------------------------------------------------------------------
    // 4B. UPDATE USER ROLE (By Sales Manager)
    // --------------------------------------------------------------------------
    if (payload.action === 'update_user_role') {
      var targetEmail = (payload.targetEmail || '').trim().toLowerCase();
      var newRole = payload.newRole || 'SDR';
      var userSs = getUserSpreadsheet();
      var usersSheet = userSs.getSheetByName('Users');
      if (!usersSheet) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Sheet "Users" tidak ditemukan.' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      var data = usersSheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        var rowEmail = (data[i][1] || '').toString().trim().toLowerCase();
        if (rowEmail === targetEmail) {
          usersSheet.getRange(i + 1, 4).setValue(newRole);
          return ContentService.createTextOutput(JSON.stringify({
            success: true,
            message: 'Role user berhasil diubah menjadi ' + newRole
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'User tidak ditemukan' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // --------------------------------------------------------------------------
    // 4C. UPDATE USER DEDICATED SDRS (By Sales Manager)
    // --------------------------------------------------------------------------
    if (payload.action === 'update_user_dedicated_sdrs') {
      var targetEmail = (payload.targetEmail || '').trim().toLowerCase();
      var dedicatedSdrs = payload.dedicatedSdrs || [];
      var userSs = getUserSpreadsheet();
      var usersSheet = userSs.getSheetByName('Users');
      if (!usersSheet) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Sheet "Users" tidak ditemukan.' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      var data = usersSheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        var rowEmail = (data[i][1] || '').toString().trim().toLowerCase();
        if (rowEmail === targetEmail) {
          usersSheet.getRange(i + 1, 6).setValue(JSON.stringify(dedicatedSdrs));
          return ContentService.createTextOutput(JSON.stringify({
            success: true,
            message: 'Dedicated SDRs user berhasil diperbarui!'
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'User tidak ditemukan' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // --------------------------------------------------------------------------
    // 5. GENERATE AGREEMENT (Create & Archive to Google Drive)
    // --------------------------------------------------------------------------
    if (payload.action === 'generate_agreement') {
      var bData = payload.data || {};
      var bName = bData.businessName || payload.businessName || '';
      var sName = bData.sdrName || payload.sdrName || '';
      var targetSheet = findSdrSheet(ss, sName);

      try {
        var agreementUrl = generateAgreementDocument(bData);
        if (!agreementUrl) {
          return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Gagal membuat dokumen agreement (URL kosong).' }))
            .setMimeType(ContentService.MimeType.JSON);
        }

        // Update Column T (20) in Spreadsheet if row found
        if (targetSheet) {
          var sValues = targetSheet.getDataRange().getValues();
          for (var idx = 1; idx < sValues.length; idx++) {
            if (sValues[idx][0] && sValues[idx][0].toString().trim().toLowerCase() === bName.trim().toLowerCase()) {
              targetSheet.getRange(idx + 1, 20).setValue(agreementUrl);
              recordActivityLog(payload.actor, 'GENERATE_AGREEMENT', bName, targetSheet.getName(), 'Agreement dibuat & diarsipkan ke Drive: ' + agreementUrl);
              return ContentService.createTextOutput(JSON.stringify({
                success: true,
                message: 'Dokumen agreement berhasil digenerate dan diarsipkan ke Google Drive!',
                agreementLink: agreementUrl
              })).setMimeType(ContentService.MimeType.JSON);
            }
          }
        }

        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: 'Dokumen agreement berhasil digenerate!',
          agreementLink: agreementUrl
        })).setMimeType(ContentService.MimeType.JSON);
      } catch (genErr) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Gagal generate agreement: ' + (genErr.message || genErr.toString())
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // --------------------------------------------------------------------------
    // 8. SAVE BUSINESS (Direct save / Edit)
    // --------------------------------------------------------------------------
    if (payload.action === 'save_business') {
      var res = saveBusinessToSheet(ss, payload.data, payload.actor);
      return ContentService.createTextOutput(JSON.stringify(res))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // --------------------------------------------------------------------------
    // 8B. UPDATE BUSINESS STATUS (Fast Cell Update)
    // --------------------------------------------------------------------------
    if (payload.action === 'update_business_status') {
      var bName = payload.businessName;
      var sName = payload.sdrName;
      var newSt = normalizeStatus(payload.status);
      var res = updateBusinessStatusInSheet(ss, sName, bName, newSt, payload.actor);
      return ContentService.createTextOutput(JSON.stringify(res))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // --------------------------------------------------------------------------
    // 9. DELETE BUSINESS (Delete Row + Delete KTP Photo from Drive)
    // --------------------------------------------------------------------------
    if (payload.action === 'delete_business') {
      var dataInfo = payload.data || {};
      var targetSheetName = dataInfo.sdrName || '';
      var targetSheet = findSdrSheet(ss, targetSheetName);
      var deletedKtp = false;

      // 1. Delete KTP file from Google Drive if exists
      try {
        var ktpUrl = dataInfo.ktpPhotoUrl || '';
        var businessName = dataInfo.businessName || '';

        if (ktpUrl) {
          var match = ktpUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || ktpUrl.match(/id=([a-zA-Z0-9_-]+)/);
          if (match && match[1]) {
            try {
              var file = DriveApp.getFileById(match[1]);
              file.setTrashed(true);
              deletedKtp = true;
            } catch (dErr) {
              Logger.log("KTP delete by ID error: " + dErr.toString());
            }
          }
        }

        if (!deletedKtp && businessName && KTP_FOLDER_ID) {
          try {
            var folder = DriveApp.getFolderById(KTP_FOLDER_ID);
            var files = folder.searchFiles('title contains "' + businessName + '"');
            while (files.hasNext()) {
              var f = files.next();
              f.setTrashed(true);
              deletedKtp = true;
            }
          } catch (fErr) {
            Logger.log("KTP folder search delete error: " + fErr.toString());
          }
        }
      } catch (ktpErr) {
        Logger.log("KTP removal error: " + ktpErr.toString());
      }

      // 2. Delete row from Spreadsheet
      if (targetSheet) {
        var sheetDataDel = targetSheet.getDataRange().getValues();
        var delRowIndex = -1;
        var deletedRowBackup = null;
        for (var idx = 1; idx < sheetDataDel.length; idx++) {
          if (sheetDataDel[idx][0] && sheetDataDel[idx][0].toString().trim().toLowerCase() === (dataInfo.businessName || '').toString().trim().toLowerCase()) {
            deletedRowBackup = sheetDataDel[idx];
            if (!deletedKtp && (sheetDataDel[idx][16] || sheetDataDel[idx][15])) {
              try {
                var rowKtpUrl = (sheetDataDel[idx][16] || sheetDataDel[idx][15]).toString();
                var m = rowKtpUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || rowKtpUrl.match(/id=([a-zA-Z0-9_-]+)/);
                if (m && m[1]) {
                  DriveApp.getFileById(m[1]).setTrashed(true);
                  deletedKtp = true;
                }
              } catch (eRowKtp) { }
            }
            delRowIndex = idx + 1;
            break;
          }
        }
        if (delRowIndex > -1) {
          targetSheet.deleteRow(delRowIndex);
          recordActivityLog(payload.actor, 'DELETE_BUSINESS', dataInfo.businessName, targetSheet.getName(), {
            deletedBusinessName: dataInfo.businessName,
            sdrName: targetSheet.getName(),
            ktpDeleted: deletedKtp,
            backupData: deletedRowBackup ? {
              hours: deletedRowBackup[2],
              hardware: deletedRowBackup[3],
              rate: deletedRowBackup[5],
              bank: deletedRowBackup[7],
              city: deletedRowBackup[10],
              address: deletedRowBackup[11],
              email: deletedRowBackup[13],
              phone: deletedRowBackup[14],
              status: deletedRowBackup[20]
            } : null
          });
          return ContentService.createTextOutput(JSON.stringify({
            success: true,
            message: 'Bisnis dan file KTP berhasil dihapus dari Spreadsheet & Google Drive!',
            ktpDeleted: deletedKtp
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Baris tidak ditemukan di sheet ' + (targetSheet ? targetSheet.getName() : targetSheetName) }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // --------------------------------------------------------------------------
    // 10. UPLOAD FILE (KTP vs Profile Picture strictly separated)
    // --------------------------------------------------------------------------
    if (payload.action === 'upload_file' || payload.fileData) {
      var decoded = Utilities.base64Decode(payload.fileData);
      var blob = Utilities.newBlob(decoded, payload.mimeType, payload.fileName);

      var isProfile = (payload.folderType === 'profile');
      var targetFolderId = isProfile ? PROFILE_FOLDER_ID : KTP_FOLDER_ID;
      var folder = null;
      try {
        if (targetFolderId) {
          folder = DriveApp.getFolderById(targetFolderId);
        }
      } catch (fErr) {
        Logger.log("Folder lookup error: " + fErr.toString());
      }
      var file = folder ? folder.createFile(blob) : DriveApp.createFile(blob);
      try {
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (shErr) { }
      var fileId = file.getId();
      var directUrl = "https://lh3.googleusercontent.com/d/" + fileId;

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        url: file.getUrl(),
        directUrl: directUrl,
        fileId: fileId,
        folderType: isProfile ? 'profile' : 'ktp'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Unknown action: ' + payload.action }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ----------------------------------------------------------------------------
// Helper: Find SDR Sheet Tab (Case-insensitive & Trimmed)
// ----------------------------------------------------------------------------
function findSdrSheet(ss, sdrName) {
  if (!ss) return null;
  if (!sdrName) return ss.getActiveSheet();
  var target = sdrName.toString().trim().toLowerCase();
  var sheets = ss.getSheets();
  var exclude = ['All Businesses', 'Wise Banks', 'Reynald', 'EditRequests', 'Users', 'ActivityLogs'];

  // 1. Search among valid SDR sheets (case insensitive & trimmed)
  for (var i = 0; i < sheets.length; i++) {
    var name = sheets[i].getName();
    if (exclude.indexOf(name) === -1 && name.trim().toLowerCase() === target) {
      return sheets[i];
    }
  }

  // 2. Direct getSheetByName
  var direct = ss.getSheetByName(sdrName);
  if (direct) return direct;

  // 3. Fallback to active sheet
  return ss.getActiveSheet();
}

// ----------------------------------------------------------------------------
// Helper: Update Single Business Status Cell
// ----------------------------------------------------------------------------
function updateBusinessStatusInSheet(ss, sdrName, businessName, newStatus, actor) {
  var sheet = findSdrSheet(ss, sdrName);
  if (sheet) {
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().trim().toLowerCase() === (businessName || '').toString().trim().toLowerCase()) {
        var oldSt = data[i][20] || 'Running';
        sheet.getRange(i + 1, 21).setValue(newStatus);
        recordActivityLog(actor, 'UPDATE_STATUS', businessName, sheet.getName(), 'Status diubah: ' + oldSt + ' ➔ ' + newStatus);
        return { success: true, message: 'Status updated to ' + newStatus };
      }
    }
  }

  // Fallback search across all sheets
  var allSheets = ss.getSheets();
  for (var s = 0; s < allSheets.length; s++) {
    var sData = allSheets[s].getDataRange().getValues();
    for (var r = 1; r < sData.length; r++) {
      if (sData[r][0] && sData[r][0].toString().trim().toLowerCase() === (businessName || '').toString().trim().toLowerCase()) {
        var oldSt2 = sData[r][20] || 'Running';
        allSheets[s].getRange(r + 1, 21).setValue(newStatus);
        recordActivityLog(actor, 'UPDATE_STATUS', businessName, allSheets[s].getName(), 'Status diubah: ' + oldSt2 + ' ➔ ' + newStatus);
        return { success: true, message: 'Status updated to ' + newStatus };
      }
    }
  }
  return { success: false, error: 'Business not found' };
}

// ----------------------------------------------------------------------------
// Helper Function: Save / Update Business in Spreadsheet
// ----------------------------------------------------------------------------
function saveBusinessToSheet(ss, b, actor) {
  var sheetName = b.sdrName || '';
  var sheet = findSdrSheet(ss, sheetName);

  if (!sheet) {
    sheet = ss.getActiveSheet();
  }

  var normalizedHw = normalizeHardware(b.hardware);
  var normalizedSt = normalizeStatus(b.status || 'Running');

  // Format NIK: store as plain text with leading single quote so Google Sheets preserves all 16 digits without scientific notation
  var cleanNik = (b.ownerKtp || '').toString().trim().replace(/^'/, '');
  var formattedNik = cleanNik ? "'" + cleanNik : '';

  // Format Account Number with single quote to preserve leading zeros
  var cleanAcc = (b.accountNumber || '').toString().trim().replace(/^'/, '');
  var formattedAcc = cleanAcc ? "'" + cleanAcc : '';

  var parsedHours = Number(b.hours) || 0;
  var parsedQty = Number(b.quantity) || 0;
  var parsedRate = Number(b.rate) || 0;

  // Auto-generate Agreement document & archive to Google Drive if not already present
  var autoGeneratedAgreement = false;
  if (!b.agreementLink || b.agreementLink.toString().trim() === '') {
    try {
      var genLink = generateAgreementDocument(b);
      if (genLink) {
        b.agreementLink = genLink;
        autoGeneratedAgreement = true;
      }
    } catch (agErr) {
      Logger.log("Agreement auto-generation error: " + agErr.toString());
    }
  }

  var row = [
    b.businessName || '',
    b.submissionDate || '',
    parsedHours,                      // Col C (3): Hours (Numeric integer)
    normalizedHw,
    parsedQty,
    parsedRate,
    b.accountHolderName || '',
    b.bankName || '',
    formattedAcc,
    b.accountType || 'PERSON',
    b.city || '',
    b.fullAddress || '',
    b.postalCode || '',
    b.email || '',                    // Col N (14): Email (setelah pembaruan letak kolom)
    normalizePhone(b.phone),          // Col O (15): Phone Number (berada setelah Email)
    formattedNik,                     // Col P (16): Business Owner ID card Number (NIK 16-digit text)
    b.ktpPhotoUrl || '',              // Col Q (17): ID Card Audit (for Admin) (Link KTP Google Drive)
    b.proposalLink || '',             // Col R (18): Proposal
    b.mouLink || '',                  // Col S (19): MoU
    b.agreementLink || '',            // Col T (20): Agreement (Link Dokumen Google Drive)
    normalizedSt                      // Col U (21): Status (Default: Running)
  ];

  var originalSheetName = b.originalSdrName || sheetName;
  var originalSheet = findSdrSheet(ss, originalSheetName) || sheet;
  var originalBusinessName = b.originalBusinessName || b.businessName;

  var foundRowIndex = -1;
  var sheetData = originalSheet.getDataRange().getValues();
  for (var i = 1; i < sheetData.length; i++) {
    if (sheetData[i][0] && sheetData[i][0].toString().trim().toLowerCase() === (originalBusinessName || '').toString().trim().toLowerCase()) {
      foundRowIndex = i + 1;
      break;
    }
  }

  if (b.originalBusinessName && foundRowIndex > -1) {
    if (originalSheet.getName() !== sheet.getName()) {
      originalSheet.deleteRow(foundRowIndex);
      sheet.appendRow(row);
      var newLastRow = sheet.getLastRow();
      sheet.getRange(newLastRow, 3).setNumberFormat('0');
      recordActivityLog(actor, 'EDIT_BUSINESS', b.businessName, sheet.getName(), 'Pindah SDR dari ' + originalSheet.getName() + ' ke ' + sheet.getName() + ' dan update data (' + parsedHours + ' hrs, ' + normalizedHw + ')' + (autoGeneratedAgreement ? ' [Agreement Generated]' : ''));
      return {
        success: true,
        message: (autoGeneratedAgreement ? 'Bisnis & Agreement berhasil dibuat di Drive! ' : '') + 'Row moved and updated in ' + sheet.getName(),
        agreementLink: b.agreementLink || '',
        autoGeneratedAgreement: autoGeneratedAgreement
      };
    } else {
      sheet.getRange(foundRowIndex, 1, 1, row.length).setValues([row]);
      sheet.getRange(foundRowIndex, 3).setNumberFormat('0');
      recordActivityLog(actor, 'EDIT_BUSINESS', b.businessName, sheet.getName(), 'Update data bisnis (' + parsedHours + ' hrs, ' + normalizedHw + ', Status: ' + normalizedSt + ')' + (autoGeneratedAgreement ? ' [Agreement Generated]' : ''));
      return {
        success: true,
        message: (autoGeneratedAgreement ? 'Bisnis & Agreement berhasil dibuat di Drive! ' : '') + 'Row updated in ' + sheet.getName(),
        agreementLink: b.agreementLink || '',
        autoGeneratedAgreement: autoGeneratedAgreement
      };
    }
  } else {
    sheet.appendRow(row);
    var newLastRow = sheet.getLastRow();
    sheet.getRange(newLastRow, 3).setNumberFormat('0');
    recordActivityLog(actor, 'ADD_BUSINESS', b.businessName, sheet.getName(), 'Tambah bisnis baru (' + parsedHours + ' hrs, ' + normalizedHw + ', Rate: $' + parsedRate + ') SDR: ' + sheet.getName() + (autoGeneratedAgreement ? ' [Agreement Generated & Archived to Drive]' : ''));
    return {
      success: true,
      message: (autoGeneratedAgreement ? 'Bisnis & Agreement berhasil dibuat & diarsipkan ke Drive! ' : '') + 'Row appended to ' + sheet.getName(),
      agreementLink: b.agreementLink || '',
      autoGeneratedAgreement: autoGeneratedAgreement
    };
  }
}

function doOptions(e) {
  return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
}
