USE TestFlow;
GO

/* =========================
   DEMO DATA FOR TESTFLOW
   ========================= */

-- Xóa dữ liệu demo cũ nếu muốn reset
DELETE FROM bugs;
DELETE FROM test_cases;
DELETE FROM projects;
GO

/* =========================
   PROJECTS
   ========================= */

INSERT INTO projects (name, description, status, created_at)
VALUES
(
    N'Web quản lý bán hàng',
    N'Dự án demo dùng để quản lý test case và bug report cho hệ thống bán hàng.',
    N'Active',
    GETDATE()
),
(
    N'App đặt phòng khách sạn',
    N'Dự án demo kiểm thử chức năng đặt phòng, thanh toán và quản lý phòng.',
    N'Active',
    GETDATE()
),
(
    N'Web quản lý nhân sự',
    N'Dự án demo kiểm thử đăng nhập, quản lý nhân viên và báo cáo nhân sự.',
    N'Active',
    GETDATE()
);
GO

/* =========================
   TEST CASES
   ========================= */

INSERT INTO test_cases (
    test_case_code,
    project_id,
    module_name,
    title,
    precondition,
    test_steps,
    expected_result,
    actual_result,
    priority,
    status,
    created_at
)
VALUES
(
    N'TC_LOGIN_001',
    (SELECT id FROM projects WHERE name = N'Web quản lý bán hàng'),
    N'Đăng nhập',
    N'Kiểm tra đăng nhập thành công',
    N'Người dùng đã có tài khoản hợp lệ và đang ở màn hình đăng nhập.',
    N'1. Nhập username hợp lệ
2. Nhập password hợp lệ
3. Bấm nút Đăng nhập',
    N'Hệ thống đăng nhập thành công và chuyển đến trang Dashboard.',
    N'Chưa thực hiện test.',
    N'High',
    N'Not Run',
    GETDATE()
),
(
    N'TC_LOGIN_002',
    (SELECT id FROM projects WHERE name = N'Web quản lý bán hàng'),
    N'Đăng nhập',
    N'Kiểm tra đăng nhập sai mật khẩu',
    N'Người dùng đã có tài khoản hợp lệ và đang ở màn hình đăng nhập.',
    N'1. Nhập username hợp lệ
2. Nhập password sai
3. Bấm nút Đăng nhập',
    N'Hệ thống hiển thị thông báo sai mật khẩu và không cho đăng nhập.',
    N'Hệ thống không hiển thị thông báo lỗi.',
    N'High',
    N'Fail',
    GETDATE()
),
(
    N'TC_PRODUCT_001',
    (SELECT id FROM projects WHERE name = N'Web quản lý bán hàng'),
    N'Quản lý sản phẩm',
    N'Kiểm tra thêm sản phẩm mới',
    N'Admin đã đăng nhập vào hệ thống.',
    N'1. Vào menu Quản lý sản phẩm
2. Bấm Thêm sản phẩm
3. Nhập đầy đủ thông tin sản phẩm
4. Bấm Lưu',
    N'Hệ thống lưu sản phẩm thành công và hiển thị sản phẩm trong danh sách.',
    N'Chưa thực hiện test.',
    N'Medium',
    N'Not Run',
    GETDATE()
),
(
    N'TC_BOOKING_001',
    (SELECT id FROM projects WHERE name = N'App đặt phòng khách sạn'),
    N'Đặt phòng',
    N'Kiểm tra đặt phòng thành công',
    N'Người dùng đã đăng nhập và còn phòng trống trong hệ thống.',
    N'1. Chọn phòng
2. Chọn ngày nhận phòng và trả phòng
3. Bấm Đặt phòng',
    N'Hệ thống tạo đơn đặt phòng thành công.',
    N'Chưa thực hiện test.',
    N'Medium',
    N'Not Run',
    GETDATE()
),
(
    N'TC_EMPLOYEE_001',
    (SELECT id FROM projects WHERE name = N'Web quản lý nhân sự'),
    N'Quản lý nhân viên',
    N'Kiểm tra không cho lưu khi bỏ trống tên nhân viên',
    N'Admin đã đăng nhập vào hệ thống quản lý nhân sự.',
    N'1. Vào menu Quản lý nhân viên
2. Bấm Thêm nhân viên
3. Bỏ trống trường Tên nhân viên
4. Bấm Lưu',
    N'Hệ thống hiển thị thông báo bắt buộc nhập tên nhân viên.',
    N'Hệ thống vẫn cho lưu nhân viên dù bỏ trống tên.',
    N'High',
    N'Fail',
    GETDATE()
);
GO

/* =========================
   BUGS
   ========================= */

INSERT INTO bugs (
    bug_code,
    project_id,
    test_case_id,
    title,
    description,
    steps_to_reproduce,
    expected_result,
    actual_result,
    severity,
    priority,
    status,
    assigned_to,
    created_at
)
VALUES
(
    N'BUG_LOGIN_001',
    (SELECT id FROM projects WHERE name = N'Web quản lý bán hàng'),
    (SELECT id FROM test_cases WHERE test_case_code = N'TC_LOGIN_002'),
    N'Không hiển thị thông báo lỗi khi nhập sai mật khẩu',
    N'Khi người dùng nhập sai mật khẩu, hệ thống không hiển thị thông báo lỗi.',
    N'1. Mở trang đăng nhập
2. Nhập username hợp lệ
3. Nhập password sai
4. Bấm Đăng nhập',
    N'Hệ thống hiển thị thông báo sai mật khẩu.',
    N'Hệ thống không có phản hồi hoặc không hiển thị thông báo lỗi.',
    N'High',
    N'High',
    N'New',
    N'Developer',
    GETDATE()
),
(
    N'BUG_EMPLOYEE_001',
    (SELECT id FROM projects WHERE name = N'Web quản lý nhân sự'),
    (SELECT id FROM test_cases WHERE test_case_code = N'TC_EMPLOYEE_001'),
    N'Cho phép lưu nhân viên khi bỏ trống tên',
    N'Hệ thống vẫn cho phép tạo nhân viên mới dù trường tên nhân viên bị bỏ trống.',
    N'1. Vào Quản lý nhân viên
2. Bấm Thêm nhân viên
3. Không nhập tên nhân viên
4. Bấm Lưu',
    N'Hệ thống phải báo lỗi bắt buộc nhập tên nhân viên.',
    N'Hệ thống lưu dữ liệu thành công dù thiếu tên nhân viên.',
    N'Critical',
    N'High',
    N'In Progress',
    N'Developer',
    GETDATE()
);
GO

/* =========================
   CHECK DATA
   ========================= */

SELECT * FROM projects;
SELECT * FROM test_cases;
SELECT * FROM bugs;