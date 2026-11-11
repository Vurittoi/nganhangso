# Digital Banking Demo

Ứng dụng demo ngân hàng số gồm frontend React/Vite, backend Express và SQL Server.

## Yêu cầu

- Node.js
- SQL Server và ODBC Driver 18 for SQL Server
- SQL Server Management Studio (SSMS) để chạy script mẫu `database/DigitalBanking.example.sql`

Script SQL trong repository chỉ có dữ liệu demo giả. Tài khoản mẫu: `admin` / `demo123`. Không dùng script hoặc thông tin đăng nhập demo trong môi trường thật.

File dump cá nhân `DigitalBanking.sql` được giữ ở máy và cố ý không đưa lên GitHub.

## Chạy backend

Tại thư mục gốc:

```powershell
npm install
$env:SQL_SERVER = "localhost\SQLEXPRESS"
$env:SQL_DATABASE = "DigitalBanking"
node backend/server.js
```

Nếu cần dùng connection string riêng, đặt biến `SQL_CONNECTION_STRING` thay cho `SQL_SERVER` và `SQL_DATABASE`.

Trước khi khởi động backend lần đầu, mở `database/DigitalBanking.example.sql` trong SSMS và chạy script để tạo cơ sở dữ liệu demo.

## Chạy frontend

Mở terminal khác:

```powershell
cd frontend
npm install
npm run dev
```

Không commit file `.env`, thông tin đăng nhập, hoặc bản dump cơ sở dữ liệu có dữ liệu thật.
