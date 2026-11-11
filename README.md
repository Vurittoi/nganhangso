# Digital Banking Demo

Ứng dụng demo ngân hàng số gồm frontend React/Vite, backend Express và SQL Server.

## Yêu cầu

- Node.js
- SQL Server và ODBC Driver 18 for SQL Server
- Cơ sở dữ liệu `DigitalBanking` do bạn tự tạo; file dump chứa dữ liệu cá nhân không được đưa lên repository

## Chạy backend

Tại thư mục gốc:

```powershell
npm install
$env:SQL_SERVER = "localhost\SQLEXPRESS"
$env:SQL_DATABASE = "DigitalBanking"
node backend/server.js
```

Nếu cần dùng connection string riêng, đặt biến `SQL_CONNECTION_STRING` thay cho `SQL_SERVER` và `SQL_DATABASE`.

## Chạy frontend

Mở terminal khác:

```powershell
cd frontend
npm install
npm run dev
```

Không commit file `.env`, thông tin đăng nhập, hoặc bản dump cơ sở dữ liệu có dữ liệu thật.
