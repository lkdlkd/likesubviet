import React, { useEffect, useState, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, register, getRecaptchaSiteKey } from '@/Utils/api';
import { AuthContext } from '@/Context/AuthContext';
import Table from "react-bootstrap/Table";
import ReCAPTCHA from "react-google-recaptcha";
export default function Landing() {
    // Modal states
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
    const API_DOMAIN = window.location.origin; // Lấy tên miền hiện tại và thêm đường dẫn API
    const Domain = API_DOMAIN.replace(/^https?:\/\//, ""); // Bỏ https:// hoặc http://

    // Section visibility states
    const [showApiDocs, setShowApiDocs] = useState(false);
    const [activeSection, setActiveSection] = useState('home'); // 'home', 'api', 'docs'
    const [activeApiTab, setActiveApiTab] = useState('services'); // Track active API tab
    const [copySuccess, setCopySuccess] = useState(''); // Track copy feedback

    // Form states
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [otpStep, setOtpStep] = useState(false);
    const [otp, setOtp] = useState('');
    const [recaptchaToken, setRecaptchaToken] = useState('');
    const [siteKey, setSiteKey] = useState('');
    const [siteKeyLoading, setSiteKeyLoading] = useState(true);
    const [recaptchaReady, setRecaptchaReady] = useState(false);
    const recaptchaRef = useRef(null);

    const navigate = useNavigate();
    const { updateAuth } = useContext(AuthContext);

    // Handle form input changes
    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Reset form
    const resetForm = () => {
        setFormData({ username: '', password: '', confirmPassword: '' });
        setError('');
        setSuccess('');
        setOtpStep(false);
        setOtp('');
        setRecaptchaToken('');
        setRecaptchaReady(false);
        if (recaptchaRef.current) {
            recaptchaRef.current.reset();
        }
    };

    // Handle auth modal open/close
    const openAuthModal = (mode) => {
        setAuthMode(mode);
        setShowAuthModal(true);
        resetForm();
    };

    const closeAuthModal = () => {
        setShowAuthModal(false);
        resetForm();
    };

    // Handle login
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const payload = {
                username: formData.username,
                password: formData.password
            };
            if (otpStep) payload.token = otp;

            const data = await login(payload);

            if (data.twoFactorRequired && !otpStep) {
                setOtpStep(true);
                setSuccess('Nhập mã 2FA để tiếp tục.');
                return;
            }

            if (data.token) {
                localStorage.setItem('token', data.token);
                updateAuth({ token: data.token, role: data.role });
                setSuccess('Đăng nhập thành công!');
                setTimeout(() => {
                    closeAuthModal();
                    navigate('/home');
                }, 1000);
            }
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // Handle register
    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (formData.username.length > 100) {
            setError('Tên tài khoản không được dài hơn 100 ký tự.');
            setLoading(false);
            return;
        }

        // Kiểm tra reCAPTCHA
        if (!recaptchaToken) {
            setError('Vui lòng xác nhận bạn không phải là người máy.');
            setLoading(false);
            return;
        }

        // if (formData.password !== formData.confirmPassword) {
        //     setError('Mật khẩu xác nhận không khớp.');
        //     setLoading(false);
        //     return;
        // }

        try {
            const data = await register({
                username: formData.username,
                password: formData.password,
                recaptchaToken: recaptchaToken
            });
            setSuccess(data.message || 'Đăng ký thành công!');
            setTimeout(() => {
                setAuthMode('login');
                resetForm();
            }, 1500);
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
            // Reset reCAPTCHA khi có lỗi
            setRecaptchaToken('');
            if (recaptchaRef.current) {
                recaptchaRef.current.reset();
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle copy with feedback
    const handleCopy = async (text, label = 'Code') => {
        try {
            await navigator.clipboard.writeText(text);
            setCopySuccess(label);
            setTimeout(() => setCopySuccess(''), 2000);
        } catch (err) {
        }
    };

    // Lấy reCAPTCHA site key
    useEffect(() => {
        const fetchSiteKey = async () => {
            try {
                setSiteKeyLoading(true);
                const data = await getRecaptchaSiteKey();
                setSiteKey(data.siteKey);
            } catch (err) {

            } finally {
                setSiteKeyLoading(false);
            }
        };
        fetchSiteKey();
    }, []);

    useEffect(() => {
        // Add custom CSS animations
        const style = document.createElement('style');
        style.textContent = `
            /* CSS Reset & Base Styles */
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }

            /* Design System Variables */
            :root {
                --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                --success-gradient: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                --glass-bg: rgba(255, 255, 255, 0.1);
                --glass-border: rgba(255, 255, 255, 0.2);
                --text-primary: #2d3748;
                --text-secondary: #4a5568;
                --text-muted: #718096;
                --border-radius: 12px;
                --border-radius-lg: 16px;
                --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
                --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
                --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.15);
                --shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.2);
                --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                --transition-fast: all 0.15s ease;
                --transition-slow: all 0.5s ease;
                --spacing-xs: 0.25rem;
                --spacing-sm: 0.5rem;
                --spacing-md: 1rem;
                --spacing-lg: 1.5rem;
                --spacing-xl: 2rem;
                --spacing-2xl: 3rem;
                --spacing-3xl: 4rem;
                --z-dropdown: 1000;
                --z-sticky: 1020;
                --z-fixed: 1030;
                --z-modal-backdrop: 1040;
                --z-modal: 1050;
                --z-popover: 1060;
                --z-tooltip: 1070;
            }

            /* Dark Mode Support */
            @media (prefers-color-scheme: dark) {
                :root {
                    --text-primary: #f7fafc;
                    --text-secondary: #e2e8f0;
                    --text-muted: #a0aec0;
                    --glass-bg: rgba(0, 0, 0, 0.2);
                    --glass-border: rgba(255, 255, 255, 0.1);
                }
            }

            /* High Contrast Mode Support */
            @media (prefers-contrast: high) {
                :root {
                    --glass-bg: rgba(255, 255, 255, 0.95);
                    --glass-border: rgba(0, 0, 0, 0.5);
                    --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3);
                    --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.3);
                    --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.3);
                }
            }

            /* Typography Scale */
            .text-xs { font-size: 0.75rem; line-height: 1rem; }
            .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
            .text-base { font-size: 1rem; line-height: 1.5rem; }
            .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
            .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
            .text-2xl { font-size: 1.5rem; line-height: 2rem; }
            .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
            .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
            .text-5xl { font-size: 3rem; line-height: 1; }

            /* Spacing Utilities */
            .space-y-2 > * + * { margin-top: var(--spacing-sm); }
            .space-y-4 > * + * { margin-top: var(--spacing-md); }
            .space-y-6 > * + * { margin-top: var(--spacing-lg); }
            .space-y-8 > * + * { margin-top: var(--spacing-xl); }

            /* Animation Library */
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes fadeInLeft {
                from {
                    opacity: 0;
                    transform: translateX(-30px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            @keyframes fadeInRight {
                from {
                    opacity: 0;
                    transform: translateX(30px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            @keyframes fadeInScale {
                from {
                    opacity: 0;
                    transform: scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }

            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }

            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
            /* Component Styles */
            .glass-card {
                background: var(--glass-bg);
                backdrop-filter: blur(20px);
                border: 1px solid var(--glass-border);
                border-radius: var(--border-radius-lg);
                box-shadow: var(--shadow-lg);
            }

            .gradient-text {
                background: var(--primary-gradient);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .btn-primary-gradient {
                background: var(--primary-gradient);
                border: none;
                color: white;
                transition: var(--transition);
                position: relative;
                overflow: hidden;
            }

            .btn-primary-gradient::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transition: left 0.5s;
            }

            .btn-primary-gradient:hover::before {
                left: 100%;
            }

            .btn-primary-gradient:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
            }

            /* Enhanced Animations */
            .animate-on-scroll {
                opacity: 0;
                transform: translateY(20px);
                transition: var(--transition);
            }

            .animate-on-scroll.visible {
                opacity: 1;
                transform: translateY(0);
            }

            .hover-lift {
                transition: var(--transition);
            }

            .hover-lift:hover {
                transform: translateY(-4px);
                box-shadow: var(--shadow-xl);
            }

            /* Loading States */
            .loading-skeleton {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: loading 1.5s infinite;
            }

            @keyframes loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }

      @keyframes slideInScale {
        from {
          opacity: 0;
          transform: scale(0.8);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      .fade-in-up {
        animation: fadeInUp 0.8s ease-out forwards;
      }

      .fade-in-left {
        animation: fadeInLeft 0.8s ease-out forwards;
      }

      .fade-in-right {
        animation: fadeInRight 0.8s ease-out forwards;
      }

      .slide-in-scale {
        animation: slideInScale 0.6s ease-out forwards;
      }

      .hover-lift {
        transition: all 0.3s ease;
      }

      .hover-lift:hover {
        transform: translateY(-10px);
        box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important;
      }

      .btn-gradient {
        background: linear-gradient(45deg, #667eea, #764ba2);
        border: none;
        transition: all 0.3s ease;
      }

      .btn-gradient:hover {
        background: linear-gradient(45deg, #764ba2, #667eea);
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
      }

      .feature-icon {
        transition: all 0.3s ease;
      }

      .feature-icon:hover {
        animation: pulse 1s infinite;
      }

      .floating {
        animation: float 3s ease-in-out infinite;
      }

      .parallax-bg {
        background-attachment: fixed;
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
      }

      .gradient-text {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .glass-effect {
        backdrop-filter: blur(20px);
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .stats-counter {
        font-weight: 700;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      /* Intersection Observer Animation Classes */
      .animate-on-scroll {
        opacity: 0;
        transform: translateY(50px);
        transition: all 0.8s ease-out;
      }

      .animate-on-scroll.animated {
        opacity: 1;
        transform: translateY(0);
      }

      .hero-particles {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        z-index: 1;
      }

      .particle {
        position: absolute;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        animation: floatParticle 20s infinite linear;
      }

      @keyframes floatParticle {
        0% {
          transform: translateY(100vh) rotate(0deg);
          opacity: 0;
        }
        10% {
          opacity: 1;
        }
        90% {
          opacity: 1;
        }
        100% {
          transform: translateY(-100px) rotate(360deg);
          opacity: 0;
        }
      }

      /* Auth Modal Styles */
      .auth-modal {
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
      }

      .auth-modal-content {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 20px;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
      }

      .auth-tab {
        border: none;
        background: transparent;
        color: #6c757d;
        padding: 12px 24px;
        border-radius: 15px;
        transition: all 0.3s ease;
        font-weight: 500;
      }

      .auth-tab.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      }

      .auth-form-control {
        border: 2px solid rgba(102, 126, 234, 0.1);
        border-radius: 12px;
        padding: 12px 16px;
        transition: all 0.3s ease;
        background: rgba(255, 255, 255, 0.8);
      }

      .auth-form-control:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        background: white;
      }

      .auth-btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        border-radius: 12px;
        padding: 12px 24px;
        font-weight: 600;
        transition: all 0.3s ease;
      }

      .auth-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
      }

      .fade-modal {
        animation: fadeInModal 0.3s ease-out;
      }

      @keyframes fadeInModal {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      /* Header Navigation Styles */
      .navbar-custom {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        z-index: 1000;
        padding: 0.5rem 0;
      }

      .navbar-custom.scrolled {
        background: rgba(255, 255, 255, 0.98);
        box-shadow: 0 2px 20px rgba(0, 0, 0, 0.15);
      }

      @media (max-width: 768px) {
        .navbar-custom {
          padding: 0.75rem 0;
        }
        
        .navbar-collapse {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-radius: 12px;
          margin-top: 1rem;
          padding: 1rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
      }

      .navbar-brand-custom {
        font-weight: 800;
        font-size: 1.5rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-decoration: none;
        transition: all 0.3s ease;
      }

      .navbar-brand-custom:hover {
        transform: scale(1.05);
      }

      .nav-btn {
        background: transparent;
        border: 2px solid transparent;
        border-radius: 12px;
        padding: 8px 20px;
        font-weight: 600;
        transition: all 0.3s ease;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: #6c757d;
        font-size: 0.9rem;
      }

      @media (max-width: 768px) {
        .nav-btn {
          width: 100%;
          justify-content: center;
          margin-bottom: 0.5rem;
          padding: 12px 20px;
          font-size: 1rem;
        }
        
        .navbar-nav {
          gap: 0 !important;
        }
        
        .vr {
          display: none !important;
        }
      }

      .nav-btn:hover {
        color: #667eea;
        border-color: rgba(102, 126, 234, 0.3);
        background: rgba(102, 126, 234, 0.1);
        transform: translateY(-2px);
      }

      .nav-btn.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-color: transparent;
      }

      .nav-btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
      }

      .nav-btn-primary:hover {
        color: white;
        background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
      }

      .nav-btn-outline {
        border-color: #667eea;
        color: #667eea;
      }

      .section-container {
        min-height: calc(100vh - 80px);
        transition: all 0.5s ease;
      }

      .section-hidden {
        display: none;
      }

      .section-visible {
        display: block;
        animation: fadeInSection 0.5s ease-out;
      }

      @keyframes fadeInSection {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Mobile Optimizations */
      @media (max-width: 768px) {
        .hero-section {
          min-height: 100vh !important;
          padding-top: 2rem;
        }
        
        .hero-section .container {
          padding-top: 2rem !important;
        }
        
        .hero-section .row {
          min-height: auto !important;
        }
        
        .display-5 {
          font-size: 2rem !important;
        }
        
        .lead {
          font-size: 1rem !important;
        }
        
        .auth-form-card {
          max-width: 100% !important;
          margin: 2rem 0 !important;
        }
        
        .floating-decorations {
          display: none;
        }
        
        .btn-lg {
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
        }
        
        .badge.bg-light.bg-opacity-10 {
          margin-bottom: 0.5rem;
          display: block;
          width: fit-content;
        }
      }

      @media (max-width: 576px) {
        .display-5 {
          font-size: 1.75rem !important;
          line-height: 1.3;
        }
        
        .hero-section {
          padding-top: 1rem;
        }
        
        .auth-form-card {
          margin: 1rem 0 !important;
        }
        
        .btn-lg {
          padding: 0.6rem 1.2rem;
          font-size: 0.9rem;
        }
      }
    `;
        document.head.appendChild(style);

        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, observerOptions);

        // Observe all elements with animate-on-scroll class
        setTimeout(() => {
            document.querySelectorAll('.animate-on-scroll').forEach(el => {
                observer.observe(el);
            });
        }, 100);

        // Create floating particles
        const createParticles = () => {
            const heroSection = document.querySelector('.hero-particles');
            if (heroSection) {
                for (let i = 0; i < 15; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'particle';
                    particle.style.left = Math.random() * 100 + '%';
                    particle.style.width = particle.style.height = Math.random() * 10 + 5 + 'px';
                    particle.style.animationDelay = Math.random() * 20 + 's';
                    particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
                    heroSection.appendChild(particle);
                }
            }
        };

        setTimeout(createParticles, 100);

        return () => {
            document.head.removeChild(style);
            observer.disconnect();
        };
    }, []);

    // Enhanced styles and animations
    useEffect(() => {
        // Add floating animation keyframes
        const floatingKeyframes = `
            @keyframes floatAPI {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                33% { transform: translateY(-10px) rotate(1deg); }
                66% { transform: translateY(5px) rotate(-1deg); }
            }
            @keyframes shimmer {
                0% { background-position: -200px 0; }
                100% { background-position: calc(200px + 100%) 0; }
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.05); opacity: 0.8; }
            }
            @keyframes slideInUp {
                0% { transform: translateY(30px); opacity: 0; }
                100% { transform: translateY(0); opacity: 1; }
            }
            @keyframes glow {
                0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.3); }
                50% { box-shadow: 0 0 30px rgba(102, 126, 234, 0.6), 0 0 40px rgba(118, 75, 162, 0.4); }
            }
        `;

        // Add keyframes to document
        let styleSheet = document.getElementById('api-animations');
        if (!styleSheet) {
            styleSheet = document.createElement('style');
            styleSheet.id = 'api-animations';
            styleSheet.textContent = floatingKeyframes;
            document.head.appendChild(styleSheet);
        }
        const enhancedStyle = document.createElement('style');
        enhancedStyle.textContent = `
            /* Enhanced Landing Page Optimizations */
            .hero-section {
                background: linear-gradient(135deg, #2c3e50 0%, #3498db 50%, #9b59b6 100%);
                position: relative;
                overflow: hidden;
                min-height: 100vh;
                display: flex;
                align-items: center;
            }
            
            .hero-section::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: 
                    radial-gradient(circle at 20% 80%, rgba(52, 152, 219, 0.2) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(155, 89, 182, 0.15) 0%, transparent 50%);
                pointer-events: none;
            }

            /* Enhanced Text Contrast */
            .hero-section .text-white {
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
                color: #ffffff !important;
            }
            
            .hero-section .lead {
                color: rgba(255, 255, 255, 0.95) !important;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
            }

            /* Enhanced Button Animations */
            .btn-warning {
                background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%) !important;
                border: none !important;
                color: #ffffff !important;
                font-weight: 600 !important;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
            }
            
            .btn-warning:hover {
                background: linear-gradient(135deg, #e67e22 0%, #d35400 100%) !important;
                animation: pulse-glow 0.6s ease-in-out;
                color: #ffffff !important;
            }
            
            @keyframes pulse-glow {
                0% { box-shadow: 0 4px 15px rgba(243, 156, 18, 0.4); }
                50% { box-shadow: 0 8px 30px rgba(243, 156, 18, 0.7); }
                100% { box-shadow: 0 4px 15px rgba(243, 156, 18, 0.4); }
            }

            /* Glass Effect Enhancement */
            .glass-effect {
                background: rgba(255, 255, 255, 0.25) !important;
                backdrop-filter: blur(15px);
                border: 2px solid rgba(255, 255, 255, 0.3) !important;
                transition: all 0.3s ease;
                color: #ffffff !important;
                font-weight: 500;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
            }
            
            .glass-effect:hover {
                background: rgba(255, 255, 255, 0.35) !important;
                border-color: rgba(255, 255, 255, 0.5) !important;
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                color: #ffffff !important;
            }

            /* Enhanced Cards */
            .feature-card {
                transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
                border: 2px solid rgba(255, 255, 255, 0.2);
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
            }
            
            .feature-card:hover {
                transform: translateY(-10px);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                border-color: rgba(255, 255, 255, 0.4);
                background: rgba(255, 255, 255, 0.15);
            }
            
            .feature-card .text-white {
                color: #ffffff !important;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
            }
            
            .feature-card .text-muted {
                color: rgba(255, 255, 255, 0.8) !important;
            }

            /* Enhanced Mobile Responsive */
            @media (max-width: 768px) {
                .hero-section {
                    min-height: 100vh;
                    padding: 2rem 0;
                }
                
                .hero-section .display-2 {
                    font-size: 2.5rem !important;
                    line-height: 1.2;
                }
                
                .hero-section .lead {
                    font-size: 1rem !important;
                }
                
                .feature-card {
                    margin-bottom: 1.5rem;
                }
                
                .navbar-custom .navbar-collapse {
                    background: rgba(0, 0, 0, 0.95);
                    backdrop-filter: blur(20px);
                    border-radius: 10px;
                    margin-top: 1rem;
                    padding: 1rem;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                }
            }

            /* Enhanced Section Transitions */
            .section-container {
                transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
            }
            
            .section-visible {
                opacity: 1;
                transform: translateX(0);
                pointer-events: all;
            }
            
            .section-hidden {
                opacity: 0;
                transform: translateX(100%);
                pointer-events: none;
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                z-index: -1;
            }

            /* Performance Optimizations */
            * {
                will-change: auto;
            }
            
            .hero-section,
            .section-container,
            .feature-card,
            .social-link {
                will-change: transform;
            }

            /* Enhanced Navbar */
            .navbar-custom {
                background: rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(10px);
                transition: all 0.3s ease;
            }

            /* API Tab Animations */
            .tab-content-item {
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .tab-content-item.active {
                opacity: 1 !important;
                visibility: visible !important;
                transform: translateY(0) !important;
            }

            /* Enhanced Tab Hover Effects */
            .nav-pills .nav-link {
                position: relative;
                overflow: hidden;
            }

            .nav-pills .nav-link::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transition: left 0.5s;
            }

            .nav-pills .nav-link:hover::before {
                left: 100%;
            }

            /* Smooth scroll behavior */
            html {
                scroll-behavior: smooth;
            }

            /* Code block animations */
            pre {
                position: relative;
            }

            .copy-success {
                animation: copyFeedback 0.3s ease-out;
            }

            @keyframes copyFeedback {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }

            /* Mobile-First Responsive Design */
            @media (max-width: 640px) {
                :root {
                    --spacing-xs: 0.125rem;
                    --spacing-sm: 0.25rem;
                    --spacing-md: 0.75rem;
                    --spacing-lg: 1rem;
                    --spacing-xl: 1.5rem;
                    --spacing-2xl: 2rem;
                }
                
                .container {
                    padding-left: 1rem !important;
                    padding-right: 1rem !important;
                }
                
                .text-4xl { font-size: 1.875rem; line-height: 2.25rem; }
                .text-3xl { font-size: 1.5rem; line-height: 2rem; }
                .text-2xl { font-size: 1.25rem; line-height: 1.75rem; }
                
                .btn-lg {
                    font-size: 0.875rem !important;
                    padding: 0.75rem 1.5rem !important;
                    min-height: 44px;
                }
                
                .nav-pills .nav-link {
                    font-size: 0.8125rem !important;
                    padding: 0.625rem 0.875rem !important;
                    min-height: 44px;
                }
                
                .table-responsive {
                    border-radius: var(--border-radius);
                    border: 1px solid rgba(0,0,0,0.1);
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }
                
                .tab-content {
                    min-height: 400px !important;
                }
                
                pre {
                    font-size: 0.6875rem !important;
                    line-height: 1.2 !important;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }
                
                .glass-card {
                    margin: var(--spacing-sm);
                    border-radius: var(--border-radius);
                    padding: var(--spacing-md) !important;
                }
                
                .hero-section {
                    min-height: 100vh;
                    padding-top: 80px;
                }
                
                .card-body {
                    padding: 1rem !important;
                }
            }

            @media (max-width: 768px) {
                .d-lg-flex {
                    flex-direction: column !important;
                }
                
                .nav-pills {
                    min-width: 100% !important;
                    margin-bottom: var(--spacing-lg) !important;
                }
                
                .nav-pills .nav-link {
                    justify-content: center !important;
                }
                
                .api-docs-section .container {
                    padding-left: var(--spacing-md) !important;
                    padding-right: var(--spacing-md) !important;
                }
                
                .modal-dialog {
                    margin: 0.5rem;
                }
                
                .modal-content {
                    border-radius: var(--border-radius);
                }
            }

            /* Tablet Breakpoint */
            @media (min-width: 641px) and (max-width: 1024px) {
                .text-4xl { font-size: 2rem; line-height: 2.5rem; }
                .text-3xl { font-size: 1.75rem; line-height: 2.25rem; }

                .container {
                    max-width: 90% !important;
                }
            }

            /* Touch Device Optimizations */
            @media (hover: none) and (pointer: coarse) {
                .btn,
                .nav-link,
                button,
                a[role="button"] {
                    min-height: 44px;
                    min-width: 44px;
                    padding: 0.625rem 1rem;
                }
                .hover-lift:active {
                    transform: scale(0.98);
                }
                
                .btn-primary-gradient:active {
                    transform: scale(0.98);
                }
            }

            /* Enhanced Accessibility */
            .btn:focus,
            .nav-link:focus,
            button:focus,
            a:focus,
            input:focus,
            textarea:focus,
            select:focus {
                outline: 3px solid #667eea;
                outline-offset: 2px;
                box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
            }

            .btn:focus:not(:focus-visible),
            .nav-link:focus:not(:focus-visible),
            button:focus:not(:focus-visible) {
                outline: none;
                box-shadow: none;
            }

            /* Skip to main content link */
            .skip-to-main {
                position: absolute;
                left: -9999px;
                z-index: 9999;
                padding: 1rem 1.5rem;
                background-color: white;
                color: #667eea;
                text-decoration: none;
                border-radius: 0.5rem;
                font-weight: 600;
            }

            .skip-to-main:focus {
                left: 50%;
                transform: translateX(-50%);
                top: 1rem;
            }

            /* Screen Reader Only */
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border-width: 0;
            }

            /* Accessibility Improvements */
            @media (prefers-reduced-motion: reduce) {
                *,
                *::before,
                *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                    scroll-behavior: auto !important;
                }
                
                .animate-on-scroll {
                    opacity: 1 !important;
                    transform: none !important;
                }
            }

            /* High Contrast Mode Support */
            @media (prefers-contrast: high) {
                :root {
                    --glass-bg: rgba(255, 255, 255, 0.95);
                    --glass-border: rgba(0, 0, 0, 0.5);
                    --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3);
                    --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.3);
                    --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.3);
                }
                
                .btn,
                .nav-link {
                    border: 2px solid currentColor;
                }
            }

            /* Dark Mode Support */
            @media (prefers-color-scheme: dark) {
                :root {
                    --text-primary: #f7fafc;
                    --text-secondary: #e2e8f0;
                    --text-muted: #a0aec0;
                    --glass-bg: rgba(0, 0, 0, 0.4);
                    --glass-border: rgba(255, 255, 255, 0.1);
                }
                
                .card,
                .modal-content {
                    background-color: rgba(30, 30, 30, 0.95);
                    color: #f7fafc;
                }
            }

            /* Performance Optimizations */
            .glass-card,
            .btn-primary-gradient,
            .hover-lift {
                will-change: transform;
                backface-visibility: hidden;
                -webkit-font-smoothing: antialiased;
                transform: translateZ(0);
            }

            /* Prevent layout shift */
            img,
            video,
            iframe {
                max-width: 100%;
                height: auto;
                display: block;
            }

            /* Smooth scrolling */
            html {
                scroll-behavior: smooth;
            }

            @media (prefers-reduced-motion: reduce) {
                html {
                    scroll-behavior: auto;
                }
            }

            /* Loading states */
            .loading {
                pointer-events: none;
                opacity: 0.6;
                cursor: wait;
            }

            /* Print styles */
            @media print {
                .navbar,
                .btn,
                .modal,
                .floating-decorations {
                    display: none !important;
                }
                
                .container {
                    max-width: 100% !important;
                }
                
                * {
                    background: white !important;
                    color: black !important;
                }
            }
        `;
        document.head.appendChild(enhancedStyle);

        // Enhanced scroll effect for navbar
        const handleScroll = () => {
            const navbar = document.querySelector('.navbar-custom');
            if (navbar) {
                if (window.scrollY > 100) {
                    navbar.style.background = 'rgba(0, 0, 0, 0.95)';
                    navbar.style.backdropFilter = 'blur(20px)';
                    navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
                } else {
                    navbar.style.background = 'rgba(0, 0, 0, 0.1)';
                    navbar.style.backdropFilter = 'blur(10px)';
                    navbar.style.boxShadow = 'none';
                }
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            document.head.removeChild(enhancedStyle);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <>
            {/* Header Navigation */}
            <nav className="navbar navbar-expand-lg navbar-custom fixed-top">
                <div className="container">
                    <a
                        href="#"
                        className="navbar-brand-custom"
                        onClick={(e) => {
                            e.preventDefault();
                            setActiveSection('home');
                            setShowApiDocs(false);
                        }}
                    >
                        <i className="fas fa-crown me-2"></i>
                        {Domain}
                    </a>

                    <button
                        className="navbar-toggler border-0"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                    >
                        <i className="fas fa-bars text-primary"></i>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarNav">
                        <div className="navbar-nav ms-auto d-flex align-items-center gap-2">
                            <button
                                className={`nav-btn ${activeSection === 'home' ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveSection('home');
                                    setShowApiDocs(false);
                                }}
                            >
                                <i className="fas fa-home"></i>
                                Trang chủ
                            </button>

                            <button
                                className={`nav-btn ${activeSection === 'api' ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveSection('api');
                                    setShowApiDocs(true);
                                }}
                            >
                                <i className="fas fa-code"></i>
                                API Docs
                            </button>

                            <div className="vr mx-2 d-none d-lg-block"></div>

                            <button
                                className="nav-btn nav-btn-outline"
                                onClick={() => openAuthModal('login')}
                            >
                                <i className="fas fa-sign-in-alt"></i>
                                Đăng nhập
                            </button>

                            <button
                                className="nav-btn nav-btn-primary"
                                onClick={() => openAuthModal('register')}
                            >
                                <i className="fas fa-user-plus"></i>
                                Đăng ký
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div style={{ paddingTop: '80px' }}>
                {/* Home Section */}
                <div className={`section-container ${activeSection === 'home' ? 'section-visible' : 'section-hidden'}`}>
                    {/* Hero Section */}
                    <section className="hero-section bg-primary text-white position-relative" style={{
                        minHeight: '70vh',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        overflow: 'hidden'
                    }}>
                        <div className="hero-particles"></div>
                        <div className="container position-relative py-3 py-md-5" style={{ zIndex: 2 }}>
                            <div className="row align-items-center" style={{ minHeight: '60vh' }}>
                                <div className="col-lg-6 fade-in-left">
                                    <div className="badge bg-light text-primary px-3 py-2 rounded-pill mb-3 d-inline-block shadow-sm">
                                        <i className="fas fa-crown me-2"></i>
                                        #1 SMM Panel Vietnam
                                    </div>
                                    <h1 className="display-5 fw-bold mb-3 lh-sm">
                                        Tăng Hiệu Quả
                                        <span className="text-light d-block">Social Media</span>
                                        <span className="text-light">Với SMM Panel Hàng Đầu</span>
                                    </h1>
                                    <p className="lead mb-4 opacity-90 fs-6">
                                        Dịch vụ tăng follower, like, view, comment chất lượng cao cho Facebook, Instagram, TikTok, YouTube và nhiều nền tảng khác.
                                    </p>
                                    <div className="d-flex gap-2 gap-md-3 flex-wrap mb-4">
                                        <button
                                            onClick={() => openAuthModal('register')}
                                            className="btn btn-warning btn-lg px-4 px-md-5 py-3 rounded-pill fw-bold text-dark shadow-lg"
                                            style={{
                                                background: 'linear-gradient(135deg, #ffd700 0%, #ffed4a 100%)',
                                                border: 'none',
                                                transform: 'translateY(0)',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 8px 25px rgba(255, 215, 0, 0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                                            }}
                                        >
                                            <i className="fas fa-rocket me-2"></i>
                                            <span className="d-none d-md-inline">Bắt Đầu Ngay</span>
                                            <span className="d-md-none">Bắt Đầu</span>
                                        </button>
                                        {/* <Link to="/bang-gia" className="btn btn-outline-light btn-lg px-3 px-md-4 py-3 rounded-pill glass-effect">
                                    <i className="fas fa-list me-2"></i>
                                    <span className="d-none d-md-inline">Xem Bảng Giá</span>
                                    <span className="d-md-none">Bảng Giá</span>
                                </Link> */}
                                        <button
                                            onClick={() => setActiveSection('api')}
                                            className="btn btn-outline-light btn-lg px-3 px-md-4 py-3 rounded-pill glass-effect"
                                        >
                                            <i className="fas fa-code me-2"></i>
                                            <span className="d-none d-md-inline">API Docs</span>
                                            <span className="d-md-none">API</span>
                                        </button>
                                    </div>
                                    <div className="d-flex align-items-center gap-2 gap-md-3 flex-wrap">
                                        <div className="d-flex align-items-center badge bg-light bg-opacity-10 px-2 px-md-3 py-2 rounded-pill">
                                            <i className="fas fa-check-circle text-success me-2"></i>
                                            <span className="small">Miễn phí đăng ký</span>
                                        </div>
                                        <div className="d-flex align-items-center badge bg-light bg-opacity-10 px-2 px-md-3 py-2 rounded-pill">
                                            <i className="fas fa-shield-alt text-info me-2"></i>
                                            <span className="small">Bảo mật cao</span>
                                        </div>
                                        <div className="d-flex align-items-center badge bg-light bg-opacity-10 px-2 px-md-3 py-2 rounded-pill">
                                            <i className="fas fa-bolt text-warning me-2"></i>
                                            <span className="small">Hoàn thành nhanh</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6 text-center fade-in-right mt-4 mt-lg-0">
                                    <div className="position-relative">
                                        <div className="card border-0 shadow-lg rounded-4 overflow-hidden auth-form-card" style={{ maxWidth: '400px', margin: '0 auto' }}>
                                            <div className="card-header bg-gradient text-white p-3 btn-gradient">
                                                <div className="d-flex justify-content-center">
                                                    <div className="w-100 d-flex" style={{ gap: '2px' }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setAuthMode('login');
                                                                resetForm();
                                                            }}
                                                            style={{
                                                                flex: '1',
                                                                backgroundColor: authMode === 'login' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255,255,255,0.15)',
                                                                background: authMode === 'login' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255,255,255,0.15)',
                                                                color: authMode === 'login' ? 'white' : 'black',
                                                                border: authMode === 'login' ? '2px solid rgba(102, 126, 234, 0.8)' : '2px solid rgba(255,255,255,0.3)',
                                                                borderRadius: '8px 0 0 8px',
                                                                padding: '12px 16px',
                                                                fontWeight: authMode === 'login' ? '600' : '500',
                                                                fontSize: '14px',
                                                                transition: 'all 0.3s ease',
                                                                cursor: 'pointer',
                                                                outline: 'none',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                textShadow: authMode === 'login' ? '0 1px 2px rgba(0,0,0,0.2)' : '1px 1px 2px rgba(0,0,0,0.3)',
                                                                boxShadow: authMode === 'login' ? '0 4px 15px rgba(102, 126, 234, 0.4)' : 'none'
                                                            }}
                                                        >
                                                            <i className="fas fa-sign-in-alt me-2"></i>
                                                            Đăng nhập
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setAuthMode('register');
                                                                resetForm();
                                                            }}
                                                            style={{
                                                                flex: '1',
                                                                backgroundColor: authMode === 'register' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255,255,255,0.15)',
                                                                background: authMode === 'register' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255,255,255,0.15)',
                                                                color: authMode === 'register' ? 'white' : 'black',
                                                                border: authMode === 'register' ? '2px solid rgba(102, 126, 234, 0.8)' : '2px solid rgba(255,255,255,0.3)',
                                                                borderRadius: '0 8px 8px 0',
                                                                padding: '12px 16px',
                                                                fontWeight: authMode === 'register' ? '600' : '500',
                                                                fontSize: '14px',
                                                                transition: 'all 0.3s ease',
                                                                cursor: 'pointer',
                                                                outline: 'none',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                textShadow: authMode === 'register' ? '0 1px 2px rgba(0,0,0,0.2)' : '1px 1px 2px rgba(0,0,0,0.3)',
                                                                boxShadow: authMode === 'register' ? '0 4px 15px rgba(245, 87, 108, 0.4)' : 'none'
                                                            }}
                                                        >
                                                            <i className="fas fa-user-plus me-2"></i>
                                                            Đăng ký
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="card-body p-4">
                                                {(error || success) && (
                                                    <div
                                                        className={`alert ${error ? 'alert-danger' : 'alert-success'} alert-dismissible fade show position-relative`}
                                                        style={{ paddingRight: '3rem' }}
                                                    >
                                                        {error || success}
                                                        <button
                                                            type="button"
                                                            className="btn-close position-absolute"
                                                            style={{
                                                                top: '50%',
                                                                right: '0px',
                                                                transform: 'translateY(-50%)',
                                                                zIndex: 1,
                                                                width: '1rem',
                                                                height: '1rem'
                                                            }}
                                                            onClick={() => {
                                                                setError('');
                                                                setSuccess('');
                                                            }}
                                                        ></button>
                                                    </div>
                                                )}

                                                {authMode === 'login' && (
                                                    <>
                                                        {!otpStep ? (
                                                            <form onSubmit={handleLogin}>
                                                                <div className="mb-3">
                                                                    <label className="form-label fw-semibold">
                                                                        <i className="fas fa-user me-2 text-primary"></i>
                                                                        Tên tài khoản
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        name="username"
                                                                        className="form-control auth-form-control"
                                                                        value={formData.username}
                                                                        onChange={handleInputChange}
                                                                        placeholder="Nhập tên tài khoản"
                                                                        required
                                                                        autoComplete="username"
                                                                    />
                                                                </div>
                                                                <div className="mb-4">
                                                                    <label className="form-label fw-semibold">
                                                                        <i className="fas fa-lock me-2 text-primary"></i>
                                                                        Mật khẩu
                                                                    </label>
                                                                    <input
                                                                        type="password"
                                                                        name="password"
                                                                        className="form-control auth-form-control"
                                                                        value={formData.password}
                                                                        onChange={handleInputChange}
                                                                        placeholder="Nhập mật khẩu"
                                                                        required
                                                                        autoComplete="current-password"
                                                                    />
                                                                </div>
                                                                <button
                                                                    type="submit"
                                                                    className="btn auth-btn-primary w-100 text-white mb-3"
                                                                    disabled={loading}
                                                                >
                                                                    {loading ? (
                                                                        <>
                                                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                                                            Đang xử lý...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <i className="fas fa-sign-in-alt me-2"></i>
                                                                            Đăng nhập
                                                                        </>
                                                                    )}
                                                                </button>
                                                                <div className="text-center">
                                                                    <small className="text-muted">
                                                                        Chưa có tài khoản?{' '}
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-link p-0 text-decoration-none small"
                                                                            onClick={() => {
                                                                                setAuthMode('register');
                                                                                resetForm();
                                                                            }}
                                                                        >
                                                                            Đăng ký ngay
                                                                        </button>
                                                                    </small>
                                                                </div>
                                                            </form>
                                                        ) : (
                                                            <form onSubmit={handleLogin}>
                                                                <div className="text-center mb-4">
                                                                    <i className="fas fa-shield-alt fa-3x text-primary mb-3"></i>
                                                                    <h6>Xác thực 2FA</h6>
                                                                    <p className="text-muted small">Nhập mã 6 số từ ứng dụng xác thực</p>
                                                                </div>
                                                                <div className="mb-4">
                                                                    <input
                                                                        type="text"
                                                                        className="form-control auth-form-control text-center fs-5"
                                                                        value={otp}
                                                                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                                                        placeholder="000000"
                                                                        maxLength={6}
                                                                        required
                                                                        autoFocus
                                                                    />
                                                                    <small className="text-muted d-block text-center mt-1">Mã đổi mỗi 30 giây</small>
                                                                </div>
                                                                <div className="d-flex gap-2">
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-outline-secondary btn-sm"
                                                                        onClick={() => {
                                                                            setOtpStep(false);
                                                                            setOtp('');
                                                                            setError('');
                                                                            setSuccess('');
                                                                        }}
                                                                        disabled={loading}
                                                                    >
                                                                        Quay lại
                                                                    </button>
                                                                    <button
                                                                        type="submit"
                                                                        className="btn auth-btn-primary flex-grow-1 text-white btn-sm"
                                                                        disabled={loading || otp.length !== 6}
                                                                    >
                                                                        {loading ? 'Đang xác thực...' : 'Xác thực'}
                                                                    </button>
                                                                </div>
                                                            </form>
                                                        )}
                                                    </>
                                                )}

                                                {authMode === 'register' && (
                                                    <form onSubmit={handleRegister}>
                                                        <div className="mb-3">
                                                            <label className="form-label fw-semibold">
                                                                <i className="fas fa-user me-2 text-primary"></i>
                                                                Tên tài khoản
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="username"
                                                                className="form-control auth-form-control"
                                                                value={formData.username}
                                                                onChange={handleInputChange}
                                                                placeholder="Nhập tên tài khoản"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="mb-3">
                                                            <label className="form-label fw-semibold">
                                                                <i className="fas fa-lock me-2 text-primary"></i>
                                                                Mật khẩu
                                                            </label>
                                                            <input
                                                                type="password"
                                                                name="password"
                                                                className="form-control auth-form-control"
                                                                value={formData.password}
                                                                onChange={handleInputChange}
                                                                placeholder="Nhập mật khẩu"
                                                                required
                                                            />
                                                        </div>
                                                        {/* <div className="mb-4">
                                                    <label className="form-label fw-semibold">
                                                        <i className="fas fa-lock me-2 text-primary"></i>
                                                        Xác nhận mật khẩu
                                                    </label>
                                                    <input
                                                        type="password"
                                                        name="confirmPassword"
                                                        className="form-control auth-form-control"
                                                        value={formData.confirmPassword}
                                                        onChange={handleInputChange}
                                                        placeholder="Nhập lại mật khẩu"
                                                        required
                                                    />
                                                </div> */}
                                                        <div className="mb-3">
                                                            {siteKeyLoading ? (
                                                                <div className="d-flex justify-content-center">
                                                                    <div className="d-flex flex-column align-items-center py-3">
                                                                        <div className="spinner-border spinner-border-sm text-primary mb-2" role="status">
                                                                            <span className="visually-hidden">Loading...</span>
                                                                        </div>
                                                                        <small className="text-muted">Đang tải reCAPTCHA...</small>
                                                                    </div>
                                                                </div>
                                                            ) : siteKey ? (
                                                                <div className="d-flex justify-content-center position-relative" style={{ minHeight: '78px' }}>
                                                                    {!recaptchaReady && (
                                                                        <div
                                                                            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                                                                            style={{ zIndex: 10, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                                                                        >
                                                                            <div className="d-flex flex-column align-items-center">
                                                                                <div className="spinner-border spinner-border-sm text-primary mb-2" role="status">
                                                                                    <span className="visually-hidden">Loading...</span>
                                                                                </div>
                                                                                <small className="text-muted">Đang hiển thị reCAPTCHA...</small>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    <div style={{
                                                                        opacity: recaptchaReady ? 1 : 0,
                                                                        transition: 'opacity 0.4s ease-in-out',
                                                                        visibility: recaptchaReady ? 'visible' : 'hidden'
                                                                    }}>
                                                                        <ReCAPTCHA
                                                                            ref={recaptchaRef}
                                                                            sitekey={siteKey}
                                                                            onChange={(token) => setRecaptchaToken(token || '')}
                                                                            onExpired={() => setRecaptchaToken('')}
                                                                            asyncScriptOnLoad={() => {
                                                                                setTimeout(() => setRecaptchaReady(true), 100);
                                                                            }}
                                                                            hl="vi"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                        <button
                                                            type="submit"
                                                            className="btn auth-btn-primary w-100 text-white mb-3"
                                                            disabled={loading}
                                                        >
                                                            {loading ? (
                                                                <>
                                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                                    Đang xử lý...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="fas fa-user-plus me-2"></i>
                                                                    Đăng ký
                                                                </>
                                                            )}
                                                        </button>
                                                        <div className="text-center">
                                                            <small className="text-muted">
                                                                Đã có tài khoản?{' '}
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-link p-0 text-decoration-none small"
                                                                    onClick={() => {
                                                                        setAuthMode('login');
                                                                        resetForm();
                                                                    }}
                                                                >
                                                                    Đăng nhập ngay
                                                                </button>
                                                            </small>
                                                        </div>
                                                    </form>
                                                )}
                                            </div>
                                        </div>

                                        {/* Floating Elements */}
                                        <div className="floating-decorations position-absolute d-none d-lg-block" style={{ top: '10%', right: '-8%', animation: 'float 3s ease-in-out infinite' }}>
                                            <div className="bg-light bg-opacity-20 rounded-circle p-3 backdrop-blur shadow-sm">
                                                <i className="fas fa-shield-alt text-success fa-lg"></i>
                                            </div>
                                        </div>
                                        <div className="floating-decorations position-absolute d-none d-lg-block" style={{ bottom: '20%', left: '-8%', animation: 'float 4s ease-in-out infinite reverse' }}>
                                            <div className="bg-light bg-opacity-20 rounded-circle p-3 backdrop-blur shadow-sm">
                                                <i className="fas fa-rocket text-primary fa-lg"></i>
                                            </div>
                                        </div>
                                        <div className="floating-decorations position-absolute d-none d-xl-block" style={{ top: '50%', right: '-12%', animation: 'float 5s ease-in-out infinite' }}>
                                            <div className="bg-gradient rounded-pill px-3 py-2 small fw-bold shadow-sm btn-gradient text-white">
                                                <i className="fas fa-users me-1"></i>
                                                50K+ Users
                                            </div>
                                        </div>
                                        <div className="floating-decorations position-absolute d-none d-xl-block" style={{ bottom: '10%', right: '-10%', animation: 'float 3.5s ease-in-out infinite reverse' }}>
                                            <div className="bg-warning text-dark px-3 py-2 rounded-pill small fw-bold shadow-sm">
                                                <i className="fas fa-star me-1"></i>
                                                4.9 Rating
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features Section */}
                    <section className="features-section py-5 bg-light position-relative">
                        <div className="container">
                            <div className="row text-center mb-5 animate-on-scroll">
                                <div className="col-12">
                                    <div className="badge bg-primary text-white px-3 py-2 rounded-pill mb-3 d-inline-block">
                                        <i className="fas fa-gem me-2"></i>
                                        Tính Năng Nổi Bật
                                    </div>
                                    <h2 className="display-5 fw-bold mb-3">Tại Sao Chọn Chúng Tôi?</h2>
                                    <p className="lead text-muted">Chúng tôi cung cấp dịch vụ SMM chất lượng cao với giá cả cạnh tranh</p>
                                </div>
                            </div>
                            <div className="row g-4">
                                <div className="col-lg-4 col-md-6 animate-on-scroll">
                                    <div className="card h-100 border-0 shadow-sm hover-lift" style={{ borderRadius: '20px' }}>
                                        <div className="card-body text-center p-4">
                                            <div className="feature-icon mb-3 position-relative">
                                                <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                                    <i className="fas fa-bolt fa-2x text-primary"></i>
                                                </div>
                                            </div>
                                            <h5 className="card-title fw-bold">Hoàn Thành Nhanh Chóng</h5>
                                            <p className="card-text text-muted">
                                                Đơn hàng được xử lý và hoàn thành trong vòng vài phút đến vài giờ
                                            </p>
                                            <div className="progress mt-3" style={{ height: '4px' }}>
                                                <div className="progress-bar bg-primary" style={{ width: '95%' }}></div>
                                            </div>
                                            <small className="text-muted">95% đơn hàng hoàn thành trong 1 giờ</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6 animate-on-scroll">
                                    <div className="card h-100 border-0 shadow-sm hover-lift" style={{ borderRadius: '20px' }}>
                                        <div className="card-body text-center p-4">
                                            <div className="feature-icon mb-3">
                                                <div className="bg-success bg-opacity-10 rounded-circle p-3 d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                                    <i className="fas fa-shield-alt fa-2x text-success"></i>
                                                </div>
                                            </div>
                                            <h5 className="card-title fw-bold">Chất Lượng Cao</h5>
                                            <p className="card-text text-muted">
                                                Tất cả dịch vụ đều có chất lượng cao, tài khoản thật, không drop
                                            </p>
                                            <div className="progress mt-3" style={{ height: '4px' }}>
                                                <div className="progress-bar bg-success" style={{ width: '98%' }}></div>
                                            </div>
                                            <small className="text-muted">98% tài khoản real không drop</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6 animate-on-scroll">
                                    <div className="card h-100 border-0 shadow-sm hover-lift" style={{ borderRadius: '20px' }}>
                                        <div className="card-body text-center p-4">
                                            <div className="feature-icon mb-3">
                                                <div className="bg-info bg-opacity-10 rounded-circle p-3 d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                                    <i className="fas fa-headset fa-2x text-info"></i>
                                                </div>
                                            </div>
                                            <h5 className="card-title fw-bold">Hỗ Trợ 24/7</h5>
                                            <p className="card-text text-muted">
                                                Đội ngũ hỗ trợ khách hàng chuyên nghiệp sẵn sàng phục vụ 24/7
                                            </p>
                                            <div className="d-flex justify-content-center gap-2 mt-3">
                                                <span className="badge bg-info">Facebook</span>
                                                <span className="badge bg-info">Telegram</span>
                                                <span className="badge bg-info">Zalo</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6 animate-on-scroll">
                                    <div className="card h-100 border-0 shadow-sm hover-lift" style={{ borderRadius: '20px' }}>
                                        <div className="card-body text-center p-4">
                                            <div className="feature-icon mb-3">
                                                <div className="bg-warning bg-opacity-10 rounded-circle p-3 d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                                    <i className="fas fa-dollar-sign fa-2x text-warning"></i>
                                                </div>
                                            </div>
                                            <h5 className="card-title fw-bold">Giá Cả Cạnh Tranh</h5>
                                            <p className="card-text text-muted">
                                                Giá thành rẻ nhất thị trường với chất lượng dịch vụ tốt nhất
                                            </p>
                                            <div className="text-center mt-3">
                                                <span className="h5 text-warning fw-bold">Tiết kiệm đến 60%</span>
                                                <br />
                                                <small className="text-muted">So với đối thủ</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6 animate-on-scroll">
                                    <div className="card h-100 border-0 shadow-sm hover-lift" style={{ borderRadius: '20px' }}>
                                        <div className="card-body text-center p-4">
                                            <div className="feature-icon mb-3">
                                                <div className="bg-danger bg-opacity-10 rounded-circle p-3 d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                                    <i className="fas fa-lock fa-2x text-danger"></i>
                                                </div>
                                            </div>
                                            <h5 className="card-title fw-bold">Bảo Mật An Toàn</h5>
                                            <p className="card-text text-muted">
                                                Thông tin khách hàng được bảo mật tuyệt đối, không lưu trữ mật khẩu
                                            </p>
                                            <div className="d-flex justify-content-center gap-2 mt-3">
                                                <i className="fas fa-shield-alt text-danger"></i>
                                                <span className="text-muted small">SSL 256-bit encryption</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6 animate-on-scroll">
                                    <div className="card h-100 border-0 shadow-sm hover-lift" style={{ borderRadius: '20px' }}>
                                        <div className="card-body text-center p-4">
                                            <div className="feature-icon mb-3">
                                                <div className="bg-secondary bg-opacity-10 rounded-circle p-3 d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                                    <i className="fas fa-redo fa-2x text-secondary"></i>
                                                </div>
                                            </div>
                                            <h5 className="card-title fw-bold">Bảo Hành Refill</h5>
                                            <p className="card-text text-muted">
                                                Cam kết bảo hành refill trong thời gian nhất định nếu số lượng bị giảm
                                            </p>
                                            <div className="text-center mt-3">
                                                <span className="badge bg-success">30 ngày bảo hành</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Services Section */}
                    <section className="services-section py-5" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
                        <div className="container">
                            <div className="row text-center mb-5 animate-on-scroll">
                                <div className="col-12">
                                    <div className="badge bg-gradient text-white px-3 py-2 rounded-pill mb-3 d-inline-block btn-gradient">
                                        <i className="fas fa-star me-2"></i>
                                        Dịch Vụ Phổ Biến
                                    </div>
                                    <h2 className="display-5 fw-bold mb-3">Dịch Vụ Của Chúng Tôi</h2>
                                    <p className="lead text-muted">Cung cấp dịch vụ SMM cho tất cả các nền tảng mạng xã hội phổ biến</p>
                                </div>
                            </div>
                            <div className="row g-4">
                                <div className="col-lg-3 col-md-6 animate-on-scroll">
                                    <div className="card border-0 shadow-sm h-100 hover-lift position-relative overflow-hidden" style={{ borderRadius: '20px' }}>
                                        <div className="position-absolute top-0 end-0 bg-primary text-white px-2 py-1 rounded-bottom-start">
                                            <small>Hot</small>
                                        </div>
                                        <div className="card-body text-center p-4">
                                            <div className="mb-4">
                                                <img src="/img/facebook.gif" alt="Facebook" className="floating rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }} />
                                            </div>
                                            <h5 className="card-title fw-bold">Facebook</h5>
                                            <p className="card-text text-muted mb-3">Like, Follow, Comment, Share, View Video</p>
                                            <div className="d-flex justify-content-center gap-1 mb-3">
                                                <span className="badge bg-primary bg-opacity-10 text-primary">Like</span>
                                                <span className="badge bg-primary bg-opacity-10 text-primary">Follow</span>
                                                <span className="badge bg-primary bg-opacity-10 text-primary">Share</span>
                                            </div>
                                            <div className="text-center">
                                                <small className="text-success fw-bold">
                                                    <i className="fas fa-check-circle me-1"></i>
                                                    100+ Dịch vụ
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-6 animate-on-scroll">
                                    <div className="card border-0 shadow-sm h-100 hover-lift position-relative overflow-hidden" style={{ borderRadius: '20px' }}>
                                        <div className="position-absolute top-0 end-0 bg-success text-white px-2 py-1 rounded-bottom-start">
                                            <small>New</small>
                                        </div>
                                        <div className="card-body text-center p-4">
                                            <div className="mb-4">
                                                <img src="/img/instagram.gif" alt="Instagram" className="floating rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', animationDelay: '0.5s' }} />
                                            </div>
                                            <h5 className="card-title fw-bold">Instagram</h5>
                                            <p className="card-text text-muted mb-3">Follower, Like, Comment, View, Story</p>
                                            <div className="d-flex justify-content-center gap-1 mb-3">
                                                <span className="badge bg-danger bg-opacity-10 text-danger">Follower</span>
                                                <span className="badge bg-danger bg-opacity-10 text-danger">Like</span>
                                                <span className="badge bg-danger bg-opacity-10 text-danger">View</span>
                                            </div>
                                            <div className="text-center">
                                                <small className="text-success fw-bold">
                                                    <i className="fas fa-check-circle me-1"></i>
                                                    80+ Dịch vụ
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-6 animate-on-scroll">
                                    <div className="card border-0 shadow-sm h-100 hover-lift position-relative overflow-hidden" style={{ borderRadius: '20px' }}>
                                        <div className="position-absolute top-0 end-0 bg-warning text-dark px-2 py-1 rounded-bottom-start">
                                            <small>Trend</small>
                                        </div>
                                        <div className="card-body text-center p-4">
                                            <div className="mb-4">
                                                <img src="/img/tiktok.gif" alt="TikTok" className="floating rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', animationDelay: '1s' }} />
                                            </div>
                                            <h5 className="card-title fw-bold">TikTok</h5>
                                            <p className="card-text text-muted mb-3">Follower, Like, View, Comment, Share</p>
                                            <div className="d-flex justify-content-center gap-1 mb-3">
                                                <span className="badge bg-dark bg-opacity-10 text-dark">Follower</span>
                                                <span className="badge bg-dark bg-opacity-10 text-dark">Like</span>
                                                <span className="badge bg-dark bg-opacity-10 text-dark">View</span>
                                            </div>
                                            <div className="text-center">
                                                <small className="text-success fw-bold">
                                                    <i className="fas fa-check-circle me-1"></i>
                                                    60+ Dịch vụ
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-6 animate-on-scroll">
                                    <div className="card border-0 shadow-sm h-100 hover-lift position-relative overflow-hidden" style={{ borderRadius: '20px' }}>
                                        <div className="position-absolute top-0 end-0 bg-info text-white px-2 py-1 rounded-bottom-start">
                                            <small>Pro</small>
                                        </div>
                                        <div className="card-body text-center p-4">
                                            <div className="mb-4">
                                                <img src="/img/youtube.gif" alt="YouTube" className="floating rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', animationDelay: '1s' }} />
                                            </div>
                                            <h5 className="card-title fw-bold">YouTube</h5>
                                            <p className="card-text text-muted mb-3">Subscribe, Like, View, Comment</p>
                                            <div className="d-flex justify-content-center gap-1 mb-3">
                                                <span className="badge bg-danger bg-opacity-10 text-danger">Subscribe</span>
                                                <span className="badge bg-danger bg-opacity-10 text-danger">Like</span>
                                                <span className="badge bg-danger bg-opacity-10 text-danger">View</span>
                                            </div>
                                            <div className="text-center">
                                                <small className="text-success fw-bold">
                                                    <i className="fas fa-check-circle me-1"></i>
                                                    50+ Dịch vụ
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Stats Section */}
                    <section className="stats-section py-5 position-relative overflow-hidden" style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}>
                        <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10">
                            <div className="position-absolute" style={{ top: '10%', left: '10%', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', animation: 'float 4s ease-in-out infinite' }}></div>
                            <div className="position-absolute" style={{ top: '60%', right: '15%', width: '150px', height: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', animation: 'float 6s ease-in-out infinite reverse' }}></div>
                            <div className="position-absolute" style={{ bottom: '20%', left: '20%', width: '80px', height: '80px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%', animation: 'float 5s ease-in-out infinite' }}></div>
                        </div>
                        <div className="container position-relative">
                            <div className="row text-center text-white">
                                <div className="col-lg-3 col-md-6 mb-4 animate-on-scroll">
                                    <div className="stat-item glass-effect rounded-4 p-4 h-100">
                                        <div className="mb-3">
                                            <i className="fas fa-users fa-3x mb-3 opacity-75"></i>
                                        </div>
                                        <h2 className="display-4 fw-bold stats-counter mb-2 text-white">50K+</h2>
                                        <p className="lead mb-0">Khách Hàng Hài Lòng</p>
                                        <div className="progress mt-3" style={{ height: '3px' }}>
                                            <div className="progress-bar bg-light" style={{ width: '88%' }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-6 mb-4 animate-on-scroll">
                                    <div className="stat-item glass-effect rounded-4 p-4 h-100">
                                        <div className="mb-3">
                                            <i className="fas fa-shopping-cart fa-3x mb-3 opacity-75"></i>
                                        </div>
                                        <h2 className="display-4 fw-bold stats-counter mb-2 text-white">1M+</h2>
                                        <p className="lead mb-0">Đơn Hàng Hoàn Thành</p>
                                        <div className="progress mt-3" style={{ height: '3px' }}>
                                            <div className="progress-bar bg-light" style={{ width: '95%' }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-6 mb-4 animate-on-scroll">
                                    <div className="stat-item glass-effect rounded-4 p-4 h-100">
                                        <div className="mb-3">
                                            <i className="fas fa-cogs fa-3x mb-3 opacity-75"></i>
                                        </div>
                                        <h2 className="display-4 fw-bold stats-counter mb-2 text-white">100+</h2>
                                        <p className="lead mb-0">Dịch Vụ Đa Dạng</p>
                                        <div className="progress mt-3" style={{ height: '3px' }}>
                                            <div className="progress-bar bg-light" style={{ width: '100%' }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-6 mb-4 animate-on-scroll">
                                    <div className="stat-item glass-effect rounded-4 p-4 h-100">
                                        <div className="mb-3">
                                            <i className="fas fa-clock fa-3x mb-3 opacity-75"></i>
                                        </div>
                                        <h2 className="display-4 fw-bold stats-counter mb-2 text-white">24/7</h2>
                                        <p className="lead mb-0">Hỗ Trợ Khách Hàng</p>
                                        <div className="d-flex justify-content-center mt-3">
                                            <span className="badge bg-light text-dark">Online</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* How It Works Section */}
                    <section className="how-it-works-section py-5 bg-light position-relative">
                        <div className="container">
                            <div className="row text-center mb-5 animate-on-scroll">
                                <div className="col-12">
                                    <div className="badge bg-gradient text-white px-3 py-2 rounded-pill mb-3 d-inline-block btn-gradient">
                                        <i className="fas fa-lightbulb me-2"></i>
                                        Quy Trình Đơn Giản
                                    </div>
                                    <h2 className="display-5 fw-bold mb-3">Cách Thức Hoạt Động</h2>
                                    <p className="lead text-muted">Chỉ với 4 bước đơn giản, bạn có thể tăng tương tác cho tài khoản của mình</p>
                                </div>
                            </div>
                            <div className="row g-4 position-relative">
                                {/* Connection Lines */}
                                {/* <div className="position-absolute top-50 start-0 w-100 d-none d-lg-block" style={{ height: '2px', background: 'linear-gradient(90deg, transparent 8%, #667eea 25%, #764ba2 75%, transparent 92%)', zIndex: 1 }}></div> */}

                                <div className="col-lg-3 col-md-6 animate-on-scroll">
                                    <div className="text-center position-relative" style={{ zIndex: 2 }}>
                                        <div className="step-icon mb-4 position-relative">
                                            <div className="rounded-circle text-white d-flex align-items-center justify-content-center mx-auto shadow-lg position-relative" style={{
                                                width: '100px',
                                                height: '100px',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                border: '4px solid white'
                                            }}>
                                                <span className="h2 mb-0 fw-bold">1</span>
                                                <div className="position-absolute top-0 start-0 w-100 h-100 rounded-circle animate-ping" style={{ background: 'rgba(102, 126, 234, 0.3)', animationDuration: '2s' }}></div>
                                            </div>
                                        </div>
                                        <div className="bg-white p-4 rounded-4 shadow-sm hover-lift">
                                            <i className="fas fa-user-plus text-primary fa-2x mb-3"></i>
                                            <h5 className="fw-bold mb-3">Đăng Ký Tài Khoản</h5>
                                            <p className="text-muted mb-0">Tạo tài khoản miễn phí chỉ trong vài giây với email của bạn</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-6 animate-on-scroll">
                                    <div className="text-center position-relative" style={{ zIndex: 2 }}>
                                        <div className="step-icon mb-4">
                                            <div className="rounded-circle text-white d-flex align-items-center justify-content-center mx-auto shadow-lg" style={{
                                                width: '100px',
                                                height: '100px',
                                                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                                border: '4px solid white'
                                            }}>
                                                <span className="h2 mb-0 fw-bold">2</span>
                                            </div>
                                        </div>
                                        <div className="bg-white p-4 rounded-4 shadow-sm hover-lift">
                                            <i className="fas fa-credit-card text-success fa-2x mb-3"></i>
                                            <h5 className="fw-bold mb-3">Nạp Tiền</h5>
                                            <p className="text-muted mb-0">Nạp tiền vào tài khoản qua nhiều phương thức thanh toán an toàn</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-6 animate-on-scroll">
                                    <div className="text-center position-relative" style={{ zIndex: 2 }}>
                                        <div className="step-icon mb-4">
                                            <div className="rounded-circle text-white d-flex align-items-center justify-content-center mx-auto shadow-lg" style={{
                                                width: '100px',
                                                height: '100px',
                                                background: 'linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%)',
                                                border: '4px solid white'
                                            }}>
                                                <span className="h2 mb-0 fw-bold">3</span>
                                            </div>
                                        </div>
                                        <div className="bg-white p-4 rounded-4 shadow-sm hover-lift">
                                            <i className="fas fa-shopping-bag text-info fa-2x mb-3"></i>
                                            <h5 className="fw-bold mb-3">Chọn Dịch Vụ</h5>
                                            <p className="text-muted mb-0">Lựa chọn dịch vụ phù hợp với nhu cầu và ngân sách của bạn</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-6 animate-on-scroll">
                                    <div className="text-center position-relative" style={{ zIndex: 2 }}>
                                        <div className="step-icon mb-4">
                                            <div className="rounded-circle text-white d-flex align-items-center justify-content-center mx-auto shadow-lg" style={{
                                                width: '100px',
                                                height: '100px',
                                                background: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)',
                                                border: '4px solid white'
                                            }}>
                                                <span className="h2 mb-0 fw-bold">4</span>
                                            </div>
                                        </div>
                                        <div className="bg-white p-4 rounded-4 shadow-sm hover-lift">
                                            <i className="fas fa-chart-line text-warning fa-2x mb-3"></i>
                                            <h5 className="fw-bold mb-3">Nhận Kết Quả</h5>
                                            <p className="text-muted mb-0">Theo dõi đơn hàng và nhận kết quả chất lượng cao</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="cta-section py-5 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <div className="position-absolute top-0 start-0 w-100 h-100">
                            <div className="position-absolute animate-ping" style={{ top: '20%', left: '10%', width: '20px', height: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', animationDuration: '3s' }}></div>
                            <div className="position-absolute animate-ping" style={{ top: '60%', right: '20%', width: '15px', height: '15px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%', animationDuration: '4s' }}></div>
                            <div className="position-absolute animate-ping" style={{ bottom: '30%', left: '30%', width: '25px', height: '25px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', animationDuration: '5s' }}></div>
                        </div>
                        <div className="container position-relative">
                            <div className="row text-center text-white animate-on-scroll">
                                <div className="col-12">
                                    <div className="mb-4">
                                        <i className="fas fa-rocket fa-4x mb-4 floating opacity-75"></i>
                                    </div>
                                    <h2 className="display-5 fw-bold mb-4">Sẵn Sàng Tăng Tương Tác?</h2>
                                    <p className="lead mb-5 opacity-90">
                                        Hãy bắt đầu ngay hôm nay và trải nghiệm dịch vụ SMM Panel tốt nhất! <br />
                                        Tham gia cùng hàng nghìn khách hàng đã tin tưởng chúng tôi.
                                    </p>
                                    <div className="d-flex gap-3 justify-content-center flex-wrap mb-4">
                                        <button
                                            onClick={() => openAuthModal('register')}
                                            className="btn btn-light btn-lg px-5 py-3 rounded-pill shadow-lg hover-lift"
                                        >
                                            <i className="fas fa-user-plus me-2"></i>
                                            Đăng Ký Miễn Phí
                                        </button>
                                        <button
                                            onClick={() => openAuthModal('login')}
                                            className="btn btn-outline-light btn-lg px-5 py-3 rounded-pill glass-effect hover-lift"
                                        >
                                            <i className="fas fa-sign-in-alt me-2"></i>
                                            Đăng Nhập
                                        </button>
                                    </div>
                                    <div className="row mt-5">
                                        <div className="col-md-4 mb-3">
                                            <div className="glass-effect rounded-3 p-3">
                                                <i className="fas fa-gift fa-2x mb-2"></i>
                                                <h6 className="fw-bold">Bonus 10%</h6>
                                                <small>Cho khách hàng mới</small>
                                            </div>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <div className="glass-effect rounded-3 p-3">
                                                <i className="fas fa-handshake fa-2x mb-2"></i>
                                                <h6 className="fw-bold">Hỗ trợ tận tình</h6>
                                                <small>Đội ngũ chuyên nghiệp</small>
                                            </div>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <div className="glass-effect rounded-3 p-3">
                                                <i className="fas fa-medal fa-2x mb-2"></i>
                                                <h6 className="fw-bold">Chất lượng #1</h6>
                                                <small>Dịch vụ tốt nhất VN</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div> {/* End Home Section */}

                {/* API Documentation Section */}
                <div className={`section-container ${activeSection === 'api' ? 'section-visible' : 'section-hidden'}`}>
                    <section className="api-docs-section py-5" style={{
                        minHeight: '100vh',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Animated Background Elements */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `
                                radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.4) 0%, transparent 60%),
                                radial-gradient(circle at 80% 20%, rgba(240, 147, 251, 0.3) 0%, transparent 60%),
                                radial-gradient(circle at 40% 40%, rgba(118, 75, 162, 0.3) 0%, transparent 60%),
                                radial-gradient(circle at 60% 60%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
                            `,
                            animation: 'floatAPI 8s ease-in-out infinite'
                        }}></div>

                        {/* Floating Particles */}
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    position: 'absolute',
                                    width: '4px',
                                    height: '4px',
                                    background: 'rgba(255, 255, 255, 0.6)',
                                    borderRadius: '50%',
                                    left: `${20 + i * 15}%`,
                                    top: `${30 + i * 10}%`,
                                    animation: `floatAPI ${4 + i}s ease-in-out infinite`,
                                    animationDelay: `${i * 0.5}s`
                                }}
                            />
                        ))}

                        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                            <div className="row text-center mb-5 animate-on-scroll">
                                <div className="col-12">
                                    <div className="badge text-white px-4 py-3 rounded-pill mb-4 d-inline-block" style={{
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        animation: 'pulse 2s ease-in-out infinite',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'scale(1.1)';
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                                            e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.5)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}>
                                        <i className="fas fa-code me-2"></i>
                                        API Documentation
                                    </div>
                                    <h2 className="display-4 fw-bold mb-3 text-white" style={{
                                        // animation: 'slideInUp 1s ease-out',
                                        // background: 'linear-gradient(45deg, #ffffff 0%, #f0f8ff 50%, #ffffff 100%)',
                                        // backgroundSize: '200% 100%',
                                        // WebkitBackgroundClip: 'text',
                                        // WebkitTextFillColor: 'transparent',
                                        // backgroundClip: 'text',
                                        // animation: 'shimmer 3s ease-in-out infinite, slideInUp 1s ease-out'
                                    }}>Tích Hợp API Dễ Dàng</h2>
                                    <p className="lead text-white opacity-90">Sử dụng API để tự động hóa việc đặt hàng và quản lý dịch vụ SMM</p>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-12">
                                    <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{
                                        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        animation: 'slideInUp 0.8s ease-out, glow 3s ease-in-out infinite',
                                        transition: 'all 0.3s ease',
                                        transform: 'translateZ(0)'
                                    }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.2)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                            e.currentTarget.style.boxShadow = '';
                                        }}>
                                        <div className="card-header bg-transparent border-0 py-4 px-4 px-md-5">
                                            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between">
                                                <div>
                                                    <h5 className="fw-bold mb-1 text-primary">
                                                        <i className="fas fa-server me-2"></i>
                                                        SMM Panel API v2
                                                    </h5>
                                                    <p className="mb-0 text-muted">RESTful API cho tự động hóa dịch vụ SMM</p>
                                                </div>
                                                <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold px-3 py-2 mt-3 mt-md-0">
                                                    <i className="fas fa-shield-alt me-2"></i>
                                                    Secure
                                                </span>
                                            </div>
                                        </div>
                                        <div className="card-body px-4 px-md-5 pb-5">
                                            <div className="mb-5">
                                                <h5 className="fw-bold mb-3">API Overview</h5>
                                                <div className="table-responsive">
                                                    <Table striped bordered className="align-middle mb-0" style={{
                                                        background: 'linear-gradient(45deg, #f8f9fa 0%, #e9ecef 100%)'
                                                    }}>
                                                        <tbody style={{ '& tr': { transition: 'all 0.2s ease' } }}>
                                                            <tr
                                                                style={{ transition: 'all 0.2s ease' }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.background = 'linear-gradient(45deg, #e3f2fd 0%, #bbdefb 100%)';
                                                                    e.currentTarget.style.transform = 'scale(1.02)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.background = '';
                                                                    e.currentTarget.style.transform = 'scale(1)';
                                                                }}
                                                            >
                                                                <td className="fw-semibold text-muted">API URL</td>
                                                                <td className="fw-bold text-break">{process.env.REACT_APP_API_BASE ? `${process.env.REACT_APP_API_BASE}/api/v2` : `${API_DOMAIN}/api/v2`}</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="fw-semibold text-muted">API Key</td>
                                                                <td className="fw-bold">
                                                                    <button type="button" className="btn btn-primary btn-sm rounded-pill px-4" onClick={() => openAuthModal('login')}>
                                                                        <i className="fas fa-key me-2"></i>
                                                                        Lấy tại đây
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td className="fw-semibold text-muted">HTTP Method</td>
                                                                <td className="fw-bold">POST</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="fw-semibold text-muted">Content-Type</td>
                                                                <td className="fw-bold">application/json</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="fw-semibold text-muted">Response</td>
                                                                <td className="fw-bold">JSON</td>
                                                            </tr>
                                                        </tbody>
                                                    </Table>
                                                </div>
                                            </div>

                                            <div className="d-flex flex-column flex-md-row">
                                                <ul className="nav nav-pills border-0 flex-row flex-md-column me-md-4 mb-3 mb-md-0 gap-2" role="tablist" style={{
                                                    background: 'linear-gradient(145deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                                    backdropFilter: 'blur(10px)',
                                                    borderRadius: '12px',
                                                    padding: '8px'
                                                }}>
                                                    {[
                                                        { id: "services", label: "Services" },
                                                        { id: "add", label: "Add order" },
                                                        { id: "status", label: "Order status" },
                                                        { id: "multistatus", label: "Multiple orders status" },
                                                        { id: "cancel", label: "Create Cancel" },
                                                        { id: "refill", label: "Create Refill" },
                                                        { id: "balance", label: "Balance" },
                                                    ].map((tab, index) => (
                                                        <li className="nav-item" role="presentation" key={index}>
                                                            <button
                                                                type="button"
                                                                className={`nav-link ${activeApiTab === tab.id ? 'active' : ''}`}
                                                                onClick={() => setActiveApiTab(tab.id)}
                                                                role="tab"
                                                                style={{
                                                                    background: activeApiTab === tab.id
                                                                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                                        : 'rgba(255, 255, 255, 0.1)',
                                                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                                                    color: activeApiTab === tab.id ? 'white' : '#667eea',
                                                                    fontWeight: '600',
                                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                    backdropFilter: 'blur(10px)',
                                                                    transform: 'translateZ(0)',
                                                                    position: 'relative',
                                                                    overflow: 'hidden'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    if (activeApiTab !== tab.id) {
                                                                        e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0.2, #764ba2 0.8)';
                                                                        e.currentTarget.style.color = 'white';
                                                                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                                                                        e.currentTarget.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.4)';
                                                                    }
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    if (activeApiTab !== tab.id) {
                                                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                                                        e.currentTarget.style.color = '#667eea';
                                                                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                                                        e.currentTarget.style.boxShadow = 'none';
                                                                    }
                                                                }}
                                                            >
                                                                {tab.label}
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>

                                                <div className="tab-content w-100">
                                                    {[
                                                        {
                                                            id: "services",
                                                            content: (
                                                                <>
                                                                    <Table responsive striped bordered className="align-middle mb-3" style={{
                                                                        background: 'linear-gradient(45deg, #f8f9fa 0%, #e3f2fd 100%)',
                                                                        borderRadius: '8px',
                                                                        overflow: 'hidden'
                                                                    }}>
                                                                        <thead style={{
                                                                            background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                                                                            color: 'white',
                                                                            position: 'relative',
                                                                            overflow: 'hidden'
                                                                        }}
                                                                            onMouseEnter={(e) => {
                                                                                e.currentTarget.style.background = 'linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%)';
                                                                            }}
                                                                            onMouseLeave={(e) => {
                                                                                e.currentTarget.style.background = 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)';
                                                                            }}>
                                                                            <tr>
                                                                                <th className="fw-semibold">Parameters</th>
                                                                                <th className="fw-semibold">Description</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            <tr>
                                                                                <td className="fw-semibold" style={{ color: '#2196f3' }}>key</td>
                                                                                <td>API Key</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="fw-semibold" style={{ color: '#2196f3' }}>action</td>
                                                                                <td>"services"</td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </Table>
                                                                    <h6 className="fw-bold" style={{ color: '#2196f3' }}>Example response</h6>
                                                                    <div className="rounded-3 p-3" style={{
                                                                        background: 'linear-gradient(135deg, #f1f8e9 0%, #e8f5e8 100%)',
                                                                        border: '1px solid #4caf50',
                                                                        borderRadius: '12px'
                                                                    }}>
                                                                        <pre className="mb-0 small" style={{ whiteSpace: 'pre-wrap' }}>{`[
    {
        "service": 1,
        "name": "Sv5 ( Sub Việt ) ( Tài nguyên clone + via )",
        "type": "Default",
        "platform": "Facebook",
        "category": "Follow Facebook",
        "rate": "0.90",
        "min": "50",
        "max": "10000",
        "refill": true,
        "cancel": true
    },
    {
        "service": 2,
        "name": "Sv2 ( CMT TIKTOK VN )",
        "type": "Custom Comments",
        "platform": "Tiktok",
        "category": "Comments Tiktok",
        "rate": "8",
        "min": "10",
        "max": "1500",
        "refill": false,
        "cancel": true
    }
]`}</pre>
                                                                    </div>
                                                                </>
                                                            ),
                                                        },
                                                        {
                                                            id: "add",
                                                            content: (
                                                                <>
                                                                    <Table responsive striped bordered className="align-middle mb-3" style={{
                                                                        background: 'linear-gradient(45deg, #f8f9fa 0%, #fff3e0 100%)',
                                                                        borderRadius: '8px',
                                                                        overflow: 'hidden'
                                                                    }}>
                                                                        <thead style={{
                                                                            background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                                                                            color: 'white'
                                                                        }}>
                                                                            <tr>
                                                                                <th className="fw-semibold">Parameters</th>
                                                                                <th className="fw-semibold">Description</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            <tr>
                                                                                <td className="fw-semibold" style={{ color: '#ff9800' }}>key</td>
                                                                                <td>API Key</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="fw-semibold" style={{ color: '#ff9800' }}>action</td>
                                                                                <td>"add"</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="fw-semibold" style={{ color: '#ff9800' }}>service</td>
                                                                                <td>Service ID</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="fw-semibold" style={{ color: '#ff9800' }}>link</td>
                                                                                <td>Link</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="fw-semibold" style={{ color: '#ff9800' }}>quantity</td>
                                                                                <td>Needed quantity</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="fw-semibold" style={{ color: '#ff9800' }}>comments</td>
                                                                                <td className="text-break">Comments (Only for Custom Comments service)</td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </Table>
                                                                    <h6 className="fw-bold" style={{ color: '#ff9800' }}>Example response</h6>
                                                                    <div className="rounded-3 p-3" style={{
                                                                        background: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)',
                                                                        border: '1px solid #ff9800',
                                                                        borderRadius: '12px'
                                                                    }}>
                                                                        <pre className="mb-0 small">{`{
  "order": 99999
}`}</pre>
                                                                    </div>
                                                                </>
                                                            ),
                                                        },
                                                        {
                                                            id: "status",
                                                            content: (
                                                                <>
                                                                    <Table responsive striped bordered className="align-middle mb-3" style={{
                                                                        background: 'linear-gradient(45deg, #f8f9fa 0%, #e8f5e8 100%)',
                                                                        borderRadius: '8px',
                                                                        overflow: 'hidden'
                                                                    }}>
                                                                        <thead style={{
                                                                            background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                                                                            color: 'white'
                                                                        }}>
                                                                            <tr>
                                                                                <th className="fw-semibold">Parameters</th>
                                                                                <th className="fw-semibold">Description</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            <tr>
                                                                                <td className="fw-semibold" style={{ color: '#4caf50' }}>key</td>
                                                                                <td>API Key</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="fw-semibold" style={{ color: '#4caf50' }}>action</td>
                                                                                <td>"status"</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="fw-semibold" style={{ color: '#4caf50' }}>order</td>
                                                                                <td>Order ID</td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </Table>
                                                                    <h6 className="fw-bold" style={{ color: '#4caf50' }}>Example response</h6>
                                                                    <div className="rounded-3 p-3" style={{
                                                                        background: 'linear-gradient(135deg, #f1f8e9 0%, #e8f5e8 100%)',
                                                                        border: '1px solid #4caf50',
                                                                        borderRadius: '12px'
                                                                    }}>
                                                                        <pre className="mb-0 small" style={{ whiteSpace: 'pre-wrap' }}>{`{
    "charge": "2.5",
    "start_count": "168",
    "status": "Completed",
    "remains": "-2",
    "currency": "USD"
}`}</pre>
                                                                    </div>
                                                                    <small className="d-block mt-3 text-muted">Status: Pending, Processing, In progress, Completed, Partial, Canceled</small>
                                                                </>
                                                            ),
                                                        },
                                                        {
                                                            id: "multistatus",
                                                            content: (
                                                                <>
                                                                    <Table responsive striped bordered className="align-middle mb-3" style={{
                                                                        background: 'linear-gradient(45deg, #f8f9fa 0%, #fce4ec 100%)',
                                                                        borderRadius: '8px',
                                                                        overflow: 'hidden'
                                                                    }}>
                                                                        <thead style={{
                                                                            background: 'linear-gradient(135deg, #e91e63 0%, #c2185b 100%)',
                                                                            color: 'white'
                                                                        }}>
                                                                            <tr>
                                                                                <th className="fw-semibold">Parameters</th>
                                                                                <th className="fw-semibold">Description</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            <tr>
                                                                                <td className="fw-semibold" style={{ color: '#e91e63' }}>key</td>
                                                                                <td>API Key</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="fw-semibold" style={{ color: '#e91e63' }}>action</td>
                                                                                <td>"status"</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="fw-semibold" style={{ color: '#e91e63' }}>orders</td>
                                                                                <td className="text-break">Order IDs separated by comma (E.g: 123,456,789) (Limit 100)</td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </Table>
                                                                    <h6 className="fw-bold" style={{ color: '#e91e63' }}>Example response</h6>
                                                                    <div className="rounded-3 p-3" style={{
                                                                        background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)',
                                                                        border: '1px solid #e91e63',
                                                                        borderRadius: '12px'
                                                                    }}>
                                                                        <pre className="mb-0 small" style={{ whiteSpace: 'pre-wrap' }}>{`{
    "123": {
        "charge": "0.27819",
        "start_count": "3572",
        "status": "Partial",
        "remains": "157",
        "currency": "USD"
    },
    "456": {
        "error": "Incorrect order ID"
    },
    "789": {
        "charge": "1.44219",
        "start_count": "234",
        "status": "In progress",
        "remains": "10",
        "currency": "USD"
    }
}`}</pre>
                                                                    </div>
                                                                </>
                                                            ),
                                                        },
                                                        {
                                                            id: "balance",
                                                            content: (
                                                                <>
                                                                    <Table responsive striped bordered className="align-middle mb-3" style={{
                                                                        background: 'linear-gradient(45deg, #f8f9fa 0%, #e1f5fe 100%)',
                                                                        borderRadius: '8px',
                                                                        overflow: 'hidden'
                                                                    }}>
                                                                        <thead style={{
                                                                            background: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)',
                                                                            color: 'white'
                                                                        }}>
                                                                            <tr>
                                                                                <th className="fw-semibold">Parameters</th>
                                                                                <th className="fw-semibold">Description</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            <tr>
                                                                                <td className="fw-semibold" style={{ color: '#00bcd4' }}>key</td>
                                                                                <td>API Key</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="fw-semibold" style={{ color: '#00bcd4' }}>action</td>
                                                                                <td>"balance"</td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </Table>
                                                                    <h6 className="fw-bold" style={{ color: '#00bcd4' }}>Example response</h6>
                                                                    <div className="rounded-3 p-3" style={{
                                                                        background: 'linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)',
                                                                        border: '1px solid #00bcd4',
                                                                        borderRadius: '12px'
                                                                    }}>
                                                                        <pre className="mb-0 small" style={{ whiteSpace: 'pre-wrap' }}>{`{
    "balance": "343423",
    "currency": "USD"
}`}</pre>
                                                                    </div>
                                                                </>
                                                            ),
                                                        },
                                                        {
                                                            id: "cancel",
                                                            content: (
                                                                <>
                                                                    <Table responsive striped bordered className="align-middle mb-3" style={{
                                                                        background: 'linear-gradient(45deg, #f8f9fa 0%, #ffebee 100%)',
                                                                        borderRadius: '8px',
                                                                        overflow: 'hidden'
                                                                    }}>
                                                                        <thead style={{
                                                                            background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                                                                            color: 'white'
                                                                        }}>
                                                                            <tr>
                                                                                <th className="fw-semibold">Parameters</th>
                                                                                <th className="fw-semibold">Description</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            <tr>
                                                                                <td className="fw-semibold" style={{ color: '#f44336' }}>key</td>
                                                                                <td>API Key</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="fw-semibold" style={{ color: '#f44336' }}>action</td>
                                                                                <td>"cancel"</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="fw-semibold" style={{ color: '#f44336' }}>orders or order</td>
                                                                                <td className="text-break">Order IDs separated by comma (E.g: 123,456,789) (Limit 100)</td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </Table>
                                                                    <h6 className="fw-bold" style={{ color: '#f44336' }}>Example response</h6>
                                                                    <div className="rounded-3 p-3" style={{
                                                                        background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
                                                                        border: '1px solid #f44336',
                                                                        borderRadius: '12px'
                                                                    }}>
                                                                        <pre className="mb-0 small" style={{ whiteSpace: 'pre-wrap' }}>{`[
    {
        "order": 9,
        "cancel": {
            "error": "Incorrect order ID"
        }
    },
    {
        "order": 2,
        "cancel": 1
    }
]`}</pre>
                                                                    </div>
                                                                </>
                                                            ),
                                                        },
                                                        {
                                                            id: "refill",
                                                            content: (
                                                                <>
                                                                    <Table responsive striped bordered className="align-middle mb-3" style={{
                                                                        background: 'linear-gradient(45deg, #f8f9fa 0%, #ede7f6 100%)',
                                                                        borderRadius: '8px',
                                                                    }}>
                                                                        <thead style={{
                                                                            background: 'linear-gradient(135deg, #673ab7 0%, #512da8 100%)',
                                                                            color: 'white'
                                                                        }}>
                                                                            <tr>
                                                                                <td className="fw-semibold" data-lang="Parameters">
                                                                                    Parameters
                                                                                </td>
                                                                                <td className="fw-semibold" data-lang="Description">
                                                                                    Description
                                                                                </td>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            <tr>
                                                                                <td style={{ color: '#673ab7' }}>key</td>
                                                                                <td>API Key</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td style={{ color: '#673ab7' }}>action</td>
                                                                                <td>"refill"</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td style={{ color: '#673ab7' }}>order or orders</td>
                                                                                <td>Order IDs separated by comma (E.g: 123,456,789) (Limit 100)</td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </Table>
                                                                    <h6 className="fw-bold" style={{ color: '#673ab7' }}>Example response</h6>
                                                                    <div className="rounded-3 p-3" style={{
                                                                        background: 'linear-gradient(135deg, #e1bee7 0%, #ce93d8 100%)',
                                                                        border: '1px solid #673ab7',
                                                                        borderRadius: '12px'
                                                                    }}>
                                                                        <pre className="mb-0 small" style={{ whiteSpace: 'pre-wrap' }}>{`{
    "refill": "1"
}`}</pre>
                                                                    </div>
                                                                </>
                                                            ),
                                                        }
                                                    ].map((tab, index) => (
                                                        <div
                                                            key={tab.id}
                                                            className={`tab-pane fade ${activeApiTab === tab.id ? 'show active' : ''}`}
                                                            role="tabpanel"
                                                            style={{
                                                                animation: activeApiTab === tab.id ? 'slideInUp 0.5s ease-out' : 'none',
                                                                transform: activeApiTab === tab.id ? 'translateY(0)' : 'translateY(20px)',
                                                                opacity: activeApiTab === tab.id ? 1 : 0,
                                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                                            }}
                                                        >
                                                            {tab.content}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="mt-5 pt-4 border-top">
                                                <div className="d-flex gap-3 flex-wrap justify-content-center">
                                                    <Link
                                                        to="/tai-lieu-api"
                                                        className="btn btn-primary btn-lg rounded-pill px-4"
                                                        style={{
                                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            position: 'relative',
                                                            overflow: 'hidden'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                                                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(13, 110, 253, 0.4)';
                                                            e.currentTarget.style.background = 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                                            e.currentTarget.style.boxShadow = 'none';
                                                            e.currentTarget.style.background = '';
                                                        }}
                                                    >
                                                        <i className="fas fa-book me-2"></i>
                                                        Xem tài liệu đầy đủ
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-primary btn-lg rounded-pill px-4"
                                                        onClick={() => openAuthModal('register')}
                                                        style={{
                                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            position: 'relative',
                                                            overflow: 'hidden'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                                                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(13, 110, 253, 0.3)';
                                                            e.currentTarget.style.background = 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)';
                                                            e.currentTarget.style.color = 'white';
                                                            e.currentTarget.style.borderColor = 'transparent';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                                            e.currentTarget.style.boxShadow = 'none';
                                                            e.currentTarget.style.background = '';
                                                            e.currentTarget.style.color = '';
                                                            e.currentTarget.style.borderColor = '';
                                                        }}
                                                    >
                                                        <i className="fas fa-user-plus me-2"></i>
                                                        Tạo tài khoản để sử dụng API
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            {/* API Features */}
                            <div className="row mt-5">
                                <div className="col-lg-3 col-md-6 mb-4 animate-on-scroll">
                                    <div className="text-center p-4 rounded-4" style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        cursor: 'pointer'
                                    }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-10px) scale(1.05)';
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.3)';
                                            e.currentTarget.style.animation = 'pulse 1.5s ease-in-out infinite';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                            e.currentTarget.style.boxShadow = 'none';
                                            e.currentTarget.style.animation = 'none';
                                        }}>
                                        <div className="rounded-circle p-4 d-inline-flex mb-3" style={{
                                            width: '80px',
                                            height: '80px',
                                            background: 'rgba(255, 255, 255, 0.2)',
                                            backdropFilter: 'blur(10px)'
                                        }}>
                                            <i className="fas fa-bolt text-white fa-2x"></i>
                                        </div>
                                        <h6 className="fw-bold text-white mb-2">Tốc Độ Cao</h6>
                                        <small className="text-white opacity-90">Response time &lt; 100ms</small>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-6 mb-4 animate-on-scroll">
                                    <div className="text-center p-4 rounded-4" style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <div className="rounded-circle p-4 d-inline-flex mb-3" style={{
                                            width: '80px',
                                            height: '80px',
                                            background: 'rgba(255, 255, 255, 0.2)',
                                            backdropFilter: 'blur(10px)'
                                        }}>
                                            <i className="fas fa-shield-alt text-white fa-2x"></i>
                                        </div>
                                        <h6 className="fw-bold text-white mb-2">Bảo Mật</h6>
                                        <small className="text-white opacity-90">SSL encryption & API key</small>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-6 mb-4 animate-on-scroll">
                                    <div className="text-center p-4 rounded-4" style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <div className="rounded-circle p-4 d-inline-flex mb-3" style={{
                                            width: '80px',
                                            height: '80px',
                                            background: 'rgba(255, 255, 255, 0.2)',
                                            backdropFilter: 'blur(10px)'
                                        }}>
                                            <i className="fas fa-sync text-white fa-2x"></i>
                                        </div>
                                        <h6 className="fw-bold text-white mb-2">Real-time</h6>
                                        <small className="text-white opacity-90">Cập nhật trạng thái tức thì</small>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-6 mb-4 animate-on-scroll">
                                    <div className="text-center p-4 rounded-4" style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <div className="rounded-circle p-4 d-inline-flex mb-3" style={{
                                            width: '80px',
                                            height: '80px',
                                            background: 'rgba(255, 255, 255, 0.2)',
                                            backdropFilter: 'blur(10px)'
                                        }}>
                                            <i className="fas fa-code text-white fa-2x"></i>
                                        </div>
                                        <h6 className="fw-bold text-white mb-2">RESTful</h6>
                                        <small className="text-white opacity-90">Dễ tích hợp với mọi ngôn ngữ</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div> {/* End Main Content */}

            {/* Auth Modal */}
            {showAuthModal && (
                <div className="modal d-block auth-modal" style={{ zIndex: 1055 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content auth-modal-content fade-modal">
                            <div className="modal-header border-0 p-4">
                                <div className="w-100">
                                    <div className="d-flex justify-content-center mb-3">
                                        <div className="btn-group" role="group">
                                            <button
                                                type="button"
                                                className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                                                onClick={() => {
                                                    setAuthMode('login');
                                                    resetForm();
                                                }}
                                            >
                                                Đăng nhập
                                            </button>
                                            <button
                                                type="button"
                                                className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
                                                onClick={() => {
                                                    setAuthMode('register');
                                                    resetForm();
                                                }}
                                            >
                                                Đăng ký
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeAuthModal}
                                ></button>
                            </div>

                            <div className="card-body p-4">
                                {(error || success) && (
                                    <div
                                        className={`alert ${error ? 'alert-danger' : 'alert-success'} alert-dismissible fade show position-relative`}
                                        style={{ paddingRight: '3rem' }}
                                    >
                                        {error || success}
                                        <button
                                            type="button"
                                            className="btn-close position-absolute"
                                            style={{
                                                top: '50%',
                                                right: '0px',
                                                transform: 'translateY(-50%)',
                                                zIndex: 1,
                                                width: '1rem',
                                                height: '1rem'
                                            }}
                                            onClick={() => {
                                                setError('');
                                                setSuccess('');
                                            }}
                                        ></button>
                                    </div>
                                )}

                                {authMode === 'login' && (
                                    <>
                                        {!otpStep ? (
                                            <form onSubmit={handleLogin}>
                                                <div className="mb-3">
                                                    <label className="form-label fw-semibold">
                                                        Tên tài khoản <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="username"
                                                        className="form-control auth-form-control"
                                                        value={formData.username}
                                                        onChange={handleInputChange}
                                                        placeholder="Nhập tên tài khoản"
                                                        required
                                                        autoComplete="username"
                                                    />
                                                </div>
                                                <div className="mb-4">
                                                    <label className="form-label fw-semibold">
                                                        Mật khẩu <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="password"
                                                        name="password"
                                                        className="form-control auth-form-control"
                                                        value={formData.password}
                                                        onChange={handleInputChange}
                                                        placeholder="Nhập mật khẩu"
                                                        required
                                                        autoComplete="current-password"
                                                    />
                                                </div>
                                                <button
                                                    type="submit"
                                                    className="btn auth-btn-primary w-100 text-white"
                                                    disabled={loading}
                                                >
                                                    {loading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                                            Đang xử lý...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fas fa-sign-in-alt me-2"></i>
                                                            Đăng nhập
                                                        </>
                                                    )}
                                                </button>
                                            </form>
                                        ) : (
                                            <form onSubmit={handleLogin}>
                                                <div className="text-center mb-4">
                                                    <i className="fas fa-shield-alt fa-3x text-primary mb-3"></i>
                                                    <h5>Xác thực 2FA</h5>
                                                    <p className="text-muted">Nhập mã 6 số từ ứng dụng xác thực của bạn</p>
                                                </div>
                                                <div className="mb-4">
                                                    <input
                                                        type="text"
                                                        className="form-control auth-form-control text-center fs-4"
                                                        value={otp}
                                                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                                        placeholder="000000"
                                                        maxLength={6}
                                                        required
                                                        autoFocus
                                                    />
                                                    <small className="text-muted">Mã đổi mỗi 30 giây</small>
                                                </div>
                                                <div className="d-flex gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary"
                                                        onClick={() => {
                                                            setOtpStep(false);
                                                            setOtp('');
                                                            setError('');
                                                            setSuccess('');
                                                        }}
                                                        disabled={loading}
                                                    >
                                                        Quay lại
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="btn auth-btn-primary flex-grow-1 text-white"
                                                        disabled={loading || otp.length !== 6}
                                                    >
                                                        {loading ? 'Đang xác thực...' : 'Xác thực & đăng nhập'}
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </>
                                )}

                                {authMode === 'register' && (
                                    <form onSubmit={handleRegister}>
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Tên tài khoản <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="username"
                                                className="form-control auth-form-control"
                                                value={formData.username}
                                                onChange={handleInputChange}
                                                placeholder="Nhập tên tài khoản"
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Mật khẩu <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                name="password"
                                                className="form-control auth-form-control"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                placeholder="Nhập mật khẩu"
                                                required
                                            />
                                        </div>
                                        {/* <div className="mb-4">
                                            <label className="form-label fw-semibold">
                                                Xác nhận mật khẩu <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                className="form-control auth-form-control"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                placeholder="Nhập lại mật khẩu"
                                                required
                                            />
                                        </div> */}
                                        {siteKey && (
                                            <div className="mb-3 d-flex justify-content-center">
                                                <ReCAPTCHA
                                                    ref={recaptchaRef}
                                                    sitekey={siteKey}
                                                    onChange={(token) => setRecaptchaToken(token || '')}
                                                    onExpired={() => setRecaptchaToken('')}
                                                    hl="vi"
                                                />
                                            </div>
                                        )}
                                        <button
                                            type="submit"
                                            className="btn auth-btn-primary w-100 text-white"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-user-plus me-2"></i>
                                                    Đăng ký
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>

                            <div className="modal-footer border-0 p-4 pt-0">
                                <div className="w-100 text-center">
                                    <div className="d-flex align-items-center justify-content-center mb-3">
                                        <div className="bg-light" style={{ height: '1px', flex: 1 }}></div>
                                        <span className="px-3 text-muted small">Hoặc</span>
                                        <div className="bg-light" style={{ height: '1px', flex: 1 }}></div>
                                    </div>
                                    {authMode === 'login' ? (
                                        <p className="text-muted mb-0">
                                            Chưa có tài khoản?{' '}
                                            <button
                                                type="button"
                                                className="btn btn-link p-0 text-decoration-none"
                                                onClick={() => {
                                                    setAuthMode('register');
                                                    resetForm();
                                                }}
                                            >
                                                Đăng ký ngay
                                            </button>
                                        </p>
                                    ) : (
                                        <p className="text-muted mb-0">
                                            Đã có tài khoản?{' '}
                                            <button
                                                type="button"
                                                className="btn btn-link p-0 text-decoration-none"
                                                onClick={() => {
                                                    setAuthMode('login');
                                                    resetForm();
                                                }}
                                            >
                                                Đăng nhập ngay
                                            </button>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}