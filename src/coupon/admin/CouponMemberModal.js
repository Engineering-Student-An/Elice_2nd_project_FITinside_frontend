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
            const response = await axios.get(`http://localhost:8080/api/admin/coupons/${id}`, {
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
                const response = await axios.get(`http://localhost:8080/api/admin/coupons/${id}`, {
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
                <button
                    className="btn btn-secondary me-2" // 부트스트랩 버튼 스타일 및 오른쪽 여백
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                >
                    이전
                </button>
                <span className="mx-3"> {/* 텍스트 간격을 위한 여백 추가 */}
                    {currentPage} / {totalPages}
    </span>
                <button
                    className="btn btn-primary ms-2" // 부트스트랩 버튼 스타일 및 왼쪽 여백
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                >
                    다음
                </button>
            </div>

        </Modal>
    );
};

export default CouponMemberModal;
