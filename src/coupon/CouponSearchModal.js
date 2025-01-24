import React, { useState } from 'react';
import Modal from 'react-modal';
import sendRefreshTokenAndStoreAccessToken from "../auth/RefreshAccessToken";
import axios from "axios";

const CouponSearchModal = ({ isOpen, onRequestClose }) => {
    const [couponCode, setCouponCode] = useState('');
    const [coupon, setCoupon] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const handleInputChange = (e) => {
        setCouponCode(e.target.value);
        setErrorMessage(''); // 입력할 때 에러 메시지 초기화
    };

    const handleSearch = async () => {
        if (couponCode.length !== 6) {
            setErrorMessage('쿠폰 코드는 6자리여야 합니다!');
            return;
        }

        try {
            const response = await axios.get(`https://obpedvusnf.execute-api.ap-northeast-2.amazonaws.com/api/coupons/code/${couponCode}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
            });

            setCoupon(response.data); // 쿠폰 정보 설정
            setErrorMessage(''); // 에러 메시지 초기화
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setCoupon(null);
                setErrorMessage('유효하지 않은 쿠폰 코드입니다!'); // 유효하지 않은 쿠폰 코드 에러 메시지 설정
            } else {
                try {
                    await sendRefreshTokenAndStoreAccessToken();

                    // 토큰 갱신 후 다시 요청
                    const response = await axios.get(`https://obpedvusnf.execute-api.ap-northeast-2.amazonaws.com/api/coupons/code/${couponCode}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`, // 갱신된 토큰 사용
                            'Content-Type': 'application/json'
                        },
                    });

                    setCoupon(response.data); // 쿠폰 정보 설정
                    setErrorMessage(''); // 에러 메시지 초기화
                } catch (e) {
                    console.error(e.message);
                }
            }
        }
    };

    const handleCouponSubmit = async () => {
        if (!coupon || !coupon.active) return; // 쿠폰이 없거나 비활성화 상태일 때는 아무것도 하지 않음

        try {
            const response = await axios.post(`https://obpedvusnf.execute-api.ap-northeast-2.amazonaws.com/api/coupons`, couponCode, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'text/plain' // 문자열로 전송하므로 Content-Type 변경
                },
            });

            alert('쿠폰을 다운로드 받았습니다!'); // 성공 메시지 표시
            // 모달 닫기
            onRequestClose();

            // 페이지 새로 고침
            window.location.reload();
        } catch (error) {
            try {
                await sendRefreshTokenAndStoreAccessToken();

                // 토큰 갱신 후 다시 요청
                const response = await axios.post(`https://obpedvusnf.execute-api.ap-northeast-2.amazonaws.com/api/coupons`, couponCode, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'text/plain' // 문자열로 전송하므로 Content-Type 변경
                    },
                });

                alert('쿠폰을 다운로드 받았습니다!'); // 성공 메시지 표시
                // 모달 닫기
                onRequestClose();

                // 페이지 새로 고침
                window.location.reload();
            } catch (e) {
                if(e.status === 409) {
                    alert("이미 쿠폰을 보유 중입니다!");
                } else {
                    alert("쿠폰 다운로드 중 오류가 발생했습니다!");
                }

                console.error(e.message);
            }
        }
    };

    const handleCloseModal = () => {
        setCouponCode('');
        setCoupon(null);
        setErrorMessage('');
        onRequestClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={handleCloseModal}
            ariaHideApp={false}
            style={{
                content: {
                    maxWidth: `70%`,
                    maxHeight: `80%`,
                    margin: 'auto',
                    padding: '0 40px 40px 40px',
                    borderRadius: '10px'
                },
                overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    zIndex: '100'
                }
            }}
        >
            <div className="modal-header d-flex justify-content-between align-items-center">
                <h2 className="text-center mb-4">쿠폰 검색</h2>
                <button onClick={handleCloseModal} style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    marginTop: '-30px'
                }}>&times;</button>
            </div>
            <div className="d-flex justify-content-center align-items-center mt-4">
                <input
                    className="form-control flex-grow me-2"
                    type="text"
                    value={couponCode}
                    onChange={handleInputChange}
                    style={{ minWidth: '150px', maxWidth: '300px' }} // 최소 및 최대 너비 설정
                    placeholder="쿠폰 코드 (6자리)"
                    maxLength={6}
                />
                <button
                    className="btn btn-light text-dark"
                    style={{ border: '1px solid #ced4da' }}
                    onClick={handleSearch}
                >
                    검색
                </button>
            </div>

            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

            {coupon && (
                <div className="couponWrap d-flex justify-content-center" key={coupon.id}>
                    <div className={`coupon couponLeft ${coupon.active ? (coupon.type === 'AMOUNT' ? 'red' : 'blue') : 'black'}`}>
                        <h1 className="m-0 d-flex justify-content-between" style={{ color: "white" }}>
                            {coupon.name}
                            <span>{coupon.active ? '사용가능' : '사용불가'}</span>
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

                    <div className={`coupon couponRight ${coupon.active ? (coupon.type === 'AMOUNT' ? 'red' : 'blue') : 'black'}`}>
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
                                onClick={handleCouponSubmit} // 버튼 클릭 시 쿠폰 입력 요청
                            >
                                <span className="material-icons">download</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default CouponSearchModal;
