import React, {useEffect, useState} from 'react';
import './coupon.css';
import CouponSearchModal from './CouponSearchModal';
import { useNavigate } from 'react-router-dom';
import sendRefreshTokenAndStoreAccessToken from "../auth/RefreshAccessToken";
import axios from "axios";

const CouponList = () => {
    const [coupons, setCoupons] = useState([]);
    const [categories, setCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [includeInactiveCoupons, setIncludeInactiveCoupons] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCoupons(currentPage, includeInactiveCoupons);
        fetchCategories();
    }, [currentPage, includeInactiveCoupons]);

    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    const handleOpenSearchModal = () => {
        setIsSearchModalOpen(true);
    };

    const handleCloseSearchModal = () => {
        setIsSearchModalOpen(false);
    };


    const fetchCoupons = async (page, includeInActiveCoupons) => {
        try {
            const response = await axios.get(`https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/coupons`, {
                params: {
                    page: page,
                    includeInActiveCoupons: includeInActiveCoupons
                },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });

            setCoupons(response.data.coupons);
            console.log(response.data.coupons);
            setTotalPages(response.data.totalPages); // 총 페이지 수 설정
        } catch (error) {
            try {
                await sendRefreshTokenAndStoreAccessToken();

                // 토큰 갱신 후 다시 요청
                const response = await axios.get(`https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/coupons`, {
                    params: {
                        page: page,
                        includeInActiveCoupons: includeInActiveCoupons // 재전송할 파라미터
                    },
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // 갱신된 토큰 사용
                    },
                });

                setCoupons(response.data.coupons);
                console.log(response.data.coupons);
                setTotalPages(response.data.totalPages); // 총 페이지 수 설정
            } catch (e) {
                console.error('쿠폰 목록을 가져오는 데 실패했습니다.', error.message);
            }
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/categories', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });

            setCategories(response.data); // 카테고리 목록 설정
        } catch (error) {
            try {
                await sendRefreshTokenAndStoreAccessToken();

                // 토큰 갱신 후 다시 요청
                const response = await axios.get('https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/categories', {
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


    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleIncludeInactiveChange = (e) => {
        setIncludeInactiveCoupons(e.target.value === 'true');
    };

    const handleOrderHistoryClick = async (couponId) => {
        try {
            const response = await axios.get(`https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/coupons/${couponId}/order`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const orderId = response.data; // 반환된 문자열을 받아옴
            console.log(response);
            navigate(`/orders/${orderId}`);
        } catch (error) {
            console.error('쿠폰 사용 내역 요청 중 오류 발생:', error);
        }
    };

    return (
        <div className="container" style={{marginTop: '100px'}}>

            <div style={{
                width: '100%',
                position: 'fixed',
                backgroundColor: 'white',
                zIndex: '99',
                paddingTop: '20px',
                top: '86px'
            }}>
                <h2>내 쿠폰 목록</h2>
                <div className="d-flex flex-row justify-content-start align-items-center mt-5" style={{width: '70%'}}>
                    <button className="btn btn-light text-dark me-4" style={{border: '1px solid #ced4da'}}
                            onClick={handleOpenSearchModal}>쿠폰 발급
                    </button>
                    <CouponSearchModal isOpen={isSearchModalOpen} onRequestClose={handleCloseSearchModal}/>

                    {/* 유효하지 않은 쿠폰 포함 드롭다운 */}
                    <div style={{width: '30%', margin: '20px 0'}}>
                        <select
                            className="form-select"
                            value={includeInactiveCoupons ? 'true' : 'false'}
                            onChange={(e) => setIncludeInactiveCoupons(e.target.value === 'true')}
                        >
                            <option value="false">사용 가능한 쿠폰만 보기</option>
                            <option value="true">모든 쿠폰 보기</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="row" style={{marginTop: '200px'}}>
                {coupons.map((coupon) => (
                    <div className="couponWrap" key={coupon.id}>
                        <div
                            className={`coupon couponLeft ${coupon.active ? (coupon.type === 'AMOUNT' ? 'red' : 'blue') : 'black'} ${coupon.used ? 'green' : ''}`}>
                            <h1 className="m-0 d-flex justify-content-between" style={{color: "white"}}>
                                {coupon.name}
                                <span>
                                    {coupon.used ? '사용완료' : (coupon.active ? '사용가능' : '사용불가')}
                                </span>
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
                                className={`coupon couponRight ${coupon.active ? (coupon.type === 'AMOUNT' ? 'red' : 'blue') : 'black'} ${coupon.used ? 'green' : ''}`}>
                                {coupon.used && (
                                    <div>
                                        <h1 className="m-0" style={{color: "white"}}>사용내역</h1>
                                        <div className="mt-5 d-flex flex-column justify-content-center align-items-center">
                                            <button
                                                className="btn btn-light mb-2"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    height: '60px',
                                                    width: '60px'
                                                }}
                                                onClick={() => handleOrderHistoryClick(coupon.id)}>
                                                <span className="material-icons">history</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    )
                )}
            </div>

            {/* 페이징 버튼 */
            }
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '20px',
                marginBottom: '50px'
            }}>
                <button className="btn btn-secondary me-2" onClick={handlePreviousPage} disabled={currentPage === 1}>
                    이전
                </button>
                <span>{currentPage} / {totalPages}</span>
                <button className="btn btn-secondary ms-2" onClick={handleNextPage}
                        disabled={currentPage === totalPages}>
                    다음
                </button>
            </div>

        </div>
    )
        ;
};

export default CouponList;
