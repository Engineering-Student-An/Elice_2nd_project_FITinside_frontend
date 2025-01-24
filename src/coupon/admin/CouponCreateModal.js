import React, { useState } from 'react';
import Modal from 'react-modal';
import sendRefreshTokenAndStoreAccessToken from "../../auth/RefreshAccessToken";
import axios from "axios";

const CouponCreateModal = ({ isOpen, onRequestClose, onCreate, categories }) => {
    const [newCoupon, setNewCoupon] = useState({
        name: '',
        code: '',
        type: '',
        value: 0,
        percentage: 0,
        minValue: 0,
        expiredAt: '',
        categoryId: 0,
    });

    const handleCouponChange = (e) => {
        const { name, value } = e.target;
        setNewCoupon((prev) => ({ ...prev, [name]: value })); // 쿠폰 정보 업데이트
    };

    const handleTypeChange = (e) => {
        setNewCoupon((prev) => ({
            ...prev,
            type: e.target.value,
            value: e.target.value === 'AMOUNT' ? prev.value : 0,
            percentage: e.target.value === 'PERCENTAGE' ? prev.percentage : 0,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`https://obpedvusnf.execute-api.ap-northeast-2.amazonaws.com/api/admin/coupon`, newCoupon, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            alert('쿠폰을 생성했습니다!');
            onCreate(); // 쿠폰 생성 후 부모 컴포넌트에게 알리기

            // 상태 초기화
            setNewCoupon({
                name: '',
                code: '',
                type: '',
                value: 0,
                percentage: 0,
                minValue: 0,
                expiredAt: '',
                categoryId: 0,
            });

            onRequestClose(); // 모달 닫기
        } catch (error) {
            try {
                await sendRefreshTokenAndStoreAccessToken();

                // 토큰 갱신 후 다시 요청
                const response = await axios.post(`https://obpedvusnf.execute-api.ap-northeast-2.amazonaws.com/api/admin/coupon`, newCoupon, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`, // 갱신된 토큰 사용
                        'Content-Type': 'application/json'
                    }
                });

                alert('쿠폰을 생성했습니다!');
                onCreate(); // 쿠폰 생성 후 부모 컴포넌트에게 알리기

                // 상태 초기화
                setNewCoupon({
                    name: '',
                    code: '',
                    type: '',
                    value: 0,
                    percentage: 0,
                    minValue: 0,
                    expiredAt: '',
                    categoryId: 0,
                });

                onRequestClose(); // 모달 닫기
            } catch (e) {
                alert('유효하지 않은 입력입니다!');
            }
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
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
                    <h2 className="mb-4">쿠폰 추가</h2>
                    <button onClick={onRequestClose} style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        marginTop: '-30px'
                    }}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">쿠폰 이름</label>
                        <input type="text" className="form-control" name="name" value={newCoupon.name}
                               onChange={handleCouponChange} required/>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">쿠폰 타입</label>
                        <div>
                            <label className="me-3">
                                <input type="radio" name="type" value="AMOUNT" checked={newCoupon.type === 'AMOUNT'}
                                       onChange={handleTypeChange}/> 고정 금액 할인
                            </label>
                            <label>
                                <input type="radio" name="type" value="PERCENTAGE"
                                       checked={newCoupon.type === 'PERCENTAGE'}
                                       onChange={handleTypeChange}/> 퍼센티지 할인
                            </label>
                        </div>
                    </div>
                    {newCoupon.type === 'AMOUNT' && (
                        <div className="mb-3">
                            <label className="form-label me-2">할인 가격 (원)</label>
                            <input className="form-control" type="number" name="value" min="0" value={newCoupon.value}
                                   onChange={handleCouponChange} required/>
                        </div>
                    )}
                    {newCoupon.type === 'PERCENTAGE' && (
                        <div className="mb-3">
                            <label className="form-label me-2">할인 퍼센티지 (%)</label>
                            <input className="form-control" type="number" name="percentage" min="0" max="100"
                                   value={newCoupon.percentage}
                                   onChange={handleCouponChange} required/>
                        </div>
                    )}
                    <div className="mb-3">
                        <label className="form-label me-2">최소 주문 금액 (원)</label>
                        <input className="form-control" type="number" name="minValue" min="0" value={newCoupon.minValue}
                               onChange={handleCouponChange} required/>
                    </div>
                    <div className="mb-3">
                        <label className="form-label me-2">쿠폰 만료일</label>
                        <input className="form-control" type="date" name="expiredAt" value={newCoupon.expiredAt}
                               onChange={handleCouponChange} required/>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">적용 가능 카테고리</label>
                        <select className="form-select" name="categoryId" value={newCoupon.categoryId}
                                onChange={handleCouponChange} required>
                            <option value="0">모든 카테고리</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="text-center">
                        <button type="submit" className="btn btn-primary">생성</button>
                    </div>
                </form>
        </Modal>
);
};

export default CouponCreateModal;