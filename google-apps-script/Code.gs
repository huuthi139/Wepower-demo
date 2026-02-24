/**
 * Google Apps Script for WePower Academy - UNIFIED VERSION
 * =========================================================
 * Gộp cả 2 chức năng:
 * - GET: addRegistration, addOrder (code gốc đã hoạt động)
 * - POST: login, register, addOrder, getUsers, updateUserLevel, deleteUser
 *
 * SETUP:
 * 1. Mở Apps Script Editor (script.google.com)
 * 2. Xóa code cũ, paste toàn bộ file này
 * 3. Lưu (Ctrl+S)
 * 4. Chạy hàm "setupSheets" 1 lần để tạo tab Users
 * 5. Deploy > New deployment > Web app > Anyone > Deploy
 * 6. Copy URL mới → update vào .env.local
 */

const SPREADSHEET_ID = '1KOuhPurnWcHOayeRn7r-hNgVl13Zf7Q0z0r4d1-K0JY';

// Tab names
const TAB_USERS = 'Users';
const TAB_REGISTRATIONS = 'Registrations';
const TAB_ORDERS = 'Orders';

// User tab headers
const HEADERS_USERS = ['Email', 'Password', 'Role', 'Tên', 'Level', 'Enrolled', 'Completed', 'Phone'];

// =============================================
// AUTO SETUP: Chạy 1 lần để tạo tab Users
// =============================================
function setupSheets() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Tạo tab Users nếu chưa có
  var usersSheet = ss.getSheetByName(TAB_USERS);
  if (!usersSheet) {
    usersSheet = ss.insertSheet(TAB_USERS);
    usersSheet.appendRow(HEADERS_USERS);

    // Format header
    var headerRange = usersSheet.getRange(1, 1, 1, HEADERS_USERS.length);
    headerRange.setBackground('#4a86e8');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    usersSheet.setFrozenRows(1);

    Logger.log('Đã tạo tab Users');
  }

  // Tạo admin mặc định nếu chưa có data
  if (usersSheet.getLastRow() <= 1) {
    usersSheet.appendRow(['admin@wepower.vn', '123456', 'Admin', 'Admin WePower', 'VIP', '', '', '']);
    Logger.log('Đã tạo tài khoản admin: admin@wepower.vn / 123456');
  }

  // Đảm bảo tab Registrations tồn tại
  if (!ss.getSheetByName(TAB_REGISTRATIONS)) {
    var regSheet = ss.insertSheet(TAB_REGISTRATIONS);
    regSheet.appendRow([
      'Thời gian', 'Mã đơn hàng', 'Tên học viên', 'Email',
      'Số điện thoại', 'Tên khóa học', 'Mã khóa học', 'Giá',
      'Phương thức thanh toán', 'Trạng thái', 'Nguồn giới thiệu', 'Ghi chú'
    ]);
    var h = regSheet.getRange(1, 1, 1, 12);
    h.setBackground('#FF0000');
    h.setFontColor('#FFFFFF');
    h.setFontWeight('bold');
    regSheet.setFrozenRows(1);
    Logger.log('Đã tạo tab Registrations');
  }

  // Đảm bảo tab Orders tồn tại
  if (!ss.getSheetByName(TAB_ORDERS)) {
    var ordSheet = ss.insertSheet(TAB_ORDERS);
    ordSheet.appendRow([
      'Thời gian', 'Mã đơn hàng', 'Tên khách hàng', 'Email',
      'Số điện thoại', 'Khóa học', 'Mã khóa học', 'Tổng tiền',
      'Phương thức thanh toán', 'Trạng thái', 'Mã giao dịch'
    ]);
    var h2 = ordSheet.getRange(1, 1, 1, 11);
    h2.setBackground('#FF0000');
    h2.setFontColor('#FFFFFF');
    h2.setFontWeight('bold');
    ordSheet.setFrozenRows(1);
    Logger.log('Đã tạo tab Orders');
  }

  Logger.log('Setup hoàn tất!');
}

// =============================================
// HANDLE GET REQUESTS (code gốc đã hoạt động)
// =============================================
function doGet(e) {
  try {
    Logger.log('=== Incoming GET Request ===');
    Logger.log('Parameters: ' + JSON.stringify(e.parameter));

    var action = e.parameter.action;

    if (!action) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          message: 'WePower Academy API is running!',
          version: '3.0-unified',
          actions_get: ['addRegistration', 'addOrder', 'getUsers', 'ping'],
          actions_post: ['login', 'register', 'addRegistration', 'addOrder', 'appendOrder', 'getUsers', 'updateUserLevel', 'deleteUser', 'setup']
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'ping') {
      return createResponse(true, 'WePower API is running! Version 3.0');
    }

    if (action === 'addRegistration') {
      return handleRegistration(e.parameter);
    }

    if (action === 'addOrder') {
      return handleOrder(e.parameter);
    }

    if (action === 'getUsers') {
      return ContentService
        .createTextOutput(JSON.stringify(handleGetUsers()))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return createResponse(false, 'Unknown action: ' + action);
  } catch (error) {
    Logger.log('GET ERROR: ' + error.toString());
    return createResponse(false, error.toString());
  }
}

// =============================================
// HANDLE POST REQUESTS
// =============================================
function doPost(e) {
  try {
    Logger.log('=== Incoming POST Request ===');

    if (!e.postData) {
      return createResponse(false, 'No data received');
    }

    var data = JSON.parse(e.postData.contents);
    var action = data.action;

    Logger.log('POST action: ' + action);

    switch (action) {
      case 'login':
        return ContentService
          .createTextOutput(JSON.stringify(handleLogin(data)))
          .setMimeType(ContentService.MimeType.JSON);

      case 'register':
        return ContentService
          .createTextOutput(JSON.stringify(handleRegister(data)))
          .setMimeType(ContentService.MimeType.JSON);

      case 'addRegistration':
        return handleRegistration(data.data || data);

      case 'addOrder':
        return handleOrder(data.data || data);

      case 'appendOrder':
        return ContentService
          .createTextOutput(JSON.stringify(handleAppendOrder(data)))
          .setMimeType(ContentService.MimeType.JSON);

      case 'getUsers':
        return ContentService
          .createTextOutput(JSON.stringify(handleGetUsers()))
          .setMimeType(ContentService.MimeType.JSON);

      case 'updateUserLevel':
        return ContentService
          .createTextOutput(JSON.stringify(handleUpdateUserLevel(data)))
          .setMimeType(ContentService.MimeType.JSON);

      case 'deleteUser':
        return ContentService
          .createTextOutput(JSON.stringify(handleDeleteUser(data)))
          .setMimeType(ContentService.MimeType.JSON);

      case 'setup':
        setupSheets();
        return createResponse(true, 'Setup hoàn tất!');

      default:
        return createResponse(false, 'Unknown action: ' + action);
    }
  } catch (error) {
    Logger.log('POST ERROR: ' + error.toString());
    return createResponse(false, error.toString());
  }
}

// =============================================
// LOGIN (từ tab Users)
// =============================================
function handleLogin(data) {
  var email = (data.email || '').toLowerCase().trim();
  var password = data.password || '';

  if (!email || !password) {
    return { success: false, error: 'Email và mật khẩu không được để trống' };
  }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(TAB_USERS);

  if (!sheet) {
    return { success: false, error: 'Tab Users chưa tồn tại. Hãy chạy setupSheets().' };
  }

  var values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    return { success: false, error: 'Chưa có dữ liệu người dùng' };
  }

  var headers = values[0].map(function(h) { return h.toString().trim(); });
  var emailCol = headers.indexOf('Email');
  var passwordCol = headers.indexOf('Password');
  var nameCol = headers.indexOf('Tên');
  var phoneCol = headers.indexOf('Phone');
  var roleCol = headers.indexOf('Role');
  var levelCol = headers.indexOf('Level');

  if (emailCol === -1 || passwordCol === -1) {
    return { success: false, error: 'Tab Users thiếu cột Email hoặc Password' };
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

// =============================================
// REGISTER (thêm vào tab Users)
// =============================================
function handleRegister(data) {
  var name = (data.name || '').trim();
  var email = (data.email || '').toLowerCase().trim();
  var password = (data.password || '').trim();
  var phone = (data.phone || '').trim();

  if (!name || !email || !password) {
    return { success: false, error: 'Vui lòng điền đầy đủ thông tin' };
  }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(TAB_USERS);

  if (!sheet) {
    // Auto-create
    setupSheets();
    sheet = ss.getSheetByName(TAB_USERS);
  }

  // Kiểm tra email đã tồn tại chưa
  var values = sheet.getDataRange().getValues();
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

// =============================================
// REGISTRATION - Đăng ký khóa học (code gốc)
// =============================================
function handleRegistration(data) {
  try {
    Logger.log('Processing registration for: ' + data.studentName);

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(TAB_REGISTRATIONS);

    if (!sheet) {
      sheet = ss.insertSheet(TAB_REGISTRATIONS);
      sheet.appendRow([
        'Thời gian', 'Mã đơn hàng', 'Tên học viên', 'Email',
        'Số điện thoại', 'Tên khóa học', 'Mã khóa học', 'Giá',
        'Phương thức thanh toán', 'Trạng thái', 'Nguồn giới thiệu', 'Ghi chú'
      ]);
      var headerRange = sheet.getRange(1, 1, 1, 12);
      headerRange.setBackground('#FF0000');
      headerRange.setFontColor('#FFFFFF');
      headerRange.setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      data.timestamp || new Date().toLocaleString('vi-VN'),
      data.orderId,
      data.studentName,
      data.email,
      data.phone,
      data.courseName,
      data.courseId,
      data.price,
      data.paymentMethod,
      data.paymentStatus,
      data.referralSource || '',
      data.notes || ''
    ]);

    sheet.autoResizeColumns(1, 12);
    Logger.log('Registration added: ' + data.orderId);
    return createResponse(true, 'Registration added: ' + data.orderId);
  } catch (error) {
    Logger.log('Registration error: ' + error.toString());
    return createResponse(false, error.toString());
  }
}

// =============================================
// ORDER (code gốc)
// =============================================
function handleOrder(data) {
  try {
    Logger.log('Processing order: ' + data.orderId);

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(TAB_ORDERS);

    if (!sheet) {
      sheet = ss.insertSheet(TAB_ORDERS);
      sheet.appendRow([
        'Thời gian', 'Mã đơn hàng', 'Tên khách hàng', 'Email',
        'Số điện thoại', 'Khóa học', 'Mã khóa học', 'Tổng tiền',
        'Phương thức thanh toán', 'Trạng thái', 'Mã giao dịch'
      ]);
      var headerRange = sheet.getRange(1, 1, 1, 11);
      headerRange.setBackground('#FF0000');
      headerRange.setFontColor('#FFFFFF');
      headerRange.setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      data.timestamp || new Date().toLocaleString('vi-VN'),
      data.orderId,
      data.studentName,
      data.email,
      data.phone,
      data.courses,
      data.courseIds,
      data.totalAmount,
      data.paymentMethod,
      data.paymentStatus,
      data.transactionId || ''
    ]);

    sheet.autoResizeColumns(1, 11);
    Logger.log('Order added: ' + data.orderId);
    return createResponse(true, 'Order added: ' + data.orderId);
  } catch (error) {
    Logger.log('Order error: ' + error.toString());
    return createResponse(false, error.toString());
  }
}

// =============================================
// APPEND ORDER (từ API route - dùng rowData array)
// =============================================
function handleAppendOrder(data) {
  var rowData = data.rowData;

  if (!rowData || !Array.isArray(rowData)) {
    return { success: false, error: 'Thiếu dữ liệu đơn hàng' };
  }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(TAB_ORDERS);

  if (!sheet) {
    setupSheets();
    sheet = ss.getSheetByName(TAB_ORDERS);
  }

  sheet.appendRow(rowData);
  return { success: true };
}

// =============================================
// GET USERS (không trả password)
// =============================================
function handleGetUsers() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(TAB_USERS);

  if (!sheet) {
    return { success: true, users: [] };
  }

  var values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    return { success: true, users: [] };
  }

  var headers = values[0].map(function(h) { return h.toString().trim(); });
  var users = [];

  for (var i = 1; i < values.length; i++) {
    var user = {};
    for (var j = 0; j < headers.length; j++) {
      if (headers[j] !== 'Password') {
        user[headers[j]] = values[i][j] ? values[i][j].toString().trim() : '';
      }
    }
    users.push(user);
  }

  return { success: true, users: users };
}

// =============================================
// UPDATE USER LEVEL
// =============================================
function handleUpdateUserLevel(data) {
  var email = (data.email || '').toLowerCase().trim();
  var newLevel = (data.memberLevel || '').trim();

  if (!email || !newLevel) {
    return { success: false, error: 'Thiếu email hoặc level mới' };
  }

  if (['Free', 'Premium', 'VIP'].indexOf(newLevel) === -1) {
    return { success: false, error: 'Level không hợp lệ. Chỉ chấp nhận: Free, Premium, VIP' };
  }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(TAB_USERS);

  if (!sheet) {
    return { success: false, error: 'Tab Users không tồn tại' };
  }

  var values = sheet.getDataRange().getValues();
  var headers = values[0].map(function(h) { return h.toString().trim(); });
  var emailCol = headers.indexOf('Email');
  var levelCol = headers.indexOf('Level');

  for (var i = 1; i < values.length; i++) {
    var rowEmail = (values[i][emailCol] || '').toString().toLowerCase().trim();
    if (rowEmail === email) {
      sheet.getRange(i + 1, levelCol + 1).setValue(newLevel);
      return { success: true, message: 'Đã cập nhật level thành ' + newLevel };
    }
  }

  return { success: false, error: 'Không tìm thấy user: ' + email };
}

// =============================================
// DELETE USER
// =============================================
function handleDeleteUser(data) {
  var email = (data.email || '').toLowerCase().trim();

  if (!email) {
    return { success: false, error: 'Thiếu email' };
  }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(TAB_USERS);

  if (!sheet) {
    return { success: false, error: 'Tab Users không tồn tại' };
  }

  var values = sheet.getDataRange().getValues();
  var headers = values[0].map(function(h) { return h.toString().trim(); });
  var emailCol = headers.indexOf('Email');

  for (var i = 1; i < values.length; i++) {
    var rowEmail = (values[i][emailCol] || '').toString().toLowerCase().trim();
    if (rowEmail === email) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Đã xóa user: ' + email };
    }
  }

  return { success: false, error: 'Không tìm thấy user: ' + email };
}

// =============================================
// HELPERS
// =============================================
function createResponse(success, message) {
  var response = {
    success: success,
    message: message,
    timestamp: new Date().toISOString()
  };

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function isAdmin_(roleValue) {
  var normalized = (roleValue || '').toLowerCase().trim();
  return (normalized === 'admin' ||
          normalized === 'administrator' ||
          normalized.indexOf('quản trị') !== -1 ||
          normalized === 'qtv');
}

// =============================================
// TEST FUNCTIONS
// =============================================
function testRegistration() {
  var testParams = {
    action: 'addRegistration',
    timestamp: new Date().toLocaleString('vi-VN'),
    orderId: 'WP' + Date.now(),
    studentName: 'Test User',
    email: 'test@test.com',
    phone: '0901234567',
    courseName: 'UI/UX Design',
    courseId: 'ui-ux',
    price: 2990000,
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'Pending',
    referralSource: 'Facebook',
    notes: 'Test'
  };

  var result = handleRegistration(testParams);
  Logger.log('Test result: ' + result.getContent());
}

function testLogin() {
  var result = handleLogin({ email: 'admin@wepower.vn', password: '123456' });
  Logger.log('Login test: ' + JSON.stringify(result));
}
