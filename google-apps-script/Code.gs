/**
 * WePower Academy - Google Apps Script (Auto-Setup)
 * ==================================================
 *
 * HƯỚNG DẪN CÀI ĐẶT:
 * 1. Mở Google Sheets: https://docs.google.com/spreadsheets/d/1KOuhPurnWcHOayeRn7r-hNgVl13Zf7Q0z0r4d1-K0JY/edit
 * 2. Vào menu: Tiện ích mở rộng > Apps Script
 * 3. Xóa code mặc định, dán toàn bộ code này vào
 * 4. Lưu (Ctrl+S)
 * 5. Chạy hàm "setupSheets" từ menu dropdown để tự động tạo các sheet + headers
 * 6. Deploy > Triển khai mới > Loại: Ứng dụng web
 *    - Thực thi với: Tôi (your account)
 *    - Ai có quyền truy cập: Bất kỳ ai
 * 7. Copy URL deploy, dán vào file .env.local trong project:
 *    GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/XXXX/exec
 *
 * TỰ ĐỘNG TẠO 3 SHEET:
 * - "Đăng ký": Email | Password | Role | Tên | Level | Enrolled | Completed | Phone
 * - "Đơn hàng": Thời gian | Mã đơn | Tên | Email | SĐT | Khóa học | Mã KH | Tổng tiền | Thanh toán | Trạng thái | Ghi chú
 * - "Khóa học": ID | Tên khóa học | Giảng viên | Giá | Danh mục | Mô tả
 *
 * Khi chạy setupSheets(), nó cũng tạo sẵn 1 tài khoản admin mặc định:
 *   Email: admin@wepower.vn | Password: 123456
 */

var SHEET_ID = '1KOuhPurnWcHOayeRn7r-hNgVl13Zf7Q0z0r4d1-K0JY';

// Tên các tab
var TAB_USERS = 'Đăng ký';
var TAB_ORDERS = 'Đơn hàng';
var TAB_COURSES = 'Khóa học';

// Headers cho từng tab
var HEADERS_USERS = ['Email', 'Password', 'Role', 'Tên', 'Level', 'Enrolled', 'Completed', 'Phone'];
var HEADERS_ORDERS = ['Thời gian', 'Mã đơn', 'Tên', 'Email', 'SĐT', 'Khóa học', 'Mã KH', 'Tổng tiền', 'Thanh toán', 'Trạng thái', 'Ghi chú'];
var HEADERS_COURSES = ['ID', 'Tên khóa học', 'Giảng viên', 'Giá', 'Danh mục', 'Mô tả'];

// Tên cột dùng trong code
var COL_EMAIL = 'Email';
var COL_PASSWORD = 'Password';
var COL_ROLE = 'Role';
var COL_NAME = 'Tên';
var COL_LEVEL = 'Level';
var COL_PHONE = 'Phone';

// =====================================================
// AUTO-SETUP: Chạy hàm này 1 lần để tạo tất cả sheets
// =====================================================
function setupSheets() {
  var ss = SpreadsheetApp.openById(SHEET_ID);

  // Tạo sheet "Đăng ký"
  var usersSheet = ensureSheet_(ss, TAB_USERS, HEADERS_USERS);

  // Tạo tài khoản admin mặc định nếu chưa có data
  if (usersSheet.getLastRow() <= 1) {
    usersSheet.appendRow(['admin@wepower.vn', '123456', 'Admin', 'Admin WePower', 'VIP', '', '', '']);
    Logger.log('Đã tạo tài khoản admin mặc định: admin@wepower.vn / 123456');
  }

  // Tạo sheet "Đơn hàng"
  ensureSheet_(ss, TAB_ORDERS, HEADERS_ORDERS);

  // Tạo sheet "Khóa học"
  ensureSheet_(ss, TAB_COURSES, HEADERS_COURSES);

  // Xóa sheet mặc định "Sheet1" nếu còn tồn tại và có ít nhất 2 sheet khác
  var defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('Trang tính1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(defaultSheet);
      Logger.log('Đã xóa sheet mặc định');
    } catch (e) {
      // Bỏ qua nếu không xóa được
    }
  }

  // Format header cho đẹp
  var sheets = [
    { sheet: ss.getSheetByName(TAB_USERS), cols: HEADERS_USERS.length },
    { sheet: ss.getSheetByName(TAB_ORDERS), cols: HEADERS_ORDERS.length },
    { sheet: ss.getSheetByName(TAB_COURSES), cols: HEADERS_COURSES.length }
  ];

  sheets.forEach(function(s) {
    if (s.sheet) {
      var headerRange = s.sheet.getRange(1, 1, 1, s.cols);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4a86e8');
      headerRange.setFontColor('#ffffff');
      s.sheet.setFrozenRows(1);
    }
  });

  Logger.log('Setup hoàn tất! 3 sheets đã được tạo với headers và format.');
}

// Helper: tạo sheet nếu chưa có, thêm headers nếu trống
function ensureSheet_(ss, tabName, headers) {
  var sheet = ss.getSheetByName(tabName);

  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    sheet.appendRow(headers);
    Logger.log('Đã tạo sheet: ' + tabName);
  } else {
    // Sheet đã có, kiểm tra headers
    var firstRow = sheet.getRange(1, 1, 1, sheet.getMaxColumns()).getValues()[0];
    var hasHeaders = firstRow.some(function(cell) { return cell.toString().trim() !== ''; });

    if (!hasHeaders) {
      // Sheet trống, thêm headers
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      Logger.log('Đã thêm headers vào sheet: ' + tabName);
    }
  }

  return sheet;
}

// =====================
// WEB APP ENDPOINTS
// =====================
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;

    // Tự động setup nếu sheet chưa có
    autoSetupIfNeeded_();

    var result;

    switch (action) {
      case 'login':
        result = handleLogin(data);
        break;
      case 'register':
        result = handleRegister(data);
        break;
      case 'appendOrder':
        result = handleAppendOrder(data);
        break;
      case 'getUsers':
        result = handleGetUsers();
        break;
      case 'updateUserLevel':
        result = handleUpdateUserLevel(data);
        break;
      case 'deleteUser':
        result = handleDeleteUser(data);
        break;
      case 'setup':
        setupSheets();
        result = { success: true, message: 'Setup hoàn tất!' };
        break;
      default:
        result = { success: false, error: 'Action không hợp lệ: ' + action };
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var action = (e.parameter && e.parameter.action) || 'ping';

  // Tự động setup nếu sheet chưa có
  autoSetupIfNeeded_();

  if (action === 'ping') {
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'WePower Apps Script is running!', version: '2.0' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'getUsers') {
    var result = handleGetUsers();
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'setup') {
    setupSheets();
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Setup hoàn tất!' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ success: false, error: 'Unknown action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Tự động tạo sheet khi chưa có (chạy mỗi request)
function autoSetupIfNeeded_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var usersSheet = ss.getSheetByName(TAB_USERS);

  if (!usersSheet) {
    setupSheets();
  }
}

// =====================
// LOGIN
// =====================
function handleLogin(data) {
  var email = (data.email || '').toLowerCase().trim();
  var password = data.password || '';

  if (!email || !password) {
    return { success: false, error: 'Email và mật khẩu không được để trống' };
  }

  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(TAB_USERS);

  if (!sheet) {
    return { success: false, error: 'Sheet "' + TAB_USERS + '" không tồn tại. Hãy chạy setupSheets().' };
  }

  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();

  if (values.length < 2) {
    return { success: false, error: 'Chưa có dữ liệu người dùng' };
  }

  var headers = values[0].map(function(h) { return h.toString().trim(); });
  var emailCol = headers.indexOf(COL_EMAIL);
  var passwordCol = headers.indexOf(COL_PASSWORD);
  var nameCol = headers.indexOf(COL_NAME);
  var phoneCol = headers.indexOf(COL_PHONE);
  var roleCol = headers.indexOf(COL_ROLE);
  var levelCol = headers.indexOf(COL_LEVEL);

  if (emailCol === -1 || passwordCol === -1) {
    return { success: false, error: 'Sheet thiếu cột "' + COL_EMAIL + '" hoặc "' + COL_PASSWORD + '"' };
  }

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var rowEmail = (row[emailCol] || '').toString().toLowerCase().trim();
    var rowPassword = (row[passwordCol] || '').toString().trim();

    if (rowEmail === email && rowPassword === password) {
      var roleRaw = (roleCol !== -1 ? row[roleCol] : 'user').toString().trim();
      var memberLevel = (levelCol !== -1 ? row[levelCol] : 'Free').toString().trim();

      if (['Free', 'Premium', 'VIP'].indexOf(memberLevel) === -1) {
        memberLevel = 'Free';
      }

      return {
        success: true,
        user: {
          name: nameCol !== -1 ? row[nameCol].toString().trim() : '',
          email: row[emailCol].toString().trim(),
          phone: phoneCol !== -1 ? row[phoneCol].toString().trim() : '',
          role: isAdmin_(roleRaw) ? 'admin' : 'user',
          memberLevel: memberLevel
        }
      };
    }
  }

  return { success: false, error: 'Email hoặc mật khẩu không đúng' };
}

// =====================
// REGISTER
// =====================
function handleRegister(data) {
  var name = (data.name || '').trim();
  var email = (data.email || '').toLowerCase().trim();
  var password = (data.password || '').trim();
  var phone = (data.phone || '').trim();

  if (!name || !email || !password) {
    return { success: false, error: 'Vui lòng điền đầy đủ thông tin' };
  }

  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(TAB_USERS);

  if (!sheet) {
    sheet = ensureSheet_(ss, TAB_USERS, HEADERS_USERS);
  }

  // Kiểm tra email đã tồn tại chưa
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  var headers = values[0].map(function(h) { return h.toString().trim(); });
  var emailCol = headers.indexOf(COL_EMAIL);

  if (emailCol !== -1) {
    for (var i = 1; i < values.length; i++) {
      var rowEmail = (values[i][emailCol] || '').toString().toLowerCase().trim();
      if (rowEmail === email) {
        return { success: false, error: 'Email đã được sử dụng. Vui lòng dùng email khác.' };
      }
    }
  }

  // Thêm user mới: Email | Password | Role | Tên | Level | Enrolled | Completed | Phone
  sheet.appendRow([email, password, 'Student', name, 'Free', '', '', phone]);

  return {
    success: true,
    user: {
      name: name,
      email: email,
      phone: phone,
      role: 'user',
      memberLevel: 'Free'
    }
  };
}

// =====================
// APPEND ORDER
// =====================
function handleAppendOrder(data) {
  var rowData = data.rowData;

  if (!rowData || !Array.isArray(rowData)) {
    return { success: false, error: 'Thiếu dữ liệu đơn hàng' };
  }

  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(TAB_ORDERS);

  if (!sheet) {
    sheet = ensureSheet_(ss, TAB_ORDERS, HEADERS_ORDERS);
  }

  sheet.appendRow(rowData);

  return { success: true };
}

// =====================
// GET USERS (không trả password)
// =====================
function handleGetUsers() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(TAB_USERS);

  if (!sheet) {
    return { success: true, users: [] };
  }

  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();

  if (values.length < 2) {
    return { success: true, users: [] };
  }

  var headers = values[0].map(function(h) { return h.toString().trim(); });
  var users = [];

  for (var i = 1; i < values.length; i++) {
    var user = {};
    for (var j = 0; j < headers.length; j++) {
      if (headers[j] !== COL_PASSWORD) {
        user[headers[j]] = values[i][j] ? values[i][j].toString().trim() : '';
      }
    }
    users.push(user);
  }

  return { success: true, users: users };
}

// =====================
// UPDATE USER LEVEL
// =====================
function handleUpdateUserLevel(data) {
  var email = (data.email || '').toLowerCase().trim();
  var newLevel = (data.memberLevel || '').trim();

  if (!email || !newLevel) {
    return { success: false, error: 'Thiếu email hoặc level mới' };
  }

  if (['Free', 'Premium', 'VIP'].indexOf(newLevel) === -1) {
    return { success: false, error: 'Level không hợp lệ. Chỉ chấp nhận: Free, Premium, VIP' };
  }

  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(TAB_USERS);

  if (!sheet) {
    return { success: false, error: 'Sheet "' + TAB_USERS + '" không tồn tại' };
  }

  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  var headers = values[0].map(function(h) { return h.toString().trim(); });
  var emailCol = headers.indexOf(COL_EMAIL);
  var levelCol = headers.indexOf(COL_LEVEL);

  if (emailCol === -1 || levelCol === -1) {
    return { success: false, error: 'Sheet thiếu cột "' + COL_EMAIL + '" hoặc "' + COL_LEVEL + '"' };
  }

  for (var i = 1; i < values.length; i++) {
    var rowEmail = (values[i][emailCol] || '').toString().toLowerCase().trim();
    if (rowEmail === email) {
      sheet.getRange(i + 1, levelCol + 1).setValue(newLevel);
      return { success: true, message: 'Đã cập nhật level thành ' + newLevel };
    }
  }

  return { success: false, error: 'Không tìm thấy user với email: ' + email };
}

// =====================
// DELETE USER
// =====================
function handleDeleteUser(data) {
  var email = (data.email || '').toLowerCase().trim();

  if (!email) {
    return { success: false, error: 'Thiếu email' };
  }

  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(TAB_USERS);

  if (!sheet) {
    return { success: false, error: 'Sheet "' + TAB_USERS + '" không tồn tại' };
  }

  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  var headers = values[0].map(function(h) { return h.toString().trim(); });
  var emailCol = headers.indexOf(COL_EMAIL);

  if (emailCol === -1) {
    return { success: false, error: 'Sheet thiếu cột "' + COL_EMAIL + '"' };
  }

  for (var i = 1; i < values.length; i++) {
    var rowEmail = (values[i][emailCol] || '').toString().toLowerCase().trim();
    if (rowEmail === email) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Đã xóa user: ' + email };
    }
  }

  return { success: false, error: 'Không tìm thấy user với email: ' + email };
}

// =====================
// HELPER
// =====================
function isAdmin_(roleValue) {
  var normalized = (roleValue || '').toLowerCase().trim();
  return (normalized === 'admin' ||
          normalized === 'administrator' ||
          normalized.indexOf('quản trị') !== -1 ||
          normalized === 'qtv');
}
