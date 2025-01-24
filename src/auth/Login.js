// src/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import {fetchAndMergeCartData} from "../cart/cartStorage";
import {useNavigate} from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); // useNavigate 훅 사용


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`https://obpedvusnf.execute-api.ap-northeast-2.amazonaws.com/api/auth/login`, {
                email,
                password
            },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true
                });

            if (response.status === 200) {
                // 로그인 성공 시 처리 (예: 토큰 저장, 리다이렉트)
                localStorage.setItem('token', response.data.accessToken);

                // 로그인 성공 시 로컬 스토리지와 db 의 장바구니 병합
                await fetchAndMergeCartData(localStorage.getItem('token'));

                alert('로그인 성공!');
                // 예: 대시보드 페이지로 이동
                navigate('/');
            }
        } catch (error) {
            setError('로그인 실패: 이메일 또는 비밀번호를 확인해주세요.');
        }
    };

    // 구글 로그인 버튼 클릭 시 리다이렉트
    const handleGoogleLogin = () => {
        window.location.href = '/oauth2/authorization/google';
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4" style={{width: '25rem', height: 'fit-content'}}>
                <h2 className="text-center mb-4">로그인</h2>
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
                    {error && <p className="text-danger">{error}</p>}
                    <button type="submit" className="btn w-100" style={{backgroundColor: '#333', color: '#fff'}}>
                        로그인
                    </button>
                    <div className="d-flex justify-content-center mt-3">
                        <a href="/signup" className="text-decoration-none">
                            처음 오셨나요?
                        </a>
                    </div>
                </form>
                {/* 구글 로그인 버튼 */}
                <div className="text-center mt-4">
                    <button
                        type="button"
                        className="btn btn-outline-danger w-100"
                        onClick={handleGoogleLogin}
                    >
                        <i className="bi bi-google me-2"></i> Google로 로그인
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
