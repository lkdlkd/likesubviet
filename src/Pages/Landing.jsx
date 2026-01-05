import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, getRecaptchaSiteKey, setStoredToken, setSessionKey } from '@/Utils/api';
import { AuthContext } from '@/Context/AuthContext';
import ReCAPTCHA from "react-google-recaptcha";
import { getConfigWebLogo } from '@/Utils/api';

// Custom hook for scroll reveal animation
const useScrollReveal = (options = {}) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(entry.target);
            }
        }, { threshold: options.threshold || 0.1, rootMargin: options.rootMargin || '0px' });

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [options.threshold, options.rootMargin]);

    return [ref, isVisible];
};

// Custom hook for count-up animation
const useCountUp = (endValue, duration = 2000, isVisible = true) => {
    const [count, setCount] = useState(0);
    const countRef = useRef(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (!isVisible || hasAnimated.current) return;
        hasAnimated.current = true;

        // Parse the end value (handle formats like "44K+", "5K+", "300%", "35M+")
        let numericValue = 0;
        let suffix = '';
        const match = String(endValue).match(/^([\d.]+)([KMk%+]*)/);
        if (match) {
            numericValue = parseFloat(match[1]);
            suffix = match[2] || '';
        }

        const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = numericValue * easeOutQuart;

            setCount(currentValue);

            if (progress < 1) {
                countRef.current = requestAnimationFrame(animate);
            }
        };
        countRef.current = requestAnimationFrame(animate);

        return () => {
            if (countRef.current) cancelAnimationFrame(countRef.current);
        };
    }, [endValue, duration, isVisible]);

    // Format the count value
    const formatValue = (val) => {
        const match = String(endValue).match(/^([\d.]+)([KMk%+]*)/);
        const suffix = match ? match[2] : '';
        const numericEnd = match ? parseFloat(match[1]) : 0;

        if (suffix.includes('K') || suffix.includes('k')) {
            return Math.floor(val) + 'K+';
        } else if (suffix.includes('M')) {
            return Math.floor(val) + 'M+';
        } else if (suffix.includes('%')) {
            return Math.floor(val) + '%';
        }
        return Math.floor(val) + (suffix || '');
    };

    return formatValue(count);
};

// Animated Count Component
const AnimatedCount = ({ value, duration = 2000 }) => {
    const [ref, isVisible] = useScrollReveal({ threshold: 0.3 });
    const animatedValue = useCountUp(value, duration, isVisible);

    return (
        <span ref={ref} className="gradient-text rainbow-text" style={{ fontSize: '48px', fontWeight: 800, marginBottom: '12px', display: 'inline-block' }}>
            {animatedValue}
        </span>
    );
};

// Rainbow Text Component
const RainbowText = ({ children, style = {} }) => {
    return (
        <span className="rainbow-text" style={style}>
            {children}
        </span>
    );
};

// Scroll Reveal Wrapper Component
const ScrollReveal = ({ children, delay = 0, direction = 'up' }) => {
    const [ref, isVisible] = useScrollReveal({ threshold: 0.1 });

    const getTransform = () => {
        switch (direction) {
            case 'left': return 'translateX(-50px)';
            case 'right': return 'translateX(50px)';
            case 'down': return 'translateY(-50px)';
            default: return 'translateY(50px)';
        }
    };

    return (
        <div
            ref={ref}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translate(0)' : getTransform(),
                transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s`,
            }}
        >
            {children}
        </div>
    );
};
export default function Landing() {
    const [authMode, setAuthMode] = useState('login');
    const API_DOMAIN = window.location.origin;
    const Domain = API_DOMAIN.replace(/^https?:\/\//, "");
    const API_URL = `${process.env.REACT_APP_API_BASE}/api/v2`;
    const [activeSection, setActiveSection] = useState('home');
    const [activeApiTab, setActiveApiTab] = useState('services');
    const [formData, setFormData] = useState({ username: '', password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [otpStep, setOtpStep] = useState(false);
    const [otp, setOtp] = useState('');
    const [recaptchaToken, setRecaptchaToken] = useState('');
    const [siteKey, setSiteKey] = useState('');
    const [siteKeyLoading, setSiteKeyLoading] = useState(true);
    const [copySuccess, setCopySuccess] = useState('');
    const [activeFaq, setActiveFaq] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const recaptchaRef = useRef(null);
    const navigate = useNavigate();
    const { updateAuth } = useContext(AuthContext);
    const [config, setConfig] = useState(null);

    // Fetch config and recaptcha site key only once
    useEffect(() => {
        const fetchInitialData = async () => {
            setSiteKeyLoading(true);

            // Fetch config logo (không quan trọng, lỗi không ảnh hưởng)
            getConfigWebLogo()
                .then(configData => {
                    if (configData?.data) {
                        setConfig(configData.data);
                    }
                })
                .catch(err => {
                    // console.warn('Logo load failed (non-critical):', err.message);
                });

            // Fetch recaptcha site key (quan trọng)
            try {
                const recaptchaData = await getRecaptchaSiteKey();
                setSiteKey(recaptchaData.siteKey);
            } catch (err) {
                // console.error('Error fetching recaptcha site key:', err);
            } finally {
                setSiteKeyLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    // Mouse tracking for glow effect
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const resetForm = () => { setFormData({ username: '', password: '', confirmPassword: '' }); setError(''); setSuccess(''); setOtpStep(false); setOtp(''); setRecaptchaToken(''); if (recaptchaRef.current) recaptchaRef.current.reset(); };
    const handleCopy = async (text) => { try { await navigator.clipboard.writeText(text); setCopySuccess('Đã copy!'); setTimeout(() => setCopySuccess(''), 2000); } catch (err) { } };

    const handleLogin = async (e) => {
        e.preventDefault(); setLoading(true); setError(''); setSuccess('');
        try {
            const payload = { username: formData.username, password: formData.password };
            if (otpStep) payload.token = otp;
            const data = await login(payload);
            if (data.twoFactorRequired && !otpStep) { setOtpStep(true); setSuccess('Nhập mã 2FA để tiếp tục.'); return; }
            if (data.token) {
                setStoredToken(data.token); // Lưu access token
                if (data.sessionKey) setSessionKey(data.sessionKey); // 🔥 Lưu sessionKey cho cross-origin
                updateAuth({ token: data.token, role: data.role }); setSuccess('Đăng nhập thành công!'); setTimeout(() => navigate('/home'), 1000);
            }
        } catch (err) { setError(err.message || 'Có lỗi xảy ra.'); } finally { setLoading(false); }
    };

    const handleRegister = async (e) => {
        e.preventDefault(); setLoading(true); setError(''); setSuccess('');
        if (formData.username.length > 100) { setError('Tên tài khoản không được dài hơn 100 ký tự.'); setLoading(false); return; }
        if (!recaptchaToken) { setError('Vui lòng xác nhận bạn không phải là người máy.'); setLoading(false); return; }
        try { const data = await register({ username: formData.username, password: formData.password, recaptchaToken }); setSuccess(data.message || 'Đăng ký thành công!'); setTimeout(() => { setAuthMode('login'); resetForm(); }, 2000); }
        catch (err) { setError(err.message || 'Có lỗi xảy ra.'); setRecaptchaToken(''); if (recaptchaRef.current) recaptchaRef.current.reset(); } finally { setLoading(false); }
    };

    const stats = [
        { value: '44K+', label: 'Đơn Hoàn Thành' },
        { value: '5K+', label: 'Khách Hàng Đã Sử Dụng' },
        { value: '300%', label: 'Dịch Vụ Mới' },
        { value: '100%', label: 'Độ Tin Cậy' },
    ];

    const features = [
        { text: 'Chúng tôi mang đến các giải pháp tăng tương tác an toàn – hiệu quả, giúp đẩy mạnh hiển thị, tối ưu thuật toán và tăng độ phủ tự nhiên cho thương hiệu cũng như nhà sáng tạo nội dung.' },
        { text: 'Hơn 5.000+ khách hàng đã tin dùng dịch vụ để tăng tương tác và cải thiện hiệu suất nội dung mỗi ngày.' },
        { text: 'Giải pháp được tối ưu theo thuật toán thực tế, giúp video dễ lên xu hướng, fanpage tăng reach tự nhiên và kênh social phát triển ổn định bền vững.' },
    ];

    const testimonials = [
        { name: 'Quỳnh Aka', role: 'Nữ TikToker', text: 'Dịch vụ rất uy tín, giúp mình duy trì tương tác và tăng view đều mỗi ngày.', img: '/img/Quynhaka.png' },
        { name: 'Sơn Tùng MTP', role: 'Ca Sĩ', text: 'Dịch vụ tăng tương tác thật sự tuyệt vời. Fanpage của tôi tăng hơn 300% lượt tương tác chỉ sau 2 tuần.', img: '/img/sontung.png' },
        { name: 'Tun Phạm', role: 'Content Creator', text: 'Từ khi dùng dịch vụ, kênh TikTok của mình tăng follow tự nhiên và lượng tương tác tốt hơn hẳn.', img: '/img/TunPham.png' },
    ];

    const faqs = [
        { q: '1. Dịch vụ tăng tương tác gồm những gì?', a: 'Chúng tôi cung cấp các dịch vụ tăng like, follow, comment, share, view cho Facebook, TikTok, Instagram và YouTube. Tất cả đều xử lý tự động, nhanh và đảm bảo an toàn cho tài khoản.' },
        { q: '2. Tăng tương tác có an toàn cho tài khoản không?', a: 'Dịch vụ chạy theo thuật toán tự nhiên, không yêu cầu mật khẩu, không ảnh hưởng độ an toàn của tài khoản. Hệ thống tối ưu để hạn chế tối đa rủi ro.' },
        { q: '3. Bao lâu thì đơn tăng tương tác hoàn thành?', a: 'Thời gian xử lý tùy dịch vụ: các đơn nhỏ chạy trong vài phút, đơn lớn có thể 5–30 phút. Một số dịch vụ đặc biệt có thể lâu hơn.' },
        { q: '4. Có cần cung cấp mật khẩu tài khoản không?', a: 'Không. Bạn chỉ cần cung cấp link bài viết hoặc link tài khoản. Hệ thống hoàn toàn tự động nên không bao giờ yêu cầu mật khẩu.' },
        { q: '5. Dịch vụ có bảo hành không?', a: 'Có. Các dịch vụ đều có bảo hành theo từng loại, đảm bảo tương tác không bị tụt ngoài phạm vi cho phép. Nếu có lỗi, hệ thống tự động hỗ trợ hoàn trả hoặc bổ sung.' },
    ];

    const platforms = [
        { img: '/img/facebook.gif', name: 'Facebook' },
        { img: '/img/tiktok.gif', name: 'TikTok' },
        { img: '/img/instagram.gif', name: 'Instagram' },
        { img: '/img/youtube.gif', name: 'YouTube' },
        { img: '/img/tele.gif', name: 'Telegram' },
        { img: '/img/x.gif', name: 'X' },
    ];

    const apiTabs = [
        { id: 'services', label: 'Services' }, { id: 'add', label: 'Add Order' }, { id: 'status', label: 'Order Status' },
        { id: 'multistatus', label: 'Multiple Status' }, { id: 'cancel', label: 'Cancel' }, { id: 'refill', label: 'Refill' }, { id: 'balance', label: 'Balance' },
    ];

    const apiContent = {
        services: { params: [['key', 'API Key'], ['action', '"services"']], response: `[\n  {\n    "service": 1,\n    "name": "Sv5 ( Sub Việt )",\n    "type": "Default",\n    "platform": "Facebook",\n    "category": "Follow Facebook",\n    "rate": "0.90",\n    "min": "50",\n    "max": "10000",\n    "refill": true,\n    "cancel": true\n  }\n]` },
        add: { params: [['key', 'API Key'], ['action', '"add"'], ['service', 'Service ID'], ['link', 'Link'], ['quantity', 'Số lượng cần order'], ['comments', 'Comments (chỉ cho Custom Comments)']], response: `{\n  "order": 99999\n}` },
        status: { params: [['key', 'API Key'], ['action', '"status"'], ['order', 'Order ID']], response: `{\n  "charge": "2.5",\n  "start_count": "168",\n  "status": "Completed",\n  "remains": "-2",\n  "currency": "USD"\n}`, note: 'Status: Pending, Processing, In progress, Completed, Partial, Canceled' },
        multistatus: { params: [['key', 'API Key'], ['action', '"status"'], ['orders', 'Order IDs cách nhau bởi dấu phẩy (vd: 123,456,789) (Limit 100)']], response: `{\n  "123": {\n    "charge": "0.27819",\n    "start_count": "3572",\n    "status": "Partial",\n    "remains": "157",\n    "currency": "USD"\n  },\n  "456": { \n    "error": "Incorrect order ID" \n  }\n}` },
        cancel: { params: [['key', 'API Key'], ['action', '"cancel"'], ['orders', 'Order IDs cách nhau bởi dấu phẩy (Limit 100)']], response: `[\n  {\n    "order": 9,\n    "cancel": {\n      "error": "Incorrect order ID"\n    }\n  },\n  {\n    "order": 2,\n    "cancel": 1\n  }\n]` },
        refill: { params: [['key', 'API Key'], ['action', '"refill"'], ['orders', 'Order IDs cách nhau bởi dấu phẩy (Limit 100)']], response: `{\n  "refill": "1"\n}` },
        balance: { params: [['key', 'API Key'], ['action', '"balance"']], response: `{\n  "balance": "343423",\n  "currency": "USD"\n}` },
    };

    // Color palette
    const colors = {
        bg: '#0a0a0a',
        card: 'rgba(20, 20, 20, 0.8)',
        border: 'rgba(255, 255, 255, 0.1)',
        text: '#ffffff',
        textSecondary: '#b0b0b0',
        textMuted: '#808080',
        accent: '#ff4444',
        accentLight: '#ff6b6b',
        accentGlow: 'rgba(255, 68, 68, 0.3)',
    };

    return (
        <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: colors.bg, color: colors.text, minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                html { scroll-behavior: smooth; }
                
                /* Cursor Glow Effect */
                .cursor-glow {
                    position: fixed;
                    width: 400px;
                    height: 400px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(255, 68, 68, 0.15) 0%, transparent 70%);
                    pointer-events: none;
                    z-index: 2;
                    transform: translate(-50%, -50%);
                    transition: opacity 0.3s ease;
                }
                
                .grid-bg { 
                    position: fixed; inset: 0; 
                    background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), 
                                      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); 
                    background-size: 60px 60px; 
                    pointer-events: none; z-index: 0; 
                    animation: gridMove 20s linear infinite;
                }
                @keyframes gridMove {
                    0% { transform: translate(0, 0); }
                    100% { transform: translate(60px, 60px); }
                }
                
                .glow-border { 
                    position: fixed; inset: 0; pointer-events: none; z-index: 1; 
                    box-shadow: inset 0 0 200px rgba(255, 68, 68, 0.05), inset 0 0 400px rgba(100, 100, 255, 0.02); 
                }
                
                /* Animated Gradient Text */
                .gradient-text { 
                    background: linear-gradient(135deg, #ff6b6b 0%, #ff4444 25%, #ff8888 50%, #ff4444 75%, #ff6b6b 100%); 
                    background-size: 200% 200%;
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
                    animation: gradientShift 3s ease infinite;
                }
                @keyframes gradientShift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                
                /* Rainbow Text Animation - Color Cycling Effect */
                .rainbow-text {
                    background: linear-gradient(
                        90deg,
                        #ff0000,
                        #ff4500 ,
                        #ff8c00 ,
                        #ff1493 ,
                        #ff0000 ,
                        #ff4500 
                    );
                    background-size: 300% 100%;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: rainbowFlow 6s ease-in-out infinite;
                }
                @keyframes rainbowFlow {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 300% 50%; }
                }
                
                /* Scroll Reveal Animation */
                .scroll-reveal {
                    opacity: 0;
                    transform: translateY(50px);
                    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .scroll-reveal.visible {
                    opacity: 1;
                    transform: translateY(0);
                }
                .scroll-reveal-left {
                    opacity: 0;
                    transform: translateX(-50px);
                    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .scroll-reveal-left.visible {
                    opacity: 1;
                    transform: translateX(0);
                }
                .scroll-reveal-right {
                    opacity: 0;
                    transform: translateX(50px);
                    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .scroll-reveal-right.visible {
                    opacity: 1;
                    transform: translateX(0);
                }
                
                /* Count Up Number Animation */
                .count-up {
                    display: inline-block;
                    transition: all 0.3s ease;
                }
                .count-up:hover {
                    transform: scale(1.1);
                    text-shadow: 0 0 30px rgba(255, 68, 68, 0.5);
                }
                
                /* Glass Card with Shine Effect */
                .glass-card { 
                    background: rgba(25, 25, 25, 0.9); 
                    backdrop-filter: blur(20px); 
                    border: 1px solid rgba(255, 255, 255, 0.08); 
                    border-radius: 20px; 
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    position: relative;
                    overflow: hidden;
                }
                .glass-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: -100%;
                    width: 100%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
                    transition: left 0.5s ease;
                }
                .glass-card:hover::before {
                    left: 100%;
                }
                .glass-card:hover { 
                    border-color: rgba(255, 68, 68, 0.5); 
                    transform: translateY(-8px) scale(1.02); 
                    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6), 0 0 40px rgba(255, 68, 68, 0.1); 
                }
                
                /* Stat Card with Pulse */
                .stat-card { 
                    background: linear-gradient(145deg, rgba(255, 68, 68, 0.08) 0%, rgba(20, 20, 20, 0.95) 100%); 
                    border: 1px solid rgba(255, 68, 68, 0.15); 
                    border-radius: 20px; 
                    position: relative; 
                    overflow: hidden;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .stat-card:hover {
                    border-color: rgba(255, 68, 68, 0.6);
                    transform: translateY(-6px) scale(1.03);
                    box-shadow: 0 20px 50px rgba(255, 68, 68, 0.15);
                }
                .stat-card::after { 
                    content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px; 
                    background: linear-gradient(90deg, #ff4444, #ff6b6b, #ff4444);
                    background-size: 200% 100%;
                    animation: shimmer 2s linear infinite;
                }
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                
                /* Button with Ripple Effect */
                .btn-primary { 
                    background: linear-gradient(135deg, #ff4444, #cc3333); 
                    color: white; padding: 16px 36px; border-radius: 14px; 
                    font-weight: 600; font-size: 15px; border: none; cursor: pointer; 
                    display: inline-flex; align-items: center; gap: 10px; 
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
                    box-shadow: 0 4px 20px rgba(255, 68, 68, 0.4); 
                    text-decoration: none;
                    position: relative;
                    overflow: hidden;
                }
                .btn-primary::after {
                    content: '';
                    position: absolute;
                    top: 50%; left: 50%;
                    width: 0; height: 0;
                    background: rgba(255,255,255,0.3);
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    transition: width 0.6s ease, height 0.6s ease;
                }
                .btn-primary:hover::after {
                    width: 300px; height: 300px;
                }
                .btn-primary:hover { 
                    transform: translateY(-4px) scale(1.05); 
                    box-shadow: 0 12px 50px rgba(255, 68, 68, 0.7); 
                }
                .btn-primary:active {
                    transform: translateY(-2px) scale(1.02);
                }
                
                .btn-secondary { 
                    background: rgba(255,255,255,0.05); 
                    border: 1px solid rgba(255,255,255,0.15); 
                    color: white; padding: 16px 36px; border-radius: 14px; 
                    font-weight: 600; font-size: 15px; cursor: pointer; 
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
                    text-decoration: none;
                    position: relative;
                    overflow: hidden;
                }
                .btn-secondary::before {
                    content: '';
                    position: absolute;
                    top: 0; left: -100%;
                    width: 100%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
                    transition: left 0.5s ease;
                }
                .btn-secondary:hover::before {
                    left: 100%;
                }
                .btn-secondary:hover { 
                    background: rgba(255,255,255,0.12); 
                    border-color: rgba(255,255,255,0.4); 
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }
                
                /* Floating Badge */
                .badge { 
                    display: inline-flex; align-items: center; gap: 8px; 
                    padding: 10px 20px; 
                    background: rgba(255, 68, 68, 0.1); 
                    border: 1px solid rgba(255, 68, 68, 0.25); 
                    border-radius: 50px; 
                    font-size: 13px; font-weight: 600;
                    color: #ff6b6b; 
                    text-transform: uppercase; letter-spacing: 1.5px;
                    animation: float 3s ease-in-out infinite;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                
                /* Testimonial Card with Glow */
                .testimonial-card { 
                    background: linear-gradient(145deg, rgba(255, 68, 68, 0.06) 0%, rgba(100, 100, 255, 0.04) 50%, rgba(20, 20, 20, 0.95) 100%); 
                    backdrop-filter: blur(20px); 
                    border: 1px solid rgba(255,255,255,0.08); 
                    border-radius: 24px; padding: 32px; 
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    position: relative;
                }
                .testimonial-card::before {
                    content: '';
                    position: absolute;
                    inset: -2px;
                    border-radius: 26px;
                    background: linear-gradient(135deg, rgba(255,68,68,0.3), rgba(100,100,255,0.2), rgba(255,68,68,0.3));
                    z-index: -1;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .testimonial-card:hover::before {
                    opacity: 1;
                }
                .testimonial-card:hover { 
                    border-color: transparent; 
                    transform: translateY(-8px) rotateX(2deg) rotateY(-2deg); 
                    box-shadow: 0 30px 60px rgba(0,0,0,0.4);
                }
                
                /* FAQ with Smooth Expand */
                .faq-item { 
                    background: rgba(20, 20, 20, 0.8); 
                    border: 1px solid rgba(255,255,255,0.06); 
                    border-radius: 16px; margin-bottom: 16px; 
                    overflow: hidden; 
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .faq-item:hover {
                    border-color: rgba(255, 68, 68, 0.2);
                    transform: translateX(5px);
                }
                .faq-item.active { 
                    border-color: rgba(255, 68, 68, 0.5); 
                    background: rgba(255, 68, 68, 0.08);
                    box-shadow: 0 10px 40px rgba(255, 68, 68, 0.1);
                }
                .faq-q { 
                    padding: 24px 28px; cursor: pointer; 
                    display: flex; justify-content: space-between; align-items: center; 
                    font-weight: 600; font-size: 16px; color: #ffffff;
                    transition: background 0.3s ease;
                }
                .faq-q:hover {
                    background: rgba(255,255,255,0.02);
                }
                .faq-a { 
                    padding: 0 28px 24px; 
                    color: #b0b0b0; 
                    line-height: 1.8; font-size: 15px;
                    animation: fadeSlideIn 0.3s ease;
                }
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                /* Input with Glow Focus */
                .input { 
                    background: rgba(255,255,255,0.04); 
                    border: 1px solid rgba(255,255,255,0.1); 
                    border-radius: 14px; padding: 16px 20px; 
                    color: white; width: 100%; outline: none; 
                    font-size: 15px; 
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .input:focus { 
                    border-color: rgba(255, 68, 68, 0.6); 
                    box-shadow: 0 0 0 4px rgba(255, 68, 68, 0.1), 0 0 40px rgba(255, 68, 68, 0.15); 
                    background: rgba(255,255,255,0.08);
                    transform: scale(1.01);
                }
                .input::placeholder { color: #666666; }
                
                /* Page Animations */
                @keyframes fadeIn { 
                    from { opacity: 0; transform: translateY(40px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
                .animate-fade-in { animation: fadeIn 1s ease forwards; }
                
                /* Staggered animations for children */
                .stagger-animation > *:nth-child(1) { animation-delay: 0.1s; }
                .stagger-animation > *:nth-child(2) { animation-delay: 0.2s; }
                .stagger-animation > *:nth-child(3) { animation-delay: 0.3s; }
                .stagger-animation > *:nth-child(4) { animation-delay: 0.4s; }
                .stagger-animation > *:nth-child(5) { animation-delay: 0.5s; }
                .stagger-animation > *:nth-child(6) { animation-delay: 0.6s; }
                
                .tab-btn { 
                    padding: 14px 18px; background: transparent; border: none; 
                    color: #808080; cursor: pointer; border-radius: 10px; 
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
                    font-weight: 500; font-size: 14px;
                    text-align: left; width: 100%;
                    position: relative;
                    overflow: hidden;
                }
                .tab-btn::before {
                    content: '';
                    position: absolute;
                    left: 0; top: 0; bottom: 0;
                    width: 3px;
                    background: #ff4444;
                    transform: scaleY(0);
                    transition: transform 0.3s ease;
                }
                .tab-btn:hover { 
                    background: rgba(255,255,255,0.05); 
                    color: #ffffff;
                    padding-left: 22px;
                }
                .tab-btn:hover::before {
                    transform: scaleY(1);
                }
                .tab-btn.active { 
                    background: linear-gradient(135deg, #ff4444, #cc3333); 
                    color: white;
                    transform: scale(1.02);
                    box-shadow: 0 5px 20px rgba(255, 68, 68, 0.3);
                }
                
                /* Platform images with bounce */
                .platform-img { 
                    width: 90px; height: 90px; object-fit: contain; 
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
                    filter: drop-shadow(0 4px 20px rgba(0, 0, 0, 0.3));
                    animation: platformFloat 4s ease-in-out infinite;
                }
                .platform-img:nth-child(1) { animation-delay: 0s; }
                .platform-img:nth-child(2) { animation-delay: 0.5s; }
                .platform-img:nth-child(3) { animation-delay: 1s; }
                .platform-img:nth-child(4) { animation-delay: 1.5s; }
                .platform-img:nth-child(5) { animation-delay: 2s; }
                .platform-img:nth-child(6) { animation-delay: 2.5s; }
                @keyframes platformFloat {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-8px) rotate(3deg); }
                }
                .platform-img:hover { 
                    transform: scale(1.25) translateY(-10px) rotate(-5deg); 
                    filter: drop-shadow(0 15px 30px rgba(255, 68, 68, 0.3));
                }
                
                /* Typing cursor effect */
                .typing-cursor::after {
                    content: '|';
                    animation: blink 1s infinite;
                    color: #ff4444;
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                
                /* Scroll indicator */
                .scroll-indicator {
                    position: absolute;
                    bottom: 40px;
                    left: 50%;
                    transform: translateX(-50%);
                    animation: bounce 2s infinite;
                }
                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
                    40% { transform: translateX(-50%) translateY(-15px); }
                    60% { transform: translateX(-50%) translateY(-8px); }
                }
                
                /* Tablet */
                @media (max-width: 1024px) {
                    .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
                    .features-grid { grid-template-columns: repeat(2, 1fr) !important; }
                    .testimonials-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
                
                /* Mobile */
                @media (max-width: 768px) {
                    .hero-grid { grid-template-columns: 1fr !important; text-align: center; }
                    .hero-content { align-items: center !important; }
                    .stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 16px !important; }
                    .features-grid { grid-template-columns: 1fr !important; }
                    .testimonials-grid { grid-template-columns: 1fr !important; }
                    .api-layout { flex-direction: column !important; }
                    .api-sidebar { 
                        display: grid !important;
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 10px !important; 
                        padding-bottom: 20px;
                        width: 100%;
                    }
                    .logo{
                        margin: 0 auto !important;
                        height: 60px !important;
                    }
                    .api-sidebar .tab-btn { 
                        white-space: normal !important; 
                        padding: 12px 16px !important; 
                        text-align: center;
                        width: 100% !important;
                        font-size: 14px !important;
                    }
                    .platforms-row { flex-wrap: wrap !important; justify-content: center !important; gap: 16px !important; }
                    .nav-buttons { display: none !important; }
                    .platform-img { width: 60px !important; height: 60px !important; }
                    .cursor-glow { display: none; }
                    .badge { font-size: 11px !important; padding: 8px 14px !important; }
                    .glass-card { padding: 24px !important; border-radius: 16px !important; }
                    .stat-card { padding: 24px 16px !important; }
                    .testimonial-card { padding: 24px !important; }
                    .faq-q { padding: 18px 20px !important; font-size: 14px !important; }
                    .faq-a { padding: 0 20px 18px !important; font-size: 14px !important; }
                    .btn-primary, .btn-secondary { 
                        padding: 14px 28px !important; 
                        font-size: 14px !important;
                        width: 100%;
                        justify-content: center;
                    }
                    section { padding-left: 16px !important; padding-right: 16px !important; }
                    h1 { font-size: 28px !important; }
                    h2 { font-size: 22px !important; }
                }
                
                /* Small Mobile */
                @media (max-width: 480px) {
                    .stats-grid { grid-template-columns: 1fr 1fr !important; gap: 12px !important; }
                    .stat-card { padding: 20px 12px !important; }
                    .stat-card .gradient-text { font-size: 32px !important; }
                    .platform-img { width: 50px !important; height: 50px !important; }
                    .platforms-row { gap: 12px !important; }
                    h1 { font-size: 24px !important; line-height: 1.3 !important; }
                    h2 { font-size: 20px !important; }
                    p { font-size: 14px !important; }
                    .badge { font-size: 10px !important; padding: 6px 12px !important; letter-spacing: 1px !important; }
                    .glass-card { padding: 20px !important; }
                    .tab-btn { font-size: 12px !important; padding: 8px 12px !important; }
                    pre { font-size: 11px !important; padding: 16px !important; }
                    table { font-size: 13px !important; }
                    td, th { padding: 10px 12px !important; }
                }
                
                /* Mobile Menu */
                .mobile-menu-btn {
                    display: none;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 8px;
                    z-index: 101;
                }
                .mobile-menu-btn span {
                    display: block;
                    width: 24px;
                    height: 2px;
                    background: #fff;
                    margin: 6px 0;
                    transition: all 0.3s ease;
                }
                .mobile-menu-btn.active span:nth-child(1) {
                    transform: rotate(45deg) translate(6px, 6px);
                }
                .mobile-menu-btn.active span:nth-child(2) {
                    opacity: 0;
                }
                .mobile-menu-btn.active span:nth-child(3) {
                    transform: rotate(-45deg) translate(6px, -6px);
                }
                .mobile-menu {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(10, 10, 10, 0.98);
                    z-index: 99;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 20px;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                }
                .mobile-menu.open {
                    opacity: 1;
                    visibility: visible;
                }
                .mobile-menu a, .mobile-menu button {
                    font-size: 20px;
                    color: #fff;
                    text-decoration: none;
                    padding: 16px 32px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    transition: color 0.2s;
                }
                .mobile-menu a:hover, .mobile-menu button:hover {
                    color: #ff4444;
                }
                .nav-links { display: flex; align-items: center; gap: 8px; }
                @media (max-width: 768px) {
                    .mobile-menu-btn { display: block; }
                    .nav-links { display: none; }
                }
            `}</style>

            {/* Background Effects */}
            <div className="grid-bg"></div>
            <div className="glow-border"></div>

            {/* Cursor Glow Effect */}
            <div className="cursor-glow" style={{ left: mousePos.x, top: mousePos.y }}></div>

            {/* Header */}
            <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '16px 0', background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => { setActiveSection('home'); setMobileMenuOpen(false); }}>
                        {config?.logo ? (
                            <img src={config.logo} className="logo" alt="Logo" style={{ height: '70px', width: 'auto', objectFit: 'contain' }} />
                        ) : (
                            <>
                                <span style={{ fontSize: '28px' }}>⚡</span>
                                <span style={{ fontWeight: 700, fontSize: '20px', color: '#ffffff' }}>{Domain}</span>
                            </>
                        )}
                    </div>

                    {/* Desktop Nav */}
                    <nav className="nav-links">
                        <button onClick={() => setActiveSection('home')} style={{ background: 'none', border: 'none', color: activeSection === 'home' ? '#ff4444' : '#b0b0b0', padding: '12px 18px', cursor: 'pointer', fontWeight: 600, fontSize: '15px', transition: 'color 0.2s' }}>Trang Chủ</button>
                        <button onClick={() => setActiveSection('api')} style={{ background: 'none', border: 'none', color: activeSection === 'api' ? '#ff4444' : '#b0b0b0', padding: '12px 18px', cursor: 'pointer', fontWeight: 600, fontSize: '15px', transition: 'color 0.2s' }}>API</button>
                        <div className="nav-buttons" style={{ display: 'flex', gap: '12px', marginLeft: '20px' }}>
                            <button onClick={() => navigate('/dang-nhap')} className="btn-secondary" style={{ padding: '12px 24px' }}>Đăng Nhập</button>
                            <button onClick={() => navigate('/dang-ky')} className="btn-primary" style={{ padding: '12px 24px' }}>Đăng Ký</button>
                        </div>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
                <button onClick={() => { setActiveSection('home'); setMobileMenuOpen(false); }} style={{ color: activeSection === 'home' ? '#ff4444' : '#fff' }}>Trang Chủ</button>
                <button onClick={() => { setActiveSection('api'); setMobileMenuOpen(false); }} style={{ color: activeSection === 'api' ? '#ff4444' : '#fff' }}>API</button>
                <button onClick={() => { navigate('/dang-nhap'); setMobileMenuOpen(false); }}>Đăng Nhập</button>
                <button onClick={() => { navigate('/dang-ky'); setMobileMenuOpen(false); }} style={{ color: '#ff4444' }}>Đăng Ký</button>
            </div>

            <main style={{ position: 'relative', zIndex: 10, paddingTop: '80px' }}>
                {activeSection === 'home' && (
                    <div className="animate-fade-in">
                        {/* Hero Section */}
                        <section style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', padding: '40px 24px' }}>
                            <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                                <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '60px', alignItems: 'center' }}>
                                    {/* Left - Content */}
                                    <div className="hero-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                        <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, lineHeight: 1.15, marginBottom: '16px', color: '#ffffff', textAlign: 'left' }}>
                                            Hệ Thống Dịch Vụ Mạng Xã Hội Hàng Đầu Việt Nam
                                        </h1>
                                        <h2 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 700, marginBottom: '24px', textAlign: 'left' }}>
                                            <span className="rainbow-text">SMMPANEL - Social Media Marketing</span>
                                        </h2>
                                        <p style={{ fontSize: '17px', color: '#b0b0b0', lineHeight: 1.8, marginBottom: '32px', textAlign: 'left' }}>
                                            <strong style={{ color: '#ffffff' }}>{Domain || 'SMMPANEL'}</strong> là nhà cung cấp dịch vụ Facebook & TikTok & Instagram hàng đầu tại Việt Nam!! Cùng rất nhiều dịch vụ nền tảng khác giá tốt.
                                        </p>
                                        <p style={{ color: '#808080', marginBottom: '24px', fontSize: '14px', fontWeight: 500, letterSpacing: '0.5px' }}>Cung Cấp Hầu Hết Các Nền Tảng Trên Thị Trường</p>
                                        <div className="platforms-row" style={{ display: 'flex', gap: '24px', justifyContent: 'flex-start', alignItems: 'center', flexWrap: 'wrap' }}>
                                            {platforms.map((p, i) => (
                                                <div key={i} style={{ textAlign: 'center' }}>
                                                    <img src={p.img} alt={p.name} className="platform-img" style={{ width: '60px', height: '60px' }} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right - Auth Form */}
                                    <div className="glass-card" style={{ padding: '32px' }}>
                                        <div style={{ display: 'flex', marginBottom: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px' }}>
                                            <button
                                                onClick={() => { setAuthMode('login'); resetForm(); }}
                                                style={{
                                                    flex: 1, padding: '14px', border: 'none', borderRadius: '10px', cursor: 'pointer',
                                                    fontWeight: 600, fontSize: '15px',
                                                    background: authMode === 'login' ? 'linear-gradient(135deg, #ff4444, #cc3333)' : 'transparent',
                                                    color: authMode === 'login' ? 'white' : 'rgba(255,255,255,0.5)',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                Đăng Nhập
                                            </button>
                                            <button
                                                onClick={() => { setAuthMode('register'); resetForm(); }}
                                                style={{
                                                    flex: 1, padding: '14px', border: 'none', borderRadius: '10px', cursor: 'pointer',
                                                    fontWeight: 600, fontSize: '15px',
                                                    background: authMode === 'register' ? 'linear-gradient(135deg, #ff4444, #cc3333)' : 'transparent',
                                                    color: authMode === 'register' ? 'white' : 'rgba(255,255,255,0.5)',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                Đăng Ký
                                            </button>
                                        </div>

                                        {error && (
                                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '14px', marginBottom: '16px', color: '#ff6b6b', fontSize: '14px' }}>
                                                ⚠️ {error}
                                            </div>
                                        )}
                                        {success && (
                                            <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '12px', padding: '14px', marginBottom: '16px', color: '#4ade80', fontSize: '14px' }}>
                                                ✅ {success}
                                            </div>
                                        )}

                                        <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '8px', color: '#a0a0a0', fontSize: '14px', fontWeight: 500 }}>Tên đăng nhập</label>
                                                <input
                                                    type="text"
                                                    name="username"
                                                    placeholder="Nhập tên đăng nhập"
                                                    value={formData.username}
                                                    onChange={handleInputChange}
                                                    className="input"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '8px', color: '#a0a0a0', fontSize: '14px', fontWeight: 500 }}>Mật khẩu</label>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    placeholder="Nhập mật khẩu"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    className="input"
                                                    required
                                                />
                                            </div>

                                            {otpStep && (
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '8px', color: '#a0a0a0', fontSize: '14px', fontWeight: 500 }}>Mã 2FA</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Nhập mã 2FA từ app"
                                                        value={otp}
                                                        onChange={(e) => setOtp(e.target.value)}
                                                        className="input"
                                                        required
                                                    />
                                                </div>
                                            )}

                                            {authMode === 'register' && !siteKeyLoading && siteKey && (
                                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
                                                    <ReCAPTCHA
                                                        ref={recaptchaRef}
                                                        sitekey={siteKey}
                                                        theme="dark"
                                                        onChange={(token) => setRecaptchaToken(token)}
                                                        onExpired={() => setRecaptchaToken('')}
                                                    />
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="btn-primary"
                                                style={{ width: '100%', justifyContent: 'center', marginTop: '8px', opacity: loading ? 0.7 : 1, padding: '16px' }}
                                            >
                                                {loading ? '⏳ Đang xử lý...' : (authMode === 'login' ? '🔐 Đăng Nhập' : '📝 Đăng Ký')}
                                            </button>
                                        </form>

                                        {authMode === 'login' && (
                                            <p style={{ textAlign: 'center', marginTop: '20px', color: '#808080', fontSize: '14px' }}>
                                                Chưa có tài khoản? <span onClick={() => { setAuthMode('register'); resetForm(); }} style={{ color: '#ff4444', cursor: 'pointer', fontWeight: 600 }}>Đăng ký ngay</span>
                                            </p>
                                        )}
                                        {authMode === 'register' && (
                                            <p style={{ textAlign: 'center', marginTop: '20px', color: '#808080', fontSize: '14px' }}>
                                                Đã có tài khoản? <span onClick={() => { setAuthMode('login'); resetForm(); }} style={{ color: '#ff4444', cursor: 'pointer', fontWeight: 600 }}>Đăng nhập</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* About / Stats Section */}
                        <section style={{ padding: '10px 24px', background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 100%)' }}>
                            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                                <ScrollReveal>
                                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                                        <div className="badge" style={{ marginBottom: '20px' }}>✦ Về Chúng Tôi ✦</div>
                                        <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 700, lineHeight: 1.4, color: '#ffffff' }}>
                                            Giải pháp tăng tương tác mạng xã hội <span className="rainbow-text">nhanh, an toàn và hiệu quả</span>
                                            <br />cho Facebook, TikTok, Instagram và YouTube
                                        </h2>
                                    </div>
                                </ScrollReveal>
                                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '28px' }}>
                                    {stats.map((stat, i) => (
                                        <ScrollReveal key={i} delay={i * 0.1}>
                                            <div className="stat-card" style={{ padding: '40px 24px', textAlign: 'center' }}>
                                                <AnimatedCount value={stat.value} duration={2000} />
                                                <div style={{ color: '#b0b0b0', fontSize: '15px', fontWeight: 500 }}>{stat.label}</div>
                                            </div>
                                        </ScrollReveal>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Features Section */}
                        <section style={{ padding: '100px 24px' }}>
                            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                                <ScrollReveal>
                                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                                        <div className="badge" style={{ marginBottom: '20px' }}>✦ Hiệu Quả Thực Tế ✦</div>
                                        <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 700, marginBottom: '20px', color: '#ffffff' }}>
                                            Mang lại <span className="rainbow-text">kết quả rõ ràng</span> giúp tăng trưởng mạnh mẽ
                                        </h2>
                                        <p style={{ fontSize: '18px', color: '#b0b0b0' }}>
                                            Tăng tương tác người dùng trên Facebook – TikTok – Instagram.
                                        </p>
                                    </div>
                                </ScrollReveal>
                                <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' }}>
                                    {features.map((f, i) => (
                                        <ScrollReveal key={i} delay={i * 0.15}>
                                            <div className="glass-card" style={{ padding: '36px' }}>
                                                <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #ff4444, #ff6b6b)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', fontSize: '26px', color: 'white' }}>✓</div>
                                                <p style={{ color: '#c0c0c0', fontSize: '16px', lineHeight: 1.9 }}>{f.text}</p>
                                            </div>
                                        </ScrollReveal>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Testimonials Section */}
                        <section style={{ padding: '100px 24px', background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 100%)' }}>
                            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                                <ScrollReveal>
                                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                                        <div className="badge" style={{ marginBottom: '20px' }}>✦ Khách hàng nói gì? ✦</div>
                                        <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 700, marginBottom: '20px', color: '#ffffff' }}>
                                            Hơn <span className="rainbow-text">5.000+ creator & doanh nghiệp</span> tin tưởng dịch vụ Tăng Tương Tác
                                        </h2>
                                        <p style={{ fontSize: '17px', color: '#a0a0a0', maxWidth: '750px', margin: '0 auto' }}>
                                            Chúng tôi giúp bạn tăng tương tác thật, tối ưu thuật toán và mở rộng độ phủ thương hiệu trên Facebook, TikTok, Instagram và YouTube.
                                        </p>
                                    </div>
                                </ScrollReveal>

                                <ScrollReveal delay={0.2}>
                                    <div style={{ display: 'flex', gap: '60px', justifyContent: 'center', marginBottom: '60px', flexWrap: 'wrap' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <AnimatedCount value="5k+" duration={2000} />
                                            <div style={{ color: '#a0a0a0', fontSize: '16px', fontWeight: 500 }}>Khách hàng hài lòng</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <AnimatedCount value="35M+" duration={2500} />
                                            <div style={{ color: '#a0a0a0', fontSize: '16px', fontWeight: 500 }}>Lượt tương tác đã tạo ra</div>
                                        </div>
                                    </div>
                                </ScrollReveal>

                                <div className="testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' }}>
                                    {testimonials.map((t, i) => (
                                        <ScrollReveal key={i} delay={i * 0.15}>
                                            <div className="testimonial-card">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                                                    <img style={{ width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }} src={t.img} alt="" />
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: '17px', color: '#ffffff' }}>{t.name}</div>
                                                        <div style={{ fontSize: '14px', color: '#808080' }}>{t.role}</div>
                                                    </div>
                                                </div>
                                                <p style={{ color: '#c0c0c0', lineHeight: 1.8, fontSize: '15px' }}>"{t.text}"</p>
                                            </div>
                                        </ScrollReveal>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* FAQ Section */}
                        <section style={{ padding: '100px 24px' }}>
                            <div style={{ maxWidth: '850px', margin: '0 auto' }}>
                                <ScrollReveal>
                                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                                        <div className="badge" style={{ marginBottom: '20px' }}>✦ Câu hỏi thường gặp ✦</div>
                                        <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 700, marginBottom: '20px', color: '#ffffff' }}>
                                            Giải đáp thắc mắc về dịch vụ <span className="rainbow-text">tăng tương tác mạng xã hội</span>
                                        </h2>
                                        <button onClick={() => navigate('/home')} className="btn-primary" style={{ marginTop: '20px' }}>Truy Cập Ngay</button>
                                    </div>
                                </ScrollReveal>
                                {faqs.map((faq, i) => (
                                    <ScrollReveal key={i} delay={i * 0.1}>
                                        <div className={`faq-item ${activeFaq === i ? 'active' : ''}`}>
                                            <div className="faq-q" onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                                                <span>{faq.q}</span>
                                                <span style={{ color: '#ff4444', fontSize: '24px', fontWeight: 700 }}>{activeFaq === i ? '−' : '+'}</span>
                                            </div>
                                            {activeFaq === i && <div className="faq-a">{faq.a}</div>}
                                        </div>
                                    </ScrollReveal>
                                ))}
                            </div>
                        </section>

                        {/* CTA Section */}
                        <section style={{ padding: '100px 24px' }}>
                            <div style={{ maxWidth: '850px', margin: '0 auto' }}>
                                <ScrollReveal>
                                    <div className="glass-card" style={{ padding: '64px 48px', textAlign: 'center', background: 'linear-gradient(145deg, rgba(255, 68, 68, 0.08) 0%, rgba(100, 100, 255, 0.05) 100%)' }}>
                                        <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700, marginBottom: '20px', color: '#ffffff' }}>
                                            <span className="rainbow-text">Sẵn sàng tăng trưởng ngay hôm nay?</span>
                                        </h2>
                                        <p style={{ color: '#a0a0a0', marginBottom: '36px', fontSize: '18px', lineHeight: 1.7 }}>Tạo tài khoản miễn phí, thêm số dư sau – bắt đầu trong 60 giây.</p>
                                        <button onClick={() => navigate('/dang-ky')} className="btn-primary" style={{ fontSize: '17px', padding: '20px 56px' }}>🚀 Tạo Tài Khoản Ngay</button>
                                    </div>
                                </ScrollReveal>
                            </div>
                        </section>
                    </div>
                )}

                {/* API Docs Section */}
                {activeSection === 'api' && (
                    <div className="animate-fade-in" style={{ padding: '60px 24px' }}>
                        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                                <div className="badge" style={{ marginBottom: '20px' }}>✦ API DOCUMENTATION ✦</div>
                                <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, color: '#ffffff' }}><span className="gradient-text">API</span> Documentation</h1>
                            </div>

                            <div className="glass-card" style={{ padding: '28px', marginBottom: '36px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <tbody>
                                        <tr><td style={{ padding: '16px 20px', color: '#808080', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 500 }}>API URL</td><td style={{ padding: '16px 20px', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)', wordBreak: 'break-all', color: '#ffffff' }}>{API_URL}</td></tr>
                                        <tr><td style={{ padding: '16px 20px', color: '#808080', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 500 }}>API Key</td><td style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><span style={{ color: '#ff4444', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/profile')}>Đăng nhập để lấy API Key →</span></td></tr>
                                        <tr><td style={{ padding: '16px 20px', color: '#808080', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 500 }}>HTTP Method</td><td style={{ padding: '16px 20px', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#ffffff' }}>POST</td></tr>
                                        <tr><td style={{ padding: '16px 20px', color: '#808080', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 500 }}>Content-Type</td><td style={{ padding: '16px 20px', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#ffffff' }}>application/json</td></tr>
                                        <tr><td style={{ padding: '16px 20px', color: '#808080', fontWeight: 500 }}>Response</td><td style={{ padding: '16px 20px', fontWeight: 600, color: '#ffffff' }}>JSON</td></tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="api-layout" style={{ display: 'flex', gap: '28px' }}>
                                <div className="api-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '200px' }}>
                                    {apiTabs.map((tab) => (<button key={tab.id} onClick={() => setActiveApiTab(tab.id)} className={`tab-btn ${activeApiTab === tab.id ? 'active' : ''}`}>{tab.label}</button>))}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="glass-card" style={{ padding: '32px' }}>
                                        <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px', textTransform: 'capitalize', color: '#ffffff' }}>{activeApiTab.replace('multistatus', 'Multiple Orders Status')}</h3>
                                        <div style={{ marginBottom: '28px' }}>
                                            <h4 style={{ color: '#808080', fontSize: '13px', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>Parameters</h4>
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead><tr><th style={{ padding: '14px 16px', textAlign: 'left', background: 'rgba(255,255,255,0.03)', borderRadius: '10px 0 0 10px', color: '#a0a0a0', fontWeight: 600 }}>Parameter</th><th style={{ padding: '14px 16px', textAlign: 'left', background: 'rgba(255,255,255,0.03)', borderRadius: '0 10px 10px 0', color: '#a0a0a0', fontWeight: 600 }}>Description</th></tr></thead>
                                                <tbody>{apiContent[activeApiTab]?.params.map(([param, desc], i) => (<tr key={i}><td style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontFamily: 'monospace', color: '#ff6b6b', fontWeight: 500 }}>{param}</td><td style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#a0a0a0' }}>{desc}</td></tr>))}</tbody>
                                            </table>
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                <h4 style={{ color: '#808080', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>Example Response</h4>
                                                <button onClick={() => handleCopy(apiContent[activeApiTab]?.response)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', padding: '8px 16px', borderRadius: '8px', color: copySuccess ? '#4ade80' : '#a0a0a0', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>{copySuccess || 'Copy'}</button>
                                            </div>
                                            <pre style={{ background: 'rgba(0,0,0,0.5)', padding: '24px', borderRadius: '14px', overflow: 'auto', fontSize: '14px', color: '#67e8f9', lineHeight: 1.7, border: '1px solid rgba(255,255,255,0.05)' }}>{apiContent[activeApiTab]?.response}</pre>
                                            {apiContent[activeApiTab]?.note && <p style={{ color: '#808080', fontSize: '14px', marginTop: '16px' }}>📌 {apiContent[activeApiTab].note}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '50px 24px', marginTop: '60px', position: 'relative', zIndex: 10 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <p style={{ color: '#606060', fontSize: '14px' }}>© 2025 {Domain || 'SMMPANEL'}. All rights reserved.</p>
                    <div style={{ display: 'flex', gap: '32px' }}>
                        <a href="#" style={{ color: '#808080', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Điều Khoản</a>
                        <a href="#" style={{ color: '#808080', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Chính Sách</a>
                        <a href="#" style={{ color: '#808080', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Liên Hệ</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}