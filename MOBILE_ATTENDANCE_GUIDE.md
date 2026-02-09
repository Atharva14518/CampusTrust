# Mobile Attendance System - Complete Guide

## 🎯 Overview

The attendance system now supports **real mobile QR scanning** with Lute wallet integration. Students can scan QR codes with their phone camera and mark attendance directly from their mobile device.

## 🔧 Setup Steps

### 1. Update Database Schema

Run this SQL migration to add the student name field:

```bash
cd trustcampus/backend
mysql -u root -p trustcampus < migration_add_student_name.sql
```

Or manually in MySQL:
```sql
USE trustcampus;
ALTER TABLE attendance ADD COLUMN student_name VARCHAR(255) AFTER wallet_address;
```

### 2. Restart Backend Server

```bash
cd trustcampus/backend
npm start
```

### 3. Restart Frontend

```bash
cd trustcampus/frontend
npm run dev
```

## 📱 How It Works

### Teacher Flow

1. **Go to Attendance Page**
   - Navigate to http://localhost:5173/attendance

2. **Generate QR Code**
   - Enter Class ID (e.g., "CS101")
   - Click "Generate QR Code"
   - QR code appears with a scannable link

3. **Display QR Code**
   - Show the QR code on your screen/projector
   - Students can scan with their phone camera
   - Or click "Copy Link" to share via messaging apps

4. **Monitor Live Attendance**
   - Right panel shows real-time attendance
   - Updates every 3 seconds automatically
   - Shows:
     - Student name
     - Wallet address (shortened)
     - Timestamp
     - Verification link to AlgoExplorer

### Student Flow (Mobile)

1. **Scan QR Code**
   - Open phone camera
   - Point at teacher's QR code
   - Tap the notification that appears

2. **Open Attendance Page**
   - Browser opens to `/scan?data=...`
   - Shows class information

3. **Connect Wallet**
   - Click "Connect Lute Wallet"
   - Lute mobile app/extension opens
   - Approve connection

4. **Enter Name**
   - Type your full name
   - This will be visible to the teacher

5. **Mark Attendance**
   - Click "Mark Attendance"
   - Lute wallet opens for signing
   - Sign the transaction
   - Wait for confirmation (10-15 seconds)

6. **Success!**
   - See confirmation screen
   - Transaction ID displayed
   - Link to verify on AlgoExplorer

## 🔗 URL Structure

The QR code contains a URL like:
```
http://localhost:5173/scan?data=%7B%22classId%22%3A%22CS101%22%2C%22timestamp%22%3A1234567890%2C%22appId%22%3A755213391%7D
```

Decoded data:
```json
{
  "classId": "CS101",
  "timestamp": 1234567890,
  "appId": 755213391
}
```

## 📊 Live Attendance Display

The teacher sees:

```
┌─────────────────────────────────────┐
│ Live Attendance          [3 Present]│
├─────────────────────────────────────┤
│ 1  John Doe                      ✓  │
│    6X32SGJB...CARO5Y                │
│    2:30:45 PM          [Verify →]   │
├─────────────────────────────────────┤
│ 2  Jane Smith                    ✓  │
│    7Y43THKC...DBSP6Z                │
│    2:31:12 PM          [Verify →]   │
├─────────────────────────────────────┤
│ 3  Bob Johnson                   ✓  │
│    8Z54UILD...ECTQ7A                │
│    2:31:45 PM          [Verify →]   │
└─────────────────────────────────────┘
```

Each entry shows:
- **Number**: Order of attendance
- **Name**: Student's entered name
- **Wallet**: Shortened address
- **Time**: When attendance was marked
- **Verify**: Link to blockchain transaction

## 🧪 Testing

### Test on Desktop (Simulated)

1. Open http://localhost:5173/attendance
2. Generate QR for "TEST101"
3. Right-click QR code → "Copy link address"
4. Open link in new tab
5. Connect wallet and enter name
6. Mark attendance
7. Check teacher view for your entry

### Test on Mobile (Real)

1. **Setup Mobile**
   - Install Lute wallet on phone
   - Create/import wallet
   - Get testnet ALGO

2. **Access from Mobile**
   - Make sure your computer and phone are on same network
   - Find your computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Update frontend to use IP instead of localhost

3. **Generate QR**
   - Teacher generates QR on computer
   - Display on screen

4. **Scan with Phone**
   - Open phone camera
   - Scan QR code
   - Follow mobile flow above

## 🌐 Production Deployment

### For Mobile Access in Production

1. **Deploy Frontend**
   ```bash
   cd frontend
   npm run build
   # Deploy to Vercel/Netlify
   ```

2. **Update QR Generation**
   - QR codes will automatically use production URL
   - Example: `https://trustcampus.app/scan?data=...`

3. **Mobile Compatibility**
   - Works on iOS Safari
   - Works on Android Chrome
   - Lute wallet must be installed

## 🔐 Security Features

✅ **Blockchain Verification**
- Every attendance is a real blockchain transaction
- Immutable and tamper-proof
- Verifiable on AlgoExplorer

✅ **Wallet Authentication**
- Students must sign with their wallet
- No fake attendance possible
- Unique wallet per student

✅ **Real-time Updates**
- Teacher sees attendance instantly
- No manual refresh needed
- Live blockchain confirmation

## 🐛 Troubleshooting

### "Invalid QR Code" Error
- QR code might be expired (>5 minutes old)
- Generate a new QR code
- Ensure URL is complete

### "Cannot Connect Wallet" on Mobile
- Install Lute wallet app/extension
- Ensure wallet is on Algorand Testnet
- Check browser compatibility

### "Transaction Failed"
- Ensure wallet has ALGO (>0.1)
- Check network connection
- Verify contract is deployed

### Attendance Not Showing
- Wait 3 seconds for auto-refresh
- Check browser console for errors
- Verify backend is running
- Check database connection

### Name Not Displaying
- Run database migration
- Restart backend server
- Clear browser cache

## 📱 Mobile App Integration (Future)

For a native mobile app experience:

1. **React Native App**
   - Dedicated mobile app
   - Built-in QR scanner
   - Native Lute wallet integration

2. **Deep Links**
   - `trustcampus://scan?classId=CS101`
   - Opens app directly
   - Faster than web

3. **Push Notifications**
   - Notify when attendance is marked
   - Remind to mark attendance
   - Class schedule integration

## 🎓 Best Practices

### For Teachers

1. **Generate QR Early**
   - Create QR before class starts
   - Display prominently
   - Keep displayed for 5-10 minutes

2. **Monitor Live Feed**
   - Watch attendance roll in
   - Verify student names
   - Check for duplicates

3. **Save Records**
   - Export attendance data
   - Keep blockchain transaction IDs
   - Verify on AlgoExplorer periodically

### For Students

1. **Prepare Wallet**
   - Install Lute before class
   - Fund with testnet ALGO
   - Test connection beforehand

2. **Scan Quickly**
   - Scan as soon as QR appears
   - Don't wait until end of class
   - Verify success message

3. **Keep Transaction IDs**
   - Screenshot confirmation
   - Save transaction ID
   - Proof of attendance

## 📊 Analytics

Track attendance metrics:

```sql
-- Total attendance by class
SELECT class_id, COUNT(*) as total
FROM attendance
GROUP BY class_id;

-- Attendance by student
SELECT student_name, wallet_address, COUNT(*) as classes_attended
FROM attendance
GROUP BY wallet_address
ORDER BY classes_attended DESC;

-- Recent attendance
SELECT * FROM attendance
ORDER BY timestamp DESC
LIMIT 20;
```

## 🚀 Next Steps

1. ✅ Mobile QR scanning working
2. ✅ Student names displayed
3. ✅ Live attendance updates
4. ✅ Blockchain verification

**Future Enhancements:**
- [ ] Geolocation verification
- [ ] Time-based QR expiry
- [ ] Attendance reports/exports
- [ ] Email notifications
- [ ] Integration with LMS
- [ ] Attendance analytics dashboard

---

**Status**: ✅ FULLY FUNCTIONAL

Mobile attendance with QR scanning, Lute wallet integration, and live updates is now working!
