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
 * CẤU TRÚC SHEET "Users" (hàng 1 = headers):
 * | Name | Email | Password | Phone | Role | MemberLevel | JoinDate |
 *
 * CẤU TRÚC SHEET "Orders" (hàng 1 = headers):
 * | Timestamp | OrderID | Name | Email | Phone | Courses | CourseIDs | Total | PaymentMethod | Status | Notes |
 */

var SHEET_ID = '1gfLd8IwgattNDYrluU4GmitZk_IuXcn6OQqRn0hLpjM';

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
      case 'appendUser':
        result = handleAppendUser(data);
        break;
      case 'getUsers':
        result = handleGetUsers();
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
  var sheet = ss.getSheetByName('Users');

  if (!sheet) {
    return { success: false, error: 'Sheet "Users" không tồn tại' };
  }

  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();

  if (values.length < 2) {
    return { success: false, error: 'Chưa có dữ liệu người dùng' };
  }

  // Headers ở hàng 1
  var headers = values[0].map(function(h) { return h.toString().trim(); });
  var emailCol = headers.indexOf('Email');
  var passwordCol = headers.indexOf('Password');
  var nameCol = headers.indexOf('Name');
  var phoneCol = headers.indexOf('Phone');
  var roleCol = headers.indexOf('Role');
  var levelCol = headers.indexOf('MemberLevel');

  if (emailCol === -1 || passwordCol === -1) {
    return { success: false, error: 'Sheet thiếu cột Email hoặc Password' };
  }

  // Tìm user
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var rowEmail = (row[emailCol] || '').toString().toLowerCase().trim();
    var rowPassword = (row[passwordCol] || '').toString().trim();

    if (rowEmail === email && rowPassword === password) {
      var role = (roleCol !== -1 ? row[roleCol] : 'user').toString().toLowerCase().trim();
      var memberLevel = (levelCol !== -1 ? row[levelCol] : 'Free').toString().trim();

      // Validate memberLevel
      if (['Free', 'Premium', 'VIP'].indexOf(memberLevel) === -1) {
        memberLevel = 'Free';
      }

      return {
        success: true,
        user: {
          name: nameCol !== -1 ? row[nameCol].toString().trim() : '',
          email: row[emailCol].toString().trim(),
          phone: phoneCol !== -1 ? row[phoneCol].toString().trim() : '',
          role: role === 'admin' ? 'admin' : 'user',
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
  var sheet = ss.getSheetByName('Users');

  if (!sheet) {
    // Tạo sheet Users nếu chưa có
    sheet = ss.insertSheet('Users');
    sheet.appendRow(['Name', 'Email', 'Password', 'Phone', 'Role', 'MemberLevel', 'JoinDate']);
  }

  // Kiểm tra email đã tồn tại chưa
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  var headers = values[0].map(function(h) { return h.toString().trim(); });
  var emailCol = headers.indexOf('Email');

  if (emailCol !== -1) {
    for (var i = 1; i < values.length; i++) {
      var rowEmail = (values[i][emailCol] || '').toString().toLowerCase().trim();
      if (rowEmail === email) {
        return { success: false, error: 'Email đã được sử dụng. Vui lòng dùng email khác.' };
      }
    }
  }

  // Thêm user mới
  var joinDate = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss');
  sheet.appendRow([name, email, password, phone, 'user', 'Free', joinDate]);

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
  var sheetName = data.sheetName || 'Orders';
  var rowData = data.rowData;

  if (!rowData || !Array.isArray(rowData)) {
    return { success: false, error: 'Thiếu dữ liệu đơn hàng' };
  }

  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(['Timestamp', 'OrderID', 'Name', 'Email', 'Phone', 'Courses', 'CourseIDs', 'Total', 'PaymentMethod', 'Status', 'Notes']);
  }

  sheet.appendRow(rowData);

  return { success: true };
}

// =====================
// APPEND USER (generic)
// =====================
function handleAppendUser(data) {
  var sheetName = data.sheetName || 'Users';
  var rowData = data.rowData;

  if (!rowData || !Array.isArray(rowData)) {
    return { success: false, error: 'Thiếu dữ liệu người dùng' };
  }

  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(['Name', 'Email', 'Password', 'Phone', 'Role', 'MemberLevel', 'JoinDate']);
  }

  sheet.appendRow(rowData);

  return { success: true };
}

// =====================
// GET USERS (read all)
// =====================
function handleGetUsers() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('Users');

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
      if (headers[j] !== 'Password') { // Không trả về password
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
  var sheet = ss.getSheetByName('Users');

  if (!sheet) {
    return { success: false, error: 'Sheet Users không tồn tại' };
  }

  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  var headers = values[0].map(function(h) { return h.toString().trim(); });
  var emailCol = headers.indexOf('Email');
  var levelCol = headers.indexOf('MemberLevel');

  if (emailCol === -1 || levelCol === -1) {
    return { success: false, error: 'Sheet thiếu cột Email hoặc MemberLevel' };
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
