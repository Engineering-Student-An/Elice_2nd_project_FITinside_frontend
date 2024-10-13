import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import DeliveryForm from './DeliveryForm';
import './orderDetail.css';

const statusOptions = [
    { value: 'ORDERED', label: '주문 완료' },
    { value: 'COMPLETED', label: '배송 완료' },
    { value: 'CANCELLED', label: '주문 취소' }
];

// 주문 상태를 한글로 변환
const getStatusLabel = (statusValue) => {
    const status = statusOptions.find(option => option.value === statusValue);
    return status ? status.label : statusValue;
};

const OrderDetail = () => {
    const { orderId } = useParams(); // URL에서 orderId를 직접 가져오기
    const [orderDetail, setOrderDetail] = useState(null);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [deliveryData, setDeliveryData] = useState({});
    const formRef = useRef(null); // DeliveryForm을 참조할 수 있도록 설정

    useEffect(() => {
        // 주문 상세 정보를 가져오는 API 호출
        const fetchOrderDetail = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:8080/api/orders/${orderId}`, {
                    headers: {
                        Authorization: `Bearer ${token}` // 토큰을 인증 헤더에 추가
                    }
                });

                setOrderDetail(response.data);
                setDeliveryData({
                    deliveryAddress: response.data.deliveryAddress,
                    deliveryReceiver: response.data.deliveryReceiver,
                    deliveryPhone: response.data.deliveryPhone,
                });
            } catch (err) {
                console.error('주문 상세 정보 불러오기 실패:', err.response ? err.response.data : err.message);
                setError('주문 정보를 불러오는 중 오류가 발생했습니다.');
            }
        };

        fetchOrderDetail();
    }, [orderId]);

    const handleEditClick = () => {
        // isEditing 상태가 변경될 때 deliveryData를 최신 orderDetail 정보로 설정
        setDeliveryData({
            deliveryAddress: orderDetail.deliveryAddress,
            deliveryReceiver: orderDetail.deliveryReceiver,
            deliveryPhone: orderDetail.deliveryPhone,
        });
        setIsEditing(true);
    };

    const handleSaveClick = async () => {
        // DeliveryForm의 최신 폼 데이터를 가져옴
        const updatedData = formRef.current.getFormData();
        console.log('저장할 데이터:', updatedData); // 최신 데이터 확인을 위한 로그

        try {
            const token = localStorage.getItem('token');
            const response = await axios.patch(`http://localhost:8080/api/orders/${orderId}`, updatedData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setOrderDetail(response.data);
            setDeliveryData({
                deliveryAddress: response.data.deliveryAddress,
                deliveryReceiver: response.data.deliveryReceiver,
                deliveryPhone: response.data.deliveryPhone,
            }); // 업데이트된 데이터를 deliveryData에 반영
            setIsEditing(false); // 수정 완료 후 편집 모드 종료
        } catch (err) {
            console.error('주문 수정 실패:', err.response ? err.response.data : err.message);
            alert('주문 수정에 실패했습니다. 다시 시도해주세요.');
        }
    };

    const handleCancelEditClick = () => {
        setIsEditing(false); // 편집 모드 종료
    };

    const handleCancelClick = async () => {
        const confirmCancel = window.confirm('주문을 취소하시겠습니까?');
        if (!confirmCancel) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/api/orders/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // 주문 취소 후 다시 주문 상세 정보를 가져와서 갱신
            const response = await axios.get(`http://localhost:8080/api/orders/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setOrderDetail(response.data);
            alert('주문이 취소되었습니다.');
        } catch (err) {
            console.error('주문 취소 실패:', err.response ? err.response.data : err.message);
            alert('주문 취소에 실패했습니다. 다시 시도해주세요.');
        }
    };

    if (error) {
        return <div>{error}</div>;
    }

    if (!orderDetail) {
        return <div className="spinner">Loading...</div>;
    }

    return (
        <div className="order-detail-container">
            <div className="order-title">주문상세내역</div>
            <div className="order-date-info">
                {new Date(orderDetail.createdAt).toLocaleDateString()}에 주문하신 상세 내역입니다.
            </div>

            <h3 className="order-section-header">주문상품정보</h3>
            <table className="order-info-table">
                <thead>
                <tr>
                    <th>주문상품정보</th>
                    <th>수량</th>
                    <th>판매금액</th>
                    <th>총금액</th>
                    <th>배송비</th>
                    <th>결제금액</th>
                    <th>진행상태</th>
                    <th>비고</th>
                </tr>
                </thead>
                <tbody>
                    {orderDetail.orderProducts && orderDetail.orderProducts.map((product, index) => (
                        <tr key={product.productId}>
                            <td>{product.orderProductName}</td>
                            <td>{product.count}</td>
                            <td>{(product.orderProductPrice * product.count).toLocaleString()}원</td>
                            {index === 0 && ( /* 첫 번째 상품에서만 셀 병합하여 총금액 및 배송비 표시 */
                                <>
                                    <td rowSpan={orderDetail.orderProducts.length}>
                                        {(orderDetail.totalPrice).toLocaleString()}원
                                    </td>
                                    <td rowSpan={orderDetail.orderProducts.length}>
                                        {orderDetail.deliveryFee.toLocaleString()}원
                                    </td>
                                    <td rowSpan={orderDetail.orderProducts.length}>
                                        {(orderDetail.totalPrice + orderDetail.deliveryFee).toLocaleString()}원
                                    </td>
                                    <td rowSpan={orderDetail.orderProducts.length}>
                                        {getStatusLabel(orderDetail.orderStatus)}
                                    </td>
                                    <td rowSpan={orderDetail.orderProducts.length}>
                                        <button
                                            className="btn-custom"
                                            onClick={handleCancelClick}
                                            disabled={getStatusLabel(orderDetail.orderStatus) !== '주문 완료'}
                                        >
                                            주문취소
                                        </button>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="order-summary">
                총 결제금액 <span className="total-amount">{(orderDetail.totalPrice + orderDetail.deliveryFee).toLocaleString()}원</span>
            </div>

            <h3 className="order-section-header">
                배송정보
                <button
                    className="edit-delivery-button"
                    onClick={handleEditClick}
                    disabled={getStatusLabel(orderDetail.orderStatus) !== '주문 완료'}
                >
                    배송지 변경
                </button>
            </h3>

            {isEditing ? (
                <div className="edit-delivery-section">
                    <DeliveryForm
                        ref={formRef}
                        onSubmit={(data) => setDeliveryData(data)}
                        initialValues={deliveryData} // 기존 배송 정보 전달
                    />
                    <div className="order-actions">
                        <button className="btn-custom" onClick={handleCancelEditClick}>취소</button>
                        <button className="btn-custom" onClick={handleSaveClick}>수정완료</button>
                    </div>
                </div>
            ) : (
                <table className="delivery-info-table">
                    <tbody>
                    <tr>
                        <th>받으시는 분</th>
                        <td className="receiver-info">
                            {orderDetail.deliveryReceiver} / {orderDetail.deliveryPhone}
                            <br />
                            {orderDetail.deliveryAddress}
                        </td>
                    </tr>
                    </tbody>
                </table>
            )}

            <h3 className="order-section-header">결제금액</h3>
            <table className="payment-info-table">
                <tbody>
                <tr>
                    <th>주문금액</th>
                    <td>{(orderDetail.totalPrice).toLocaleString()}원</td>
                </tr>
                <tr>
                    <th>배송비</th>
                    <td>{(orderDetail.deliveryFee).toLocaleString()}원</td>
                </tr>
                <tr>
                    <th>총 결제금액</th>
                    <td style={{ color: '#B22222' }}>{(orderDetail.totalPrice + orderDetail.deliveryFee).toLocaleString()}원</td>
                </tr>
                </tbody>
            </table>
        </div>
    );
};

export default OrderDetail;