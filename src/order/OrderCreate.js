import React, { useState, useEffect, useRef } from 'react';
import DeliveryForm from "./DeliveryForm";
import AddressModal from '../address/AddressModal';
import axios from 'axios';
import '../cart/cart.css';
import './orderCreate.css';
import sendRefreshTokenAndStoreAccessToken from "../auth/RefreshAccessToken";

const OrderCreate = () => {
    const [orderItems, setOrderItems] = useState([]); // 장바구니와 상품 정보
    const [deliveryFee, setDeliveryFee] = useState(0); // 배송비
    const [totalOriginalPrice, setTotalOriginalPrice] = useState(0); // 할인 전 총 금액
    const [totalDiscountedPrice, setTotalDiscountedPrice] = useState(0); // 할인된 총 금액
    const [productDetails, setProductDetails] = useState({}); // 상품 이미지
    const deliveryFormRef = useRef(null); // DeliveryForm을 참조
    const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태
    const [saveAsDefault, setSaveAsDefault] = useState(false); // 기본 배송지로 저장 여부 상태

    // 장바구니 데이터와 배송비, 할인가격 로컬 스토리지에서 가져오기
    useEffect(() => {
        const storedOrderData = JSON.parse(localStorage.getItem('orderData')) || [];
        const storedShippingCost = JSON.parse(localStorage.getItem('shippingCost')) || 0;
        setOrderItems(storedOrderData); // 장바구니 데이터
        setDeliveryFee(storedShippingCost); // 배송비

        // 총 금액과 할인된 금액 계산
        const totalOriginal = storedOrderData.reduce((acc, item) => acc + item.originalTotalPrice, 0);
        const totalDiscounted = storedOrderData.reduce((acc, item) => acc + item.discountedTotalPrice, 0);
        setTotalOriginalPrice(totalOriginal);
        setTotalDiscountedPrice(totalDiscounted);

        // 각 상품의 이미지 정보 가져오기
        const fetchProductDetails = async () => {
            const details = {};
            for (const item of storedOrderData) {
                try {
                    const response = await axios.get(`http://localhost:8080/api/products/${item.productId}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    details[item.productId] = response.data; // 상품 상세 정보를 저장
                } catch (error) {
                    console.error('상품 조회 실패', error);
                }
            }
            setProductDetails(details); // 상태 업데이트
        };
        if (storedOrderData.length > 0) {
            fetchProductDetails();
        }
    }, []);

    // 배송지 선택 시 폼에 입력되도록 처리
    const handleAddressSelect = (address) => {
        setIsModalOpen(false); // 모달 닫기
        deliveryFormRef.current.setFormData(address); // 선택된 주소 정보를 폼에 반영
    };

    const handleOrderSubmit = async () => {
        const deliveryData = deliveryFormRef.current.getFormData(); // DeliveryForm의 데이터 가져오기
        deliveryData.saveAsDefault = saveAsDefault; // 체크박스 상태 추가

        console.log("넘겨질 배송 데이터: ", deliveryData);
        console.log("선택한 주문 아이템: ", JSON.stringify(orderItems, null, 2));

        if (!deliveryData || Object.keys(deliveryData).length === 0) {
            alert('배송 정보를 입력해주세요.');
            return;
        }

        submitOrder(deliveryData);
    };

    const submitOrder = async (deliveryData, retry = false) => {
        try {
            const token = localStorage.getItem('token');

            // 1. 배송지 추가
            if (saveAsDefault) { // 체크박스가 체크된 경우에만 주소 추가
                try {
                    const addressResponse = await axios.post('http://localhost:8080/api/addresses', deliveryData, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    console.log("배송지 추가 완료: ", addressResponse.data);
                } catch (addressError) {
                    if (addressError.response) {
                        alert(addressError.response.data.message); // 중복된 주소, 저장 개수 초과, ..
                    } else {
                        alert("배송지 추가 중 오류가 발생했습니다.");
                    }
                    return; // 배송지 추가 실패 시 주문을 진행하지 않음
                }
            }

            console.log('배송지 추가 로직 완료');

            // 2. 주문 생성
            const response = await axios.post('http://localhost:8080/api/order', {
                ...deliveryData,
                orderItems,
                deliveryFee,
            }, { headers: { 'Authorization': `Bearer ${token}` } });
            alert('주문이 완료되었습니다.');

            localStorage.removeItem('orderData');
            localStorage.removeItem('shippingCost');

            // localCart에서 주문된 상품 삭제
            const storedLocalCart = JSON.parse(localStorage.getItem('localCart')) || [];
            const updatedLocalCart = storedLocalCart.filter(item =>
                !orderItems.some(orderItem => orderItem.productId === item.id)
            );
            localStorage.setItem('localCart', JSON.stringify(updatedLocalCart)); // 주문되지 않은 상품은 유지

            // dbCart에서 주문된 상품 삭제
            const storedDbCart = JSON.parse(localStorage.getItem('dbCart')) || [];
            const updatedDbCart = storedDbCart.filter(item =>
                !orderItems.some(orderItem => orderItem.productId === item.id)
            );
            localStorage.setItem('dbCart', JSON.stringify(updatedDbCart)); // 주문되지 않은 상품은 유지

            // localStorage.removeItem('deliveryFormData');
            window.location.href = `/orders/${response.data.orderId}`;
        } catch (error) {
            if (error.response && error.response.status === 401 && !retry) {
                try {
                    await sendRefreshTokenAndStoreAccessToken(); // 토큰 갱신
                    submitOrder(deliveryData, true); // 갱신 후 재시도
                } catch (error) {
                    console.error('토큰 갱신 실패:', error);
                    alert('사용자 정보를 가져오는 데 실패했습니다.');
                }
            } else {
                console.error('주문 실패 ', error);
                alert('주문을 처리하는 중 오류가 발생했습니다.');
            }
        }
    };

    const discountAmount = totalOriginalPrice - totalDiscountedPrice; // 할인 금액 계산
    const totalPayment = totalDiscountedPrice + deliveryFee; // 최종 결제 금액 계산

    return (
        <div className="container order-create-container my-5">
            <h2>주문서</h2>
            <br />
            <div className="both-container">
                <div className="left-container">
                    <table className="table">
                        <thead>
                        <tr>
                            <th>상품정보</th>
                            <th>상품금액</th>
                        </tr>
                        </thead>
                        <tbody>
                        {orderItems.map((item, index) => (
                            <tr key={index}>
                                <td className="product-info">
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        {productDetails[item.productId] && productDetails[item.productId].productImgUrls && (
                                            <img
                                                style={{ width: '100px', height: '100px', marginRight: '10px' }}
                                                src={productDetails[item.productId].productImgUrls[0]}
                                                alt={item.productName}
                                            />
                                        )}
                                        <div>
                                            <p className="product-name">{item.productName}</p>
                                            <p className="product-quantity">수량: {item.quantity}</p>
                                            {item.couponName && <p className="coupon-info">적용된 쿠폰 [{item.couponName}]</p>}
                                        </div>
                                    </div>
                                </td>
                                <td className="product-price">
                                    {item.originalTotalPrice !== item.discountedTotalPrice ? (
                                        <div>
                                            <p style={{ textDecoration: 'line-through', marginBottom: '5px' }}>
                                                {item.originalTotalPrice.toLocaleString()} 원
                                            </p>
                                            <p style={{ color: '#B22222' }}>
                                                {item.discountedTotalPrice.toLocaleString()} 원
                                            </p>
                                        </div>
                                    ) : (
                                        <p>{item.originalTotalPrice.toLocaleString()} 원</p>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <DeliveryForm ref={deliveryFormRef} onAddressSelect={() => setIsModalOpen(true)}/>

                    {/* 기본 배송지 선택 모달 */}
                    <AddressModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSelect={handleAddressSelect} />

                    {/* 기본 배송지로 저장 체크박스 */}
                    <div className="form-check" style={{ marginTop: '10px' }}>
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="saveAsDefault"
                            checked={saveAsDefault}
                            onChange={(e) => setSaveAsDefault(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="saveAsDefault" style={{ marginLeft: '8px' }}>
                            이 주소를 기본 배송지로 저장
                        </label>
                    </div>

                </div>

                <div className="right-container">
                    <div className="order-summary-box">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <p>총 상품 금액 ({orderItems.length})</p>
                            <p>{totalOriginalPrice.toLocaleString()} 원</p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <p>할인 금액</p>
                            <p style={{ color: '#B22222' }}>- {discountAmount.toLocaleString()} 원</p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <p>배송비</p>
                            <p>{deliveryFee === 0 ? '무료' : `${deliveryFee.toLocaleString()} 원`}</p>
                        </div>
                        <hr />
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong>총 결제 금액</strong>
                            <strong style={{ color: '#B22222' }}>{totalPayment.toLocaleString()} 원</strong>
                        </div>
                    </div>
                    <button className="btn-custom place-order-button" onClick={handleOrderSubmit}>
                        결제하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderCreate;