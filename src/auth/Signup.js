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
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 비밀번호 확인 로직
        if (password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/api/auth', {
                email,
                password,
                userName,
                phone
            });

            if (response.status === 200) {
                // 회원가입 성공 시 처리
                setSuccess('회원가입에 성공했습니다! 로그인 페이지로 이동하세요.');
                setError('');
                navigate('/login');
            }
        } catch (error) {
            setError('회원가입 실패: 이미 존재하는 이메일이거나 서버 오류가 발생했습니다.');
            setSuccess('');
        }
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
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
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
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
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
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
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
                            onChange={handlePhoneChange} // onChange 핸들러
                            pattern="[0-9]{10,11}" // 전화번호는 10~11자리 숫자
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
