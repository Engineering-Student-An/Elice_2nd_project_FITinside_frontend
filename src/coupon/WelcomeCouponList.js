import React, { useEffect, useState } from 'react';
import './coupon.css';
import CouponSearchModal from './CouponSearchModal';

const CouponList = () => {
    const [welcomeCoupons, setWelcomeCoupons] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchWelcomeCoupons();
        fetchCategories();
    }, []);


    const fetchWelcomeCoupons = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/coupons/welcome`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });

            if (!response.ok) {
                throw new Error('네트워크 응답이 정상적이지 않습니다.');
            }

            const data = await response.json();
            setWelcomeCoupons(data.coupons);
        } catch (error) {
            console.error('쿠폰 목록을 가져오는 데 실패했습니다.', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/categories', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });

            if (!response.ok) {
                throw new Error('카테고리 목록을 가져오는 데 실패했습니다.');
            }

            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('카테고리 목록을 가져오는 데 실패했습니다.', error);
        }
    };

    const handleCouponSubmit = async (code) => {
        try {
            const response = await fetch('http://localhost:8080/api/coupons', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: code, // 쿠폰 코드를 JSON 형식으로 전송
            });

            if (!response.ok) {
                if (response.status === 409) {
                    throw new Error('이미 쿠폰을 다운로드했습니다!'); // 409 상태 코드 처리
                }
                throw new Error('쿠폰 다운로드에 실패했습니다!'); // 실패 시 에러 메시지
            }

            alert('쿠폰을 다운로드 받았습니다!'); // 성공 메시지 표시

            // 쿠폰 다운로드 후 상태 업데이트
            setWelcomeCoupons(prevCoupons =>
                prevCoupons.map(coupon =>
                    coupon.code === code ? { ...coupon, active: false } : coupon
                )
            );

            // 페이지 새로 고침
            // window.location.reload(); // 페이지 새로 고침 대신 상태 업데이트로 대체
        } catch (error) {
            alert(error.message); // 에러 메시지 표시
        }
    };

    return (
        <div className="container mt-5 d-flex flex-column justify-content-center">
            <h2>웰컴 쿠폰 발급 이벤트!!</h2><br />
            <img src="/img/welcome_coupon_ad_transparent.png" style={{ width: '100%', height: 'auto' }} alt="쿠폰 광고" />
            <div className="row mb-5" style={{ width: '100%' }}>
                {welcomeCoupons.map((coupon) => (
                    <div className="couponWrap" key={coupon.id}>
                        <div
                            className={`mb-5 coupon couponLeft ${coupon.active ? (coupon.type === 'AMOUNT' ? 'red' : 'blue') : 'black'}`}>
                            <h1 className="m-0 d-flex justify-content-between" style={{ color: "white" }}>
                                {coupon.name}
                                <span>사용가능</span>
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
                            className={`coupon couponRight ${coupon.active ? (coupon.type === 'AMOUNT' ? 'red' : 'blue') : 'black'}`}>
                            <h1 className="m-0" style={{ color: "white" }}>다운로드</h1>
                            <div className="mt-5 d-flex flex-column justify-content-center align-items-center">
                                <button
                                    className="btn btn-light mb-2"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '60px',
                                        width: '60px',
                                        opacity: coupon.active ? 1 : 0.5, // 활성화 상태에 따라 투명도 조정
                                        cursor: coupon.active ? 'pointer' : 'not-allowed' // 활성화 상태에 따라 커서 변경
                                    }}
                                    disabled={!coupon.active} // coupon.active가 false일 때 버튼 비활성화
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