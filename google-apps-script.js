// ============================================================================
// CRM TANGERANG - Google Apps Script Backend
// ============================================================================

var BUSINESS_SPREADSHEET_ID = '1_DQZYyDkzm6hjMsgX5ItEFTCyE3l1phKILN2bh7BvFc'; // Spreadsheet Bisnis
var USER_SPREADSHEET_ID = '1YRSrVZFm3gxTU7ZzCjPWYbMzgHo0EufvMQ9ZQ0XRPM4';     // Spreadsheet Users & EditRequests
var KTP_FOLDER_ID = '1Nfgfh5duU-YvwoFFUbxOj-F4fREbNVeT';                       // Google Drive Folder untuk Foto KTP
var PROFILE_FOLDER_ID = '1E7yPKqTcSKdvRQ2csTX0gKoe0rVnrQiy';                   // Google Drive Folder untuk Foto Profil

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

function getOrCreateEditRequestsSheet(ss) {
  var sheet = ss.getSheetByName('EditRequests');
  if (!sheet) {
    sheet = ss.insertSheet('EditRequests');
    sheet.appendRow([
      'RequestId',
      'Timestamp',
      'RequesterName',
      'RequesterRole',
      'BusinessName',
      'SdrName',
      'Status',
      'OriginalDataJson',
      'UpdatedDataJson',
      'ReviewerNote'
    ]);
  }
  return sheet;
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
  if (lower === 'fraud') return 'Fraud';
  return st.toString().trim();
}

function doGet(e) {
  try {
    var ss = getBusinessSpreadsheet();
    if (!ss) throw new Error("Spreadsheet Business tidak ditemukan. Harap periksa BUSINESS_SPREADSHEET_ID.");
    var sheets = ss.getSheets();
    
    var allRows = [];
    var validSdrNames = [];
    var excludeSheets = ['All Businesses', 'Wise Banks', 'Reynald', 'EditRequests', 'Users'];
    
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

    // Get Pending Edit Requests
    var editRequests = [];
    try {
      var userSs = getUserSpreadsheet();
      var editSheet = userSs.getSheetByName('EditRequests');
      if (editSheet) {
        var editData = editSheet.getDataRange().getValues();
        for (var er = 1; er < editData.length; er++) {
          var row = editData[er];
          if (row[6] === 'pending') {
            editRequests.push({
              requestId: row[0],
              timestamp: row[1],
              requesterName: row[2],
              requesterRole: row[3],
              businessName: row[4],
              sdrName: row[5],
              status: row[6],
              originalData: row[7] ? JSON.parse(row[7]) : null,
              updatedData: row[8] ? JSON.parse(row[8]) : null,
              reviewerNote: row[9] || ''
            });
          }
        }
      }
    } catch (eReqErr) {
      Logger.log("Could not load EditRequests: " + eReqErr.toString());
    }

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
                parsedDed = typeof rDed === 'string' && rDed.startsWith('[') ? JSON.parse(rDed) : rDed.toString().split(',').map(function(s){return s.trim();});
              }
            } catch(e) {}
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
    
    var result = {
      businesses: allRows,
      sdrList: validSdrNames,
      editRequests: editRequests,
      users: usersList
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
    // 2. LOGIN
    // --------------------------------------------------------------------------
    if (payload.action === 'login') {
      var email = (payload.email || '').trim().toLowerCase();
      var password = payload.password;
      
      if (email === 'admin@crm.com' && password === 'admin123') {
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
              parsedDedicated = typeof rawD === 'string' && rawD.startsWith('[') ? JSON.parse(rawD) : rawD.toString().split(',').map(function(s){return s.trim();});
            }
          } catch(e) {}

          return ContentService.createTextOutput(JSON.stringify({ 
            success: true, 
            name: data[i][0], 
            email: data[i][1], 
            role: data[i][3] || 'SDR',
            avatarUrl: data[i][4] || '',
            dedicatedSdrs: parsedDedicated
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
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
    // 5. SUBMIT EDIT REQUEST (For SDR edits - sets status to pending in Sheet)
    // --------------------------------------------------------------------------
    if (payload.action === 'submit_edit_request') {
      var userSs = getUserSpreadsheet();
      var editSheet = getOrCreateEditRequestsSheet(userSs);
      
      var reqId = 'REQ-' + Date.now();
      var timestamp = new Date().toISOString();
      var requesterName = payload.requesterName || '';
      var requesterRole = payload.requesterRole || 'SDR';
      var businessName = payload.businessName || '';
      var sdrName = payload.sdrName || '';
      var originalData = payload.originalData || {};
      var updatedData = payload.updatedData || {};
      
      // Mark updated data status as pending
      updatedData.status = 'pending';
      
      var originalDataJson = JSON.stringify(originalData);
      var updatedDataJson = JSON.stringify(updatedData);
      
      editSheet.appendRow([
        reqId,
        timestamp,
        requesterName,
        requesterRole,
        businessName,
        sdrName,
        'pending',
        originalDataJson,
        updatedDataJson,
        ''
      ]);

      // Also update business status in business spreadsheet to pending
      try {
        updateBusinessStatusInSheet(ss, sdrName, businessName, 'pending');
      } catch (stErr) {
        Logger.log("Could not update status to pending in sheet: " + stErr.toString());
      }

      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'Permintaan edit berhasil dikirim. Status bisnis diubah menjadi pending menunggu persetujuan.',
        requestId: reqId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // --------------------------------------------------------------------------
    // 6. APPROVE EDIT REQUEST (By Field Ops / Sales Manager / Coordinator)
    // --------------------------------------------------------------------------
    if (payload.action === 'approve_edit_request') {
      var reqId = payload.requestId;
      var reviewedBy = payload.reviewedBy || '';
      var userSs = getUserSpreadsheet();
      var editSheet = getOrCreateEditRequestsSheet(userSs);
      var editData = editSheet.getDataRange().getValues();
      var foundRow = -1;
      var updatedData = null;

      for (var r = 1; r < editData.length; r++) {
        if (editData[r][0] === reqId) {
          foundRow = r + 1;
          updatedData = JSON.parse(editData[r][8]);
          break;
        }
      }

      if (foundRow === -1 || !updatedData) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Request ID tidak ditemukan' }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      // Ensure status is approved upon approval
      updatedData.status = 'approved';

      // Apply the update to Business Spreadsheet
      saveBusinessToSheet(ss, updatedData);

      // Mark request as approved
      editSheet.getRange(foundRow, 7).setValue('approved');
      editSheet.getRange(foundRow, 10).setValue('Approved by ' + reviewedBy);

      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'Perubahan berhasil disetujui (Status: approved) dan data di Spreadsheet telah diperbarui!' 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // --------------------------------------------------------------------------
    // 7. REJECT EDIT REQUEST (By Field Ops / Sales Manager / Coordinator)
    // --------------------------------------------------------------------------
    if (payload.action === 'reject_edit_request') {
      var reqId = payload.requestId;
      var reviewedBy = payload.reviewedBy || '';
      var reason = payload.reason || 'Ditolak oleh ' + reviewedBy;
      var userSs = getUserSpreadsheet();
      var editSheet = getOrCreateEditRequestsSheet(userSs);
      var editData = editSheet.getDataRange().getValues();
      var foundRow = -1;

      for (var r = 1; r < editData.length; r++) {
        if (editData[r][0] === reqId) {
          foundRow = r + 1;
          break;
        }
      }

      if (foundRow === -1) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Request ID tidak ditemukan' }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      editSheet.getRange(foundRow, 7).setValue('rejected');
      editSheet.getRange(foundRow, 10).setValue(reason);

      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'Perubahan ditolak.' 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // --------------------------------------------------------------------------
    // 8. SAVE BUSINESS (Direct save / Edit)
    // --------------------------------------------------------------------------
    if (payload.action === 'save_business') {
      var res = saveBusinessToSheet(ss, payload.data);
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
      var res = updateBusinessStatusInSheet(ss, sName, bName, newSt);
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
        for (var idx = 1; idx < sheetDataDel.length; idx++) {
          if (sheetDataDel[idx][0] && sheetDataDel[idx][0].toString().trim().toLowerCase() === (dataInfo.businessName || '').toString().trim().toLowerCase()) {
            if (!deletedKtp && (sheetDataDel[idx][16] || sheetDataDel[idx][15])) {
              try {
                var rowKtpUrl = (sheetDataDel[idx][16] || sheetDataDel[idx][15]).toString();
                var m = rowKtpUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || rowKtpUrl.match(/id=([a-zA-Z0-9_-]+)/);
                if (m && m[1]) {
                  DriveApp.getFileById(m[1]).setTrashed(true);
                  deletedKtp = true;
                }
              } catch (eRowKtp) {}
            }
            delRowIndex = idx + 1;
            break;
          }
        }
        if (delRowIndex > -1) {
          targetSheet.deleteRow(delRowIndex);
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
      } catch (shErr) {}
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
  var exclude = ['All Businesses', 'Wise Banks', 'Reynald', 'EditRequests', 'Users'];
  
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
function updateBusinessStatusInSheet(ss, sdrName, businessName, newStatus) {
  var sheet = findSdrSheet(ss, sdrName);
  if (sheet) {
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().trim().toLowerCase() === (businessName || '').toString().trim().toLowerCase()) {
        sheet.getRange(i + 1, 21).setValue(newStatus);
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
        allSheets[s].getRange(r + 1, 21).setValue(newStatus);
        return { success: true, message: 'Status updated to ' + newStatus };
      }
    }
  }
  return { success: false, error: 'Business not found' };
}

// ----------------------------------------------------------------------------
// Helper Function: Save / Update Business in Spreadsheet
// ----------------------------------------------------------------------------
function saveBusinessToSheet(ss, b) {
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
    normalizePhone(b.phone),
    b.email || '',
    formattedNik,                     // Col P (16): Business Owner ID card Number (NIK 16-digit text)
    b.ktpPhotoUrl || '',              // Col Q (17): ID Card Audit (for Admin) (Link KTP Google Drive)
    b.proposalLink || '',             // Col R (18): Proposal
    b.mouLink || '',                  // Col S (19): MoU
    b.agreementLink || '',            // Col T (20): Agreement
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
      return { success: true, message: 'Row moved and updated in ' + sheet.getName() };
    } else {
      sheet.getRange(foundRowIndex, 1, 1, row.length).setValues([row]);
      sheet.getRange(foundRowIndex, 3).setNumberFormat('0');
      return { success: true, message: 'Row updated in ' + sheet.getName() };
    }
  } else {
    sheet.appendRow(row);
    var newLastRow = sheet.getLastRow();
    sheet.getRange(newLastRow, 3).setNumberFormat('0');
    return { success: true, message: 'Row appended to ' + sheet.getName() };
  }
}

function doOptions(e) {
  return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
}
