import React, { useEffect, useState } from 'react';
import sendRefreshTokenAndStoreAccessToken from '../auth/RefreshAccessToken';
import './addressModal.css';
import {apiClient} from "../apiClient";

const AddressModal = ({ isOpen, onClose, onSelect, onEdit, selectedAddressId }) => {
    const [addresses, setAddresses] = useState([]);

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                if (isOpen) {
                    const response = await apiClient.get(`/api/addresses`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    setAddresses(response.data);
                }
            } catch (error) {
                try {
                    // 토큰 갱신 후 다시 데이터 불러오기
                    await sendRefreshTokenAndStoreAccessToken();

                    if (isOpen) {
                        const response = await apiClient.get(`/api/addresses`, {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        });
                        setAddresses(response.data);
                    }
                } catch (error) {
                    console.error('배송지 조회 실패', error);
                }
            }
        };

        fetchAddresses();
    }, [isOpen]);

    // 콘솔 로그로 selectedAddressId 값 확인
    console.log("Selected Address ID:", selectedAddressId);

    if (!isOpen) return null;

    const handleSelect = (address) => {
        console.log('모달에서 선택한 주소 정보: ', address);
        onSelect(address); // 선택한 주소를 상위 컴포넌트로 전달
        onClose(); // 모달 닫기
    };

    const handleEdit = (address) => {
        console.log('수정할 주소 정보: ', address);
        onEdit(address); // 선택한 주소 데이터를 수정하기 위해 상위 컴포넌트로 전달
        onClose(); // 모달 닫기
    };

    return (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-lg" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">저장된 배송지 목록</h5>
                    </div>
                    <div className="modal-body">
                        {addresses.length > 0 ? (
                            <ul className="list-group">
                                {addresses.map((address) => (
                                    <li
                                        key={address.addressId}
                                        className={`list-group-item ${address.addressId === selectedAddressId ? 'selected-address' : ''}`}
                                    >
                                        <div className="d-flex justify-content-between align-items-center">
                                            <strong>{address.deliveryReceiver}</strong>
                                            <div>
                                                <button className="btn btn-sm btn-outline-secondary"
                                                        style={{ marginRight: '8px' }}
                                                        onClick={() => handleEdit(address)}
                                                >수정</button>
                                                <button className="btn btn-sm btn-outline-primary" onClick={() => handleSelect(address)}>선택</button>
                                            </div>
                                        </div>
                                        <p className="mb-1">{address.deliveryPhone}</p>
                                        <p className="mb-1">{address.postalCode}</p>
                                        <p className="mb-1">{address.deliveryAddress}, {address.detailedAddress}</p>
                                        {address.deliveryMemo && <p className="text-muted small mb-0">{address.deliveryMemo}</p>}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-muted">등록된 배송지가 없습니다.</p>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>닫기</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddressModal;
