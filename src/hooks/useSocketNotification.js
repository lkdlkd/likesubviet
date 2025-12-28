/**
 * React Hook để sử dụng Socket.IO realtime notifications
 * Hỗ trợ cả nạp tiền và mua đơn hàng
 * 
 * Ví dụ sử dụng:
 * 
 * import useSocketNotification from './hooks/useSocketNotification';
 * 
 * function MyComponent() {
 *   const { user } = useAuth();
 *   
 *   // Cách 1: Truyền object với cả onDeposit và onOrder
 *   useSocketNotification({
 *     username: user?.username,
 *     onDeposit: (data) => {
 *       alert('Nạp tiền: ' + data.message);
 *       updateBalance(data.newBalance);
 *     },
 *     onOrder: (data) => {
 *       updateBalance(data.newBalance);
 *     }
 *   });
 *   
 *   // Cách 2: Chỉ truyền username và callback (tương thích ngược)
 *   useSocketNotification(user?.username, (data) => {
 *     alert('Nạp tiền: ' + data.message);
 *     updateBalance(data.newBalance);
 *   });
 *   
 *   return <div>...</div>;
 * }
 */

import { useEffect } from 'react';
import {
    initSocketConnection,
    onDepositSuccess,
    onOrderSuccess,
    disconnectSocket
} from '../Utils/socketService';

const useSocketNotification = (usernameOrOptions, onDepositCallback) => {
    useEffect(() => {
        // Xử lý cả 2 dạng parameters: object hoặc (username, callback)
        let username, onDeposit, onOrder;

        if (typeof usernameOrOptions === 'object' && usernameOrOptions !== null) {
            // Dạng object: { username, onDeposit, onOrder }
            username = usernameOrOptions.username;
            onDeposit = usernameOrOptions.onDeposit;
            onOrder = usernameOrOptions.onOrder;
        } else {
            // Dạng cũ: (username, callback) - tương thích ngược
            username = usernameOrOptions;
            onDeposit = onDepositCallback;
        }

        if (!username) {
            return;
        }

        // Khởi tạo socket connection
        initSocketConnection(username);

        // Đăng ký listener cho event deposit-success
        if (onDeposit && typeof onDeposit === 'function') {
            onDepositSuccess((data) => {
                onDeposit(data);
            });
        }

        // Đăng ký listener cho event order-success
        if (onOrder && typeof onOrder === 'function') {
            onOrderSuccess((data) => {
                onOrder(data);
            });
        }

        // Cleanup: ngắt kết nối khi component unmount hoặc username thay đổi
        return () => {
            disconnectSocket();
        };
    }, [usernameOrOptions, onDepositCallback]);
};

export default useSocketNotification;
