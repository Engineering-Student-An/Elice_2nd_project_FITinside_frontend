import React, {useEffect, useState} from 'react';
import '../coupon.css';
import CouponCreateModal from "./CouponCreateModal";
import CouponMemberModal from "./CouponMemberModal";
import CouponEmailModal from "./CouponEmailModal";
import sendRefreshTokenAndStoreAccessToken from "../../auth/RefreshAccessToken";
import axios from "axios"; // 이메일 모달 컴포넌트 import

const CouponAdmin = () => {
    const [coupons, setCoupons] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [selectedCouponId, setSelectedCouponId] = useState(null);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [includeInactiveCoupons, setIncludeInactiveCoupons] = useState(true);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false); // 이메일 모달 상태 추가
    useEffect(() => {
        fetchCoupons(currentPage, includeInactiveCoupons);
        fetchCategories();
    }, [currentPage, includeInactiveCoupons]);

    const fetchCoupons = async (page, includeInActiveCoupons) => {
        try {
            const response = await axios.get(`https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/admin/coupons`, {
                params: {
                    page: page,
                    includeInActiveCoupons: includeInActiveCoupons
                },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });

            setCoupons(response.data.coupons);
            setTotalPages(response.data.totalPages); // 총 페이지 수 설정
        } catch (error) {
            try {
                await sendRefreshTokenAndStoreAccessToken();

                // 토큰 갱신 후 다시 요청
                const newResponse = await axios.get(`https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/admin/coupons`, {
                    params: {
                        page: page,
                        includeInActiveCoupons: includeInActiveCoupons
                    },
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // 갱신된 토큰 사용
                    },
                });

                setCoupons(newResponse.data.coupons);
                setTotalPages(newResponse.data.totalPages); // 총 페이지 수 설정
            } catch (e) {
                console.error(e.message);
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
                const newResponse = await axios.get('https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/categories', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // 갱신된 토큰 사용
                    },
                });

                setCategories(newResponse.data); // 카테고리 목록 설정
            } catch (e) {
                console.error('카테고리 목록을 가져오는 데 실패했습니다.', error.message);
            }
        }
    };

    const handleCreateCoupon = () => {
        setModalIsOpen(true);
    };

    const handleModalClose = () => {
        setModalIsOpen(false);
    };

    const handleMemberButtonClick = (id) => {
        setSelectedCouponId(id);
        setIsMemberModalOpen(true);
    };

    const handleCloseMemberModal = () => {
        setIsMemberModalOpen(false);
        setSelectedCouponId(null);
    };

    const deactivateCoupon = async (id) => {
        try {
            const response = await axios.delete(`https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/admin/coupons/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            alert('쿠폰이 비활성화되었습니다.');
            fetchCoupons(currentPage, includeInactiveCoupons); // 쿠폰 목록 새로 고침
        } catch (error) {
            if (error.response) {
                // 서버에서 응답이 온 경우
                alert(`오류 발생: ${error.response.data.message}`);
            } else {
                try {
                    await sendRefreshTokenAndStoreAccessToken();

                    // 토큰 갱신 후 다시 요청
                    const response = await axios.delete(`https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/admin/coupons/${id}`, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}` // 갱신된 토큰 사용
                        }
                    });

                    alert('쿠폰이 비활성화되었습니다.');
                    fetchCoupons(currentPage, includeInactiveCoupons); // 쿠폰 목록 새로 고침
                } catch (e) {
                    console.error(`네트워크 오류 발생: ${e.message}`);
                }
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

    const handleFirstPage = () => {
        if (currentPage > 1) {
            setCurrentPage(1);
        }
    };

    const handleLastPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(totalPages);
        }
    };

    const handlePageClick = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleEmailButtonClick = (coupon) => {
        setSelectedCoupon(coupon);
        setIsEmailModalOpen(true); // 이메일 모달 열기
    };

    const handleCloseEmailModal = () => {
        setIsEmailModalOpen(false);
        setSelectedCoupon(null);
    };

    const handleIncludeInactiveChange = (e) => {
        setIncludeInactiveCoupons(e.target.value === 'true');
    };

    return (
        <div className="container" style={{marginTop: '86px'}}>
            <div style={{width: '100%', position: 'fixed', backgroundColor: 'white', zIndex: '99', paddingTop: '20px', top:'86px'}}>
                <h2>쿠폰 관리</h2>
                <div className="d-flex flex-row justify-content-start mt-3" style={{width: '90%'}}>
                    <div>
                        <button className="btn btn-light text-dark mb-4 me-3"
                                style={{border: '1px solid #ced4da'}}
                                onClick={handleCreateCoupon}>
                            쿠폰 추가
                        </button>
                    </div>


                    {/* 유효하지 않은 쿠폰 포함 드롭다운 */}
                    <div style={{width: '20%'}}>
                        <select
                            className="form-select"
                            value={includeInactiveCoupons ? 'true' : 'false'}
                            onChange={(e) => setIncludeInactiveCoupons(e.target.value === 'true')}
                        >
                            <option value="false">활성화 쿠폰만 보기</option>
                            <option value="true">전체 쿠폰 보기</option>
                        </select>
                    </div>
                </div>
            </div>


            <div className="row" style={{marginTop: '230px'}}>
                {coupons.map((coupon) => (
                    <div className="couponWrap" key={coupon.id}>
                        <div
                            className={`coupon couponLeft ${coupon.active ? (coupon.type === 'AMOUNT' ? 'red' : 'blue') : 'black'}`}>
                            <h1 className="m-0 d-flex justify-content-between" style={{color: "white"}}>
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

                        <div
                            className={`coupon couponRight ${coupon.active ? (coupon.type === 'AMOUNT' ? 'red' : 'blue') : 'black'}`}>
                            <h1 className="m-0" style={{color: "white"}}>관리자</h1>
                            <div className="mt-4 d-flex flex-column justify-content-center align-items-center">
                                {coupon.active && (
                                    <button className="btn btn-light mb-2" style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '40px',
                                        width: '40px'
                                    }} onClick={() => handleEmailButtonClick(coupon)}>
                                        <span className="material-icons">email</span>
                                    </button>)}
                                <button className="btn btn-light mb-2"
                                        onClick={() => handleMemberButtonClick(coupon.id, coupon.code)} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '40px',
                                    width: '40px'
                                }}>
                                    <span className="material-icons">group</span>
                                </button>
                                {coupon.active && (
                                    <button
                                        className="btn btn-light"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            height: '40px',
                                            width: '40px'
                                        }}
                                        onClick={() => {
                                            const confirmed = window.confirm("비활성화 이후에는 다시 활성화 할 수 없습니다.\n정말 비활성화 하시겠습니까?");
                                            if (confirmed) {
                                                deactivateCoupon(coupon.id);
                                            }
                                        }}
                                    >
                                        <span className="material-icons" style={{color: 'red'}}>block</span>
                                    </button>
                                )}
                                {selectedCouponId && (
                                    <CouponMemberModal
                                        isMemberModalOpen={isMemberModalOpen}
                                        handleCloseMemberModal={handleCloseMemberModal}
                                        couponId={selectedCouponId}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 페이징 버튼 */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '20px',
                marginBottom: '50px'
            }}>
                <nav aria-label="Page navigation example">
                    <ul className="pagination justify-content-center">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={handleFirstPage} aria-label="First">
                                <span aria-hidden="true">&laquo;</span>
                            </button>
                        </li>

                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={handlePreviousPage}>
                                <span aria-hidden="true">&#8249;</span>
                            </button>
                        </li>

                        {/* 페이지 번호 버튼 생성 */}
                        {Array.from({length: 5}, (_, index) => {
                            const pageNum = currentPage - 2 + index; // 현재 페이지를 기준으로 5개 생성
                            if (pageNum < 1 || pageNum > totalPages) return null; // 페이지 번호가 유효하지 않으면 null 반환
                            return (
                                <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                    <button className="page-link" onClick={() => handlePageClick(pageNum)}>
                                        {pageNum}
                                    </button>
                                </li>
                            );
                        })}

                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={handleNextPage}>
                                <span aria-hidden="true">&#8250;</span>
                            </button>
                        </li>

                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={handleLastPage}
                                    disabled={currentPage === totalPages}>
                                <span aria-hidden="true">&raquo;</span>
                            </button>
                        </li>
                    </ul>
                </nav>

            </div>

            <CouponCreateModal
                isOpen={modalIsOpen}
                onRequestClose={handleModalClose}
                onCreate={() => {
                    fetchCoupons(currentPage, includeInactiveCoupons); // 쿠폰 생성 후 현재 페이지에서 쿠폰 목록 새로고침
                }}
                categories={categories}
            />

            {/* 이메일 모달 추가 */}
            <CouponEmailModal
                isOpen={isEmailModalOpen}
                onRequestClose={handleCloseEmailModal}
                coupon={selectedCoupon}
            />

        </div>
    );
};

export default CouponAdmin;
