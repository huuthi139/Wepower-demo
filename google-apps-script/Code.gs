/**
 * WePower Academy - Google Apps Script
 * =====================================
 *
 * HƯỚNG DẪN CÀI ĐẶT:
 * 1. Mở Google Sheets: https://docs.google.com/spreadsheets/d/1gfLd8IwgattNDYrluU4GmitZk_IuXcn6OQqRn0hLpjM/edit
 * 2. Vào menu: Tiện ích mở rộng > Apps Script
 * 3. Xóa code mặc định, dán toàn bộ code này vào
 * 4. Lưu (Ctrl+S)
 * 5. Deploy > Triển khai mới > Loại: Ứng dụng web
 *    - Thực thi với: Tôi (your account)
 *    - Ai có quyền truy cập: Bất kỳ ai
 * 6. Copy URL deploy, dán vào file .env.local trong project:
 *    GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/XXXX/exec
 *
 * CẤU TRÚC SHEET "Đăng ký" (hàng 1 = headers):
 * | Email | Password | Role | Tên | Level | Enrolled | Completed | Phone |
 *
 * CẤU TRÚC SHEET "Đơn hàng" (hàng 1 = headers):
 * | (tùy theo cấu trúc đơn hàng) |
 *
 * CẤU TRÚC SHEET "Khóa học" (hàng 1 = headers):
 * | (tùy theo cấu trúc khóa học) |
 */

var SHEET_ID = '1gfLd8IwgattNDYrluU4GmitZk_IuXcn6OQqRn0hLpjM';

// Tên các tab trong Google Sheets
var TAB_USERS = 'Đăng ký';
var TAB_ORDERS = 'Đơn hàng';
var TAB_COURSES = 'Khóa học';

// Tên các cột trong tab "Đăng ký" - khớp với headers thực tế
var COL_EMAIL = 'Email';
var COL_PASSWORD = 'Password';
var COL_ROLE = 'Role';
var COL_NAME = 'Tên';
var COL_LEVEL = 'Level';
var COL_ENROLLED = 'Enrolled';
var COL_COMPLETED = 'Completed';
var COL_PHONE = 'Phone';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;

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
  var action = e.parameter.action || 'ping';

  if (action === 'ping') {
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'WePower Apps Script is running!' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'getUsers') {
    var result = handleGetUsers();
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ success: false, error: 'Unknown action' }))
    .setMimeType(ContentService.MimeType.JSON);
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
    return { success: false, error: 'Sheet "' + TAB_USERS + '" không tồn tại' };
  }

  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();

  if (values.length < 2) {
    return { success: false, error: 'Chưa có dữ liệu người dùng' };
  }

  // Headers ở hàng 1
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

  // Tìm user
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var rowEmail = (row[emailCol] || '').toString().toLowerCase().trim();
    var rowPassword = (row[passwordCol] || '').toString().trim();

    if (rowEmail === email && rowPassword === password) {
      var roleRaw = (roleCol !== -1 ? row[roleCol] : 'user').toString().trim();
      var roleNormalized = roleRaw.toLowerCase();
      var memberLevel = (levelCol !== -1 ? row[levelCol] : 'Free').toString().trim();

      // Validate memberLevel
      if (['Free', 'Premium', 'VIP'].indexOf(memberLevel) === -1) {
        memberLevel = 'Free';
      }

      // Hỗ trợ cả tiếng Việt và tiếng Anh cho vai trò admin
      var isAdmin = (roleNormalized === 'admin' ||
                     roleNormalized === 'administrator' ||
                     roleNormalized.indexOf('quản trị') !== -1 ||
                     roleNormalized === 'qtv');

      return {
        success: true,
        user: {
          name: nameCol !== -1 ? row[nameCol].toString().trim() : '',
          email: row[emailCol].toString().trim(),
          phone: phoneCol !== -1 ? row[phoneCol].toString().trim() : '',
          role: isAdmin ? 'admin' : 'user',
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
    // Tạo sheet nếu chưa có
    sheet = ss.insertSheet(TAB_USERS);
    sheet.appendRow([COL_EMAIL, COL_PASSWORD, COL_ROLE, COL_NAME, COL_LEVEL, COL_ENROLLED, COL_COMPLETED, COL_PHONE]);
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

  // Thêm user mới - đúng thứ tự: Email | Password | Role | Tên | Level | Enrolled | Completed | Phone
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
    sheet = ss.insertSheet(TAB_ORDERS);
    // Headers sẽ được tạo theo dữ liệu đầu tiên
  }

  sheet.appendRow(rowData);

  return { success: true };
}

// =====================
// GET USERS (read all - không trả password)
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
      if (headers[j] !== COL_PASSWORD) { // Không trả về mật khẩu
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
