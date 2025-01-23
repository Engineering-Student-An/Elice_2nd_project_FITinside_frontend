// src/Signup.js
import React, { useState } from 'react';
import axios from 'axios';
import {useNavigate} from "react-router-dom";

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userName, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [emailError, setEmailError] = useState(''); // 이메일 오류 메시지
    const [passwordError, setPasswordError] = useState('');  // 비밀번호 오류 메시지
    const [confirmPasswordError, setConfirmPasswordError] = useState(''); // 비밀번호 확인 오류 메시지
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    // 이메일 유효성 검사
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 기본적인 이메일 형식 검사
        if (!emailRegex.test(email)) {
            setEmailError('유효한 이메일 주소를 입력하세요.');
            return false;
        } else {
            setEmailError(''); // 오류가 없으면 메시지 초기화
            return true;
        }
    };

    // 비밀번호 유효성 검사
    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[0-9]).{8,}$/;
        if (!passwordRegex.test(password)) {
            setPasswordError('비밀번호는 숫자를 포함하여 8자 이상이어야 합니다.');
            return false;
        } else {
            setPasswordError('');  // 오류가 없으면 메시지 초기화
            return true;
        }
    };

    // 비밀번호 확인 검사
    const validateConfirmPassword = (password, confirmPassword) => {
        if (password !== confirmPassword) {
            setConfirmPasswordError('비밀번호가 일치하지 않습니다.');
            return false;
        } else {
            setConfirmPasswordError('');  // 오류가 없으면 메시지 초기화
            return true;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 유효성 검사 통과 여부 확인
        if (!validateEmail(email) || !validatePassword(password) || !validateConfirmPassword(password, confirmPassword)) {
            return;
        }

        try {
            const response = await axios.post('http://ec2-3-34-78-114.ap-northeast-2.compute.amazonaws.com:8080/api/auth', {
                email,
                password,
                userName,
                phone
            });

            if (response.status === 200) {
                setSuccess('회원가입에 성공했습니다! 로그인 페이지로 이동하세요.');
                setError('');
                navigate('/login');
            }
        } catch (error) {
            setError('회원가입 실패: 이미 존재하는 이메일이거나 서버 오류가 발생했습니다.');
            setSuccess('');
        }
    };

    // 입력 중 비밀번호와 비밀번호 확인 검사
    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        validatePassword(e.target.value);  // 비밀번호 유효성 실시간 검사
        validateConfirmPassword(e.target.value, confirmPassword); // 비밀번호 재확인 실시간 검사
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
        validateConfirmPassword(password, e.target.value); // 비밀번호 재확인 실시간 검사
    };

    // 이메일 입력 중 유효성 검사
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        validateEmail(e.target.value); // 이메일 형식 실시간 검사
    };

    // 전화번호 유효성 검사
    const handlePhoneChange = (e) => {
        const regex = /^[0-9\b]+$/; // 숫자만 허용하는 정규 표현식
        if (e.target.value === '' || regex.test(e.target.value)) {
            setPhone(e.target.value); // 유효할 경우 상태 업데이트
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4" style={{width: '35rem', height: 'fit-content'}}>
                <h2 className="text-center mb-4">회원가입</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                            이메일
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="form-control"
                            value={email}
                            onChange={handleEmailChange}
                            required
                        />
                        {emailError && <div className="text-danger">{emailError}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">
                            비밀번호
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            value={password}
                            onChange={handlePasswordChange}
                            required
                        />
                        {passwordError && <div className="text-danger">{passwordError}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="confirmPassword" className="form-label">
                            비밀번호 확인
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="form-control"
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            required
                        />
                        {confirmPasswordError && <div className="text-danger">{confirmPasswordError}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">
                            이름
                        </label>
                        <input
                            type="text"
                            id="name"
                            className="form-control"
                            value={userName}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="phone" className="form-label">
                            전화번호
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            className="form-control"
                            value={phone}
                            onChange={handlePhoneChange}
                            pattern="[0-9]{10,11}"
                            required
                        />
                        {phone && !/^[0-9]{10,11}$/.test(phone) && (
                            <div className="text-danger">
                                전화번호는 10자리 또는 11자리 숫자여야 합니다.
                            </div>
                        )}
                    </div>
                    {error && <p className="text-danger">{error}</p>}
                    {success && <p className="text-success">{success}</p>}
                    <div className="d-flex justify-content-center">
                        <button
                            type="submit"
                            className="btn"
                            style={{backgroundColor: '#333', color: '#fff'}}
                        >
                            회원가입
                        </button>
                    </div>
                    <div className="text-center mt-3">
                        <a href="/login" className="text-decoration-none">
                            이미 계정이 있으신가요? 로그인
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;
