/**
 * WePower Academy - Google Apps Script
 * =====================================
 *
 * HƯỚNG DẪN CÀI ĐẶT:
 * 1. Vào https://script.google.com → New project
 * 2. Xóa code mặc định, paste toàn bộ file này vào
 * 3. Nhấn Save (Ctrl+S)
 * 4. Chạy hàm "setup" 1 lần (chọn setup từ dropdown → Run)
 *    → Cấp quyền khi được hỏi
 * 5. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    → Deploy → Copy URL
 * 6. Paste URL vào Vercel Environment Variables:
 *    GOOGLE_SCRIPT_URL = <URL vừa copy>
 * 7. Redeploy trên Vercel
 *
 * SHEET ID: 1KOuhPurnWcHOayeRn7r-hNgVl13Zf7Q0z0r4d1-K0JY
 *
 * CẤU TRÚC TABS:
 * - Users:   Email | Password | Role | Tên | Level | Enrolled | Completed | Phone
 * - Orders:  Thời gian | Mã đơn hàng | Tên khách hàng | Email | SĐT | Khóa học | Mã khóa học | Tổng tiền | PTTT | Trạng thái | Mã GD
 * - Courses: ID | Title | Thumbnail | Instructor | Price | OriginalPrice | Rating | ReviewsCount | EnrollmentsCount | Duration | LessonsCount | Badge | Category | MemberLevel
 */

var SPREADSHEET_ID = '1KOuhPurnWcHOayeRn7r-hNgVl13Zf7Q0z0r4d1-K0JY';

// ==========================================
// SETUP - Chạy 1 lần để tạo các tab
// ==========================================
function setup() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Tab Users
  var users = ss.getSheetByName('Users');
  if (!users) {
    users = ss.insertSheet('Users');
    users.appendRow(['Email', 'Password', 'Role', 'Tên', 'Level', 'Enrolled', 'Completed', 'Phone']);
    formatHeader_(users, 8, '#4a86e8');
    // Tạo admin mặc định
    users.appendRow(['admin@wepower.vn', '123456', 'Admin', 'Admin WePower', 'VIP', '', '', '']);
    Logger.log('Tab Users đã tạo + admin mặc định: admin@wepower.vn / 123456');
  }

  // Tab Orders
  var orders = ss.getSheetByName('Orders');
  if (!orders) {
    orders = ss.insertSheet('Orders');
    orders.appendRow(['Thời gian', 'Mã đơn hàng', 'Tên khách hàng', 'Email', 'Số điện thoại', 'Khóa học', 'Mã khóa học', 'Tổng tiền', 'Phương thức thanh toán', 'Trạng thái', 'Mã giao dịch']);
    formatHeader_(orders, 11, '#e84a4a');
    Logger.log('Tab Orders đã tạo');
  }

  // Tab Courses (nếu chưa có)
  var courses = ss.getSheetByName('Courses');
  if (!courses) {
    courses = ss.insertSheet('Courses');
    courses.appendRow(['ID', 'Title', 'Thumbnail', 'Instructor', 'Price', 'OriginalPrice', 'Rating', 'ReviewsCount', 'EnrollmentsCount', 'Duration', 'LessonsCount', 'Badge', 'Category', 'MemberLevel']);
    formatHeader_(courses, 14, '#4a9e4a');
    Logger.log('Tab Courses đã tạo');
  }

  Logger.log('Setup hoàn tất!');
}

// ==========================================
// MAIN HANDLER - Tất cả request đều qua GET
// ==========================================
function doGet(e) {
  try {
    var action = (e.parameter.action || '').trim();

    if (!action) {
      return jsonResponse_({ success: true, message: 'WePower API is running', actions: ['login', 'register', 'appendOrder', 'getUsers', 'updateUserLevel', 'deleteUser'] });
    }

    switch (action) {
      case 'login':
        return jsonResponse_(handleLogin_(e.parameter));

      case 'register':
        return jsonResponse_(handleRegister_(e.parameter));

      case 'appendOrder':
        return jsonResponse_(handleAppendOrder_(e.parameter));

      case 'getUsers':
        return jsonResponse_(handleGetUsers_());

      case 'updateUserLevel':
        return jsonResponse_(handleUpdateUserLevel_(e.parameter));

      case 'deleteUser':
        return jsonResponse_(handleDeleteUser_(e.parameter));

      default:
        return jsonResponse_({ success: false, error: 'Unknown action: ' + action });
    }
  } catch (err) {
    Logger.log('ERROR: ' + err.toString());
    return jsonResponse_({ success: false, error: err.toString() });
  }
}

// doPost cũng hỗ trợ (fallback)
function doPost(e) {
  try {
    if (!e.postData) return jsonResponse_({ success: false, error: 'No data' });

    var data = JSON.parse(e.postData.contents);
    var action = data.action || '';

    switch (action) {
      case 'login':       return jsonResponse_(handleLogin_(data));
      case 'register':    return jsonResponse_(handleRegister_(data));
      case 'appendOrder': return jsonResponse_(handleAppendOrder_(data));
      case 'getUsers':    return jsonResponse_(handleGetUsers_());
      case 'updateUserLevel': return jsonResponse_(handleUpdateUserLevel_(data));
      case 'deleteUser':  return jsonResponse_(handleDeleteUser_(data));
      case 'setup':       setup(); return jsonResponse_({ success: true, message: 'Setup done' });
      default: return jsonResponse_({ success: false, error: 'Unknown action: ' + action });
    }
  } catch (err) {
    Logger.log('POST ERROR: ' + err.toString());
    return jsonResponse_({ success: false, error: err.toString() });
  }
}

// ==========================================
// LOGIN
// ==========================================
function handleLogin_(data) {
  var email = (data.email || '').toLowerCase().trim();
  var password = (data.password || '').trim();

  if (!email || !password) {
    return { success: false, error: 'Email và mật khẩu không được để trống' };
  }

  var sheet = getSheet_('Users');
  if (!sheet) return { success: false, error: 'Tab Users chưa tồn tại. Chạy setup() trước.' };

  var rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: false, error: 'Chưa có dữ liệu người dùng' };

  var h = headerIndex_(rows[0]);

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var rowEmail = (row[h.Email] || '').toString().toLowerCase().trim();
    var rowPass = (row[h.Password] || '').toString().trim();

    if (rowEmail === email && rowPass === password) {
      var role = (row[h.Role] || 'user').toString().trim();
      var level = (row[h.Level] || 'Free').toString().trim();
      if (['Free', 'Premium', 'VIP'].indexOf(level) === -1) level = 'Free';

      return {
        success: true,
        user: {
          name: (row[h['Tên']] || '').toString().trim(),
          email: rowEmail,
          phone: (row[h.Phone] || '').toString().trim(),
          role: isAdmin_(role) ? 'admin' : 'user',
          memberLevel: level
        }
      };
    }
  }

  return { success: false, error: 'Email hoặc mật khẩu không đúng' };
}

// ==========================================
// REGISTER
// ==========================================
function handleRegister_(data) {
  var name = (data.name || '').trim();
  var email = (data.email || '').toLowerCase().trim();
  var password = (data.password || '').trim();
  var phone = (data.phone || '').trim();

  if (!name || !email || !password) {
    return { success: false, error: 'Vui lòng điền đầy đủ thông tin' };
  }

  var sheet = getSheet_('Users');
  if (!sheet) {
    setup();
    sheet = getSheet_('Users');
  }

  // Kiểm tra email trùng
  var rows = sheet.getDataRange().getValues();
  var h = headerIndex_(rows[0]);

  for (var i = 1; i < rows.length; i++) {
    var rowEmail = (rows[i][h.Email] || '').toString().toLowerCase().trim();
    if (rowEmail === email) {
      return { success: false, error: 'Email đã được sử dụng. Vui lòng dùng email khác.' };
    }
  }

  // Thêm user: Email | Password | Role | Tên | Level | Enrolled | Completed | Phone
  sheet.appendRow([email, password, 'Student', name, 'Free', '', '', phone]);
  Logger.log('New user: ' + email);

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

// ==========================================
// APPEND ORDER (nhận rowData array từ Vercel)
// ==========================================
function handleAppendOrder_(data) {
  var rowData = data.rowData;

  // Nếu là string (từ GET query), parse JSON
  if (typeof rowData === 'string') {
    try {
      rowData = JSON.parse(rowData);
    } catch (err) {
      return { success: false, error: 'Invalid rowData JSON: ' + err.toString() };
    }
  }

  if (!rowData || !Array.isArray(rowData)) {
    return { success: false, error: 'Thiếu rowData hoặc không phải array' };
  }

  var sheet = getSheet_('Orders');
  if (!sheet) {
    setup();
    sheet = getSheet_('Orders');
  }

  sheet.appendRow(rowData);
  Logger.log('Order added: ' + (rowData[1] || 'unknown'));

  return { success: true };
}

// ==========================================
// GET USERS (không trả password)
// ==========================================
function handleGetUsers_() {
  var sheet = getSheet_('Users');
  if (!sheet) return { success: true, users: [] };

  var rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, users: [] };

  var headers = rows[0].map(function(h) { return h.toString().trim(); });
  var users = [];

  for (var i = 1; i < rows.length; i++) {
    var user = {};
    for (var j = 0; j < headers.length; j++) {
      if (headers[j] !== 'Password') {
        user[headers[j]] = rows[i][j] ? rows[i][j].toString().trim() : '';
      }
    }
    users.push(user);
  }

  return { success: true, users: users };
}

// ==========================================
// UPDATE USER LEVEL
// ==========================================
function handleUpdateUserLevel_(data) {
  var email = (data.email || '').toLowerCase().trim();
  var newLevel = (data.memberLevel || '').trim();

  if (!email || !newLevel) return { success: false, error: 'Thiếu email hoặc level' };
  if (['Free', 'Premium', 'VIP'].indexOf(newLevel) === -1) {
    return { success: false, error: 'Level không hợp lệ (Free/Premium/VIP)' };
  }

  var sheet = getSheet_('Users');
  if (!sheet) return { success: false, error: 'Tab Users không tồn tại' };

  var rows = sheet.getDataRange().getValues();
  var h = headerIndex_(rows[0]);

  for (var i = 1; i < rows.length; i++) {
    if ((rows[i][h.Email] || '').toString().toLowerCase().trim() === email) {
      sheet.getRange(i + 1, h.Level + 1).setValue(newLevel);
      return { success: true, message: 'Đã cập nhật level: ' + newLevel };
    }
  }

  return { success: false, error: 'Không tìm thấy user: ' + email };
}

// ==========================================
// DELETE USER
// ==========================================
function handleDeleteUser_(data) {
  var email = (data.email || '').toLowerCase().trim();
  if (!email) return { success: false, error: 'Thiếu email' };

  var sheet = getSheet_('Users');
  if (!sheet) return { success: false, error: 'Tab Users không tồn tại' };

  var rows = sheet.getDataRange().getValues();
  var h = headerIndex_(rows[0]);

  for (var i = 1; i < rows.length; i++) {
    if ((rows[i][h.Email] || '').toString().toLowerCase().trim() === email) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Đã xóa user: ' + email };
    }
  }

  return { success: false, error: 'Không tìm thấy user: ' + email };
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================
function getSheet_(name) {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name);
}

function headerIndex_(headerRow) {
  var map = {};
  for (var i = 0; i < headerRow.length; i++) {
    map[headerRow[i].toString().trim()] = i;
  }
  return map;
}

function isAdmin_(role) {
  var r = (role || '').toLowerCase().trim();
  return r === 'admin' || r === 'administrator' || r.indexOf('quản trị') !== -1 || r === 'qtv';
}

function formatHeader_(sheet, cols, color) {
  var range = sheet.getRange(1, 1, 1, cols);
  range.setBackground(color);
  range.setFontColor('#FFFFFF');
  range.setFontWeight('bold');
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, cols);
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// TEST - Chạy để kiểm tra kết nối
// ==========================================
function testConnection() {
  var sheet = getSheet_('Users');
  if (!sheet) {
    Logger.log('Tab Users chưa tồn tại! Chạy setup() trước.');
    return;
  }
  var rows = sheet.getLastRow();
  Logger.log('Kết nối OK! Tab Users có ' + rows + ' dòng (kể cả header).');

  // Test login
  var loginResult = handleLogin_({ email: 'admin@wepower.vn', password: '123456' });
  Logger.log('Test login: ' + JSON.stringify(loginResult));
}
