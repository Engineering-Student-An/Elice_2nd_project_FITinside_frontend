// Header.js
import React, {useEffect, useState} from 'react';
import './header.css';
import {useNavigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import axios from "axios";


const Header = () => {
    const [cartCount, setCartCount] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [categories, setCategories] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(null); // 드롭다운 상태
    const navigate = useNavigate(); // useNavigate 훅 사용

    const [userRole, setUserRole] = useState(null);

    // 카테고리 데이터 가져오기
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`https://obpedvusnf.execute-api.ap-northeast-2.amazonaws.com/api/categories`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                });
                console.log(response.data); // 데이터 확인용
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    // 부모 카테고리 필터링 및 정렬
    const parentCategories = (Array.isArray(categories) ? categories : [])
        .filter(category => !category.parentId)
        .sort((a, b) => a.displayOrder - b.displayOrder);


    // 특정 부모의 자식 카테고리 가져오기
    const getChildCategories = (parentId) => {
        return categories
            .filter(category => category.parentId === parentId)
            .sort((a, b) => a.displayOrder - b.displayOrder); // 자식 카테고리 정렬 추가
    };

    // 드롭다운 상태 관리
    const handleMouseEnter = (parentId) => setDropdownOpen(parentId);
    const handleMouseLeave = () => setDropdownOpen(null);

    // 장바구니 개수 확인 및 업데이트 함수
    const updateCartCount = () => {
        const storedCart = JSON.parse(localStorage.getItem('localCart')) || [];
        setCartCount(storedCart.length);
    };

    // 로그인 상태 확인
    useEffect(() => {
        const token = localStorage.getItem('token');

        try { // 권한 확인 후 저장
            const decodedToken = jwtDecode(token);
            setUserRole(decodedToken.auth); // 권한을 설정
        } catch (error) {
            console.error('Invalid token', error);
        }

        setIsLoggedIn(!!token);
        updateCartCount(); // 초기 카운트 업데이트
        window.addEventListener('storage', updateCartCount); // storage 이벤트 리스너 추가
        return () => {
            window.removeEventListener('storage', updateCartCount); // 언마운트 시 리스너 제거
        };
    }, [navigate]);

    // 로그아웃 함수
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('dbCart');
        localStorage.removeItem('localCart');
        setIsLoggedIn(false);
        updateCartCount(); // 로그아웃 시 카운트 업데이트

        navigate('/'); // 로그인 페이지로 리다이렉트
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid px-4 px-lg-4 bg-light">
                <a className="navbar-brand" href="/"><img src="/img/fitinside_logo_transparent.png" alt="로고"/> </a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
                        <li className="nav-item">
                            <a className="nav-link active" aria-current="page" href="/">Home</a>
                        </li>

                        {parentCategories.map(parent => (
                            <li
                                className={`nav-item dropdown ${dropdownOpen === parent.id ? 'show' : ''}`}
                                key={parent.id}
                                onMouseEnter={() => handleMouseEnter(parent.id)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <span className="nav-link dropdown-toggle" href="/" role="button" aria-expanded="false">
                                    {parent.name}
                                </span>
                                <ul className={`dropdown-menu ${dropdownOpen === parent.id ? 'show' : ''}`}>
                                    {getChildCategories(parent.id).map(child => (
                                        <li key={child.id}>
                                            <a className="dropdown-item" href={`/products/category/${child.id}`}>
                                                {child.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}

                    </ul>
                    <div className="d-flex m-3">
                        {userRole === 'ROLE_ADMIN' && isLoggedIn && (
                            <div>
                                <a className="btn btn-outline-dark me-3" href="/admin">ADMIN</a>
                            </div>
                        )}
                        {isLoggedIn && (
                            <div>
                                <a className="btn btn-outline-dark" href="/me">
                                    MY
                                </a>
                            </div>
                        )}
                    </div>
                    <div className="d-flex">
                        <a className="btn btn-outline-dark" href="/cart"><i className="bi-cart-fill me-1"></i> Cart
                            <span
                                className="badge bg-dark text-white ms-1 rounded-pill">{cartCount}</span> {/* 장바구니 품목 개수 표시 */}
                        </a>
                    </div>
                    <div className="d-flex m-3">
                        {isLoggedIn ? (
                            <button className="btn btn-outline-dark" onClick={handleLogout}>
                                <i className="bi-cart-fill me-1"></i> 로그아웃
                            </button>
                        ) : (
                            <a className="btn btn-outline-dark" href="/login">
                                <i className="bi-cart-fill me-1"></i> 로그인
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Header;
