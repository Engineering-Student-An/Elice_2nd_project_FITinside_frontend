import React, { useEffect, useState } from 'react';
import './coupon.css';
import sendRefreshTokenAndStoreAccessToken from "../auth/RefreshAccessToken";
import axios from "axios";

const CouponList = () => {
    const [welcomeCoupons, setWelcomeCoupons] = useState([]);
    const [categories, setCategories] = useState([]);
    const [couponIds, setCouponIds] = useState([]); // 추가된 상태

    useEffect(() => {
        fetchWelcomeCoupons();
        fetchCategories();
    }, []);


    const fetchWelcomeCoupons = async () => {
        try {
            // 첫 번째 요청: 웰컴 쿠폰 가져오기
            const response = await axios.get('/api/coupons/welcome', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });

            setWelcomeCoupons(response.data.coupons); // 웰컴 쿠폰 설정

            // 두 번째 요청: 내 웰컴 쿠폰 IDs 가져오기
            const myWelcomeResponse = await axios.get('/api/coupons/my-welcome', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });

            setCouponIds(myWelcomeResponse.data.couponIds); // 응답의 couponIds 저장
        } catch (error) {
            try {
                await sendRefreshTokenAndStoreAccessToken();

                // 토큰 갱신 후 첫 번째 요청 다시 시도
                const response = await axios.get('/api/coupons/welcome', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // 갱신된 토큰 사용
                    },
                });

                setWelcomeCoupons(response.data.coupons); // 웰컴 쿠폰 설정

                // 두 번째 요청: 내 웰컴 쿠폰 IDs 가져오기
                const myWelcomeResponse = await axios.get('/api/coupons/my-welcome', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // 갱신된 토큰 사용
                    },
                });

                setCouponIds(myWelcomeResponse.data.couponIds); // 응답의 couponIds 저장
            } catch (e) {
                console.error('쿠폰 목록을 가져오는 데 실패했습니다.', error.message);
            }
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/categories', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });

            setCategories(response.data); // 카테고리 목록 설정
        } catch (error) {
            try {
                await sendRefreshTokenAndStoreAccessToken();

                // 토큰 갱신 후 다시 요청
                const response = await axios.get('/api/categories', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // 갱신된 토큰 사용
                    },
                });

                setCategories(response.data); // 카테고리 목록 설정
            } catch (e) {
                console.error('카테고리 목록을 가져오는 데 실패했습니다.', error.message);
            }
        }
    };

    const handleCouponSubmit = async (code) => {
        try {
            const response = await axios.post('/api/coupons', code, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'text/plain'
                },
            });

            alert('쿠폰을 다운로드 받았습니다!'); // 성공 메시지 표시

            // 쿠폰 다운로드 후 상태 업데이트
            setWelcomeCoupons(prevCoupons =>
                prevCoupons.map(coupon =>
                    coupon.code === code ? { ...coupon, active: false } : coupon
                )
            );
            // 다운로드 후 페이지 새로고침
            window.location.reload();
        } catch (error) {
            try {
                await sendRefreshTokenAndStoreAccessToken();

                // 토큰 갱신 후 다시 요청
                const response = await axios.post('/api/coupons', code, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'text/plain'
                    },
                });

                alert('쿠폰을 다운로드 받았습니다!'); // 성공 메시지 표시

                // 쿠폰 다운로드 후 상태 업데이트
                setWelcomeCoupons(prevCoupons =>
                    prevCoupons.map(coupon =>
                        coupon.code === code ? { ...coupon, active: false } : coupon
                    )
                );

                // 다운로드 후 페이지 새로고침
                window.location.reload();
            } catch (e) {
                if (error.response && error.response.status === 409) {
                    alert('이미 쿠폰을 다운로드했습니다!'); // 409 상태 코드 처리
                    throw new Error('이미 쿠폰을 다운로드했습니다!'); // 409 상태 코드 처리
                } else {
                    alert('쿠폰 다운로드에 실패했습니다!'); // 실패 시 에러 메시지
                    throw new Error('쿠폰 다운로드에 실패했습니다!'); // 실패 시 에러 메시지
                }
            }
        }
    };

    return (
        <div className="container d-flex flex-column justify-content-center" style={{marginTop: '100px'}}>
            <h2>웰컴 쿠폰 발급 이벤트!!</h2><br />
            <img src="/img/welcome_ad.png" style={{ width: '100%', height: 'auto' }} alt="쿠폰 광고" />
            <div className="row mb-5" style={{ width: '100%' }}>
                {welcomeCoupons.map((coupon) => (
                    <div className="couponWrap" key={coupon.id}>
                        <div
                            className={`mb-5 coupon couponLeft ${couponIds.includes(coupon.id) ? 'black' : (coupon.type === 'AMOUNT' ? 'red' : 'blue')}`}>
                            <h1 className="m-0 d-flex justify-content-between" style={{color: "white"}}>
                                {coupon.name}
                                <span>{couponIds.includes(coupon.id) ? '보유 중' : '다운가능'}</span>
                            </h1>
                            <div className="title mt-4 mb-2">
                                <strong>{coupon.code}</strong>
                            </div>
                            <div className="name mb-0">
                                <strong>{coupon.categoryName}</strong>
                            </div>
                            <div className="name m-0">
                                ({coupon.type === 'AMOUNT' ? '고정 금액' : '퍼센티지'})&nbsp;
                                <strong>{coupon.type === 'AMOUNT' ? `${new Intl.NumberFormat().format(coupon.value)}원` : `${coupon.percentage}%`}</strong> 할인
                            </div>
                            <div className="name m-0">
                                {coupon.minValue === 0 ? '최소 주문 금액 없음' : new Intl.NumberFormat().format(coupon.minValue) + ' 원 부터 적용 가능'}
                            </div>
                            <div className="name m-0">
                                ~ {coupon.expiredAt} 까지 적용 가능
                            </div>
                        </div>

                        <div
                            className={`coupon couponRight ${couponIds.includes(coupon.id) ? 'black' : (coupon.type === 'AMOUNT' ? 'red' : 'blue')}`}>
                            <h1 className="m-0" style={{color: "white"}}>다운로드</h1>
                            <div className="mt-5 d-flex flex-column justify-content-center align-items-center">
                                <button
                                    className="btn btn-light mb-2"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '60px',
                                        width: '60px',
                                        opacity: !couponIds.includes(coupon.id) ? 1 : 0.5,
                                        cursor: !couponIds.includes(coupon.id) ? 'pointer' : 'not-allowed'
                                    }}
                                    disabled={couponIds.includes(coupon.id)} // 보유중일때 버튼 비활성화
                                    onClick={() => handleCouponSubmit(coupon.code)} // 버튼 클릭 시 쿠폰 입력 요청
                                >
                                    <span className="material-icons">download</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CouponList;
