import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import sendRefreshTokenAndStoreAccessToken from "../../auth/RefreshAccessToken";
import axios from "axios";

const CouponMemberModal = ({ isMemberModalOpen, handleCloseMemberModal, couponId }) => {
    const [memberModalData, setMemberModalData] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchMembers = async (id, page) => {
        try {
            const response = await axios.get(`/fr/api/admin/coupons/${id}`, {
                params: {
                    page: page
                },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });

            setMemberModalData(response.data);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            try {
                await sendRefreshTokenAndStoreAccessToken();

                // 토큰 갱신 후 다시 요청
                const response = await axios.get(`/fr/api/admin/coupons/${id}`, {
                    params: {
                        page: page // 페이지 파라미터 재전송
                    },
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // 갱신된 토큰 사용
                    },
                });

                setMemberModalData(response.data);
                setTotalPages(response.data.totalPages);
            } catch (e) {
                console.error(error.message);
            }
        }
    };

    useEffect(() => {
        if (isMemberModalOpen && couponId) {
            fetchMembers(couponId, currentPage);
        }
    }, [isMemberModalOpen, couponId, currentPage]);

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

    return (
        <Modal
            isOpen={isMemberModalOpen}
            onRequestClose={handleCloseMemberModal}
            ariaHideApp={false}
            style={{
                content: {
                    maxWidth: `50%`,
                    maxHeight: `70%`,
                    margin: 'auto',
                    padding: '0 40px 40px 40px',
                    borderRadius: '10px'
                },
                overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    zIndex: '100'
                }
            }}
        >
            <div className="modal-header d-flex justify-content-between align-items-center">
                <h2 className="text-center mb-4">보유 회원 목록</h2>
                <button onClick={handleCloseMemberModal} style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    marginTop: '-30px',
                }}>&times;</button>
            </div>

            {/* 모달 내용 */}
            <div style={{flex: 1, overflowY: 'auto'}}> {/* 내용이 많아질 경우 스크롤 가능 */}
                {memberModalData ? (
                    <div>
                        {memberModalData.members && memberModalData.members.length > 0 ? (
                            <ol>
                                {memberModalData.members.map((member, index) => (
                                    <li key={index}>
                                        <p>{member.userName} ({member.email})</p>
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <strong>보유한 회원이 없습니다.</strong>
                        )}
                    </div>
                ) : (
                    <p>로딩 중...</p>
                )}
            </div>

            {/* 페이징 버튼을 모달 하단에 위치시키기 */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'absolute',
                bottom: '30px',
                left: '20px',
                right: '20px'
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

        </Modal>
    );
};

export default CouponMemberModal;
