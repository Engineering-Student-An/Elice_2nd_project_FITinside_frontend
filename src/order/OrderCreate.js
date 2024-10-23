import React, {useEffect, useRef, useState} from 'react';
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
    // const [saveAsDefault, setSaveAsDefault] = useState(false); // 기본 배송지로 저장 여부 상태
    const [hasDefaultAddress, setHasDefaultAddress] = useState(false); // 기본 배송지 존재 여부
    const [selectedAddressId, setSelectedAddressId] = useState(null); // 선택된 주소 ID 저장
    const [defaultAddress, setDefaultAddress] = useState("N"); // 선택된 주소가 기본 배송지인지 확인
    const [addressCount, setAddressCount] = useState(0); // 저장된 배송지 개수
    const [isAddressEdited, setIsAddressEdited] = useState(false); // 주소가 수정된 경우를 추적하는 상태 추가


    // 장바구니 데이터와 배송비, 할인가격 로컬 스토리지에서 가져오기
    // 기본 배송지가 있는지 조회
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
                    const response = await axios.get(`https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/products/${item.productId}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    details[item.productId] = response.data; // 상품 상세 정보를 저장
                } catch(err) {
                    try {
                        await sendRefreshTokenAndStoreAccessToken();

                        const response = await axios.get(`https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/products/${item.productId}`, {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        });
                        details[item.productId] = response.data; // 상품 상세 정보를 저장
                    } catch (error) {
                        console.error('상품 조회 실패', error);
                    }
                }
            }
            setProductDetails(details); // 상태 업데이트
        };

        // 기본 배송지 조회
        const fetchDefaultAddress = async () => {
            try {
                const response = await axios.get('https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/addresses/default', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.data) {
                    // 기본 배송지가 있는 경우 폼에 출력하고 readOnly 상태로
                    deliveryFormRef.current.setFormData(response.data);
                    setHasDefaultAddress(true);
                    setSelectedAddressId(response.data.addressId); // 기본 배송지 ID 설정
                    console.log("기본 배송지 ID 설정:", response.data.addressId); // 기본 배송지 ID 확인
                    setDefaultAddress("Y"); // 기본 배송지 상태 설정
                    deliveryFormRef.current.setIsDefaultAddress(true); // 기본 배송지임을 설정
                    deliveryFormRef.current.setIsReadOnly(true);
                } else {
                    // 기본 배송지가 없는 경우
                    console.log("기본 배송지 없음");
                    setHasDefaultAddress(false);
                    deliveryFormRef.current.setIsDefaultAddress(false);
                    deliveryFormRef.current.setIsReadOnly(false);
                }
            } catch (err) {
                try {
                    await sendRefreshTokenAndStoreAccessToken();

                    const response = await axios.get('https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/addresses/default', {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });

                    if (response.data) {
                        // 기본 배송지가 있는 경우 폼에 출력하고 readOnly 상태로
                        deliveryFormRef.current.setFormData(response.data);
                        setHasDefaultAddress(true);
                        setSelectedAddressId(response.data.addressId); // 기본 배송지 ID 설정
                        console.log("기본 배송지 ID 설정:", response.data.addressId); // 기본 배송지 ID 확인
                        setDefaultAddress("Y"); // 기본 배송지 상태 설정
                        deliveryFormRef.current.setIsDefaultAddress(true); // 기본 배송지임을 설정
                        deliveryFormRef.current.setIsReadOnly(true);
                    } else {
                        // 기본 배송지가 없는 경우
                        console.log("기본 배송지 없음");
                        setHasDefaultAddress(false);
                        deliveryFormRef.current.setIsDefaultAddress(false);
                        deliveryFormRef.current.setIsReadOnly(false);
                    }
                } catch (error) {
                    console.error('기본 배송지 조회 실패', error);
                    setHasDefaultAddress(false);
                    deliveryFormRef.current.setIsDefaultAddress(false);
                }
            }
        };

        // 배송지 목록 조회
        const fetchAddressList = async () => {
            try {
                const response = await axios.get('https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/addresses', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setAddressCount(response.data.length); // 저장된 배송지 개수 업데이트
            } catch (err) {
                try {
                    await sendRefreshTokenAndStoreAccessToken();

                    const response = await axios.get('https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/addresses', {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    setAddressCount(response.data.length); // 저장된 배송지 개수 업데이트
                } catch (error) {
                    console.error('배송지 목록 조회 실패', error);
                }
            }
        };

        // 기본 배송지 조회 및 상품 정보 조회 동시 처리
        if (storedOrderData.length > 0) {
            fetchProductDetails();
        }

        fetchDefaultAddress(); // 기본 배송지 조회
        fetchAddressList(); // 저장된 배송지 목록 조회
    }, []);

    // 배송지 선택 시 폼에 입력되도록 처리
    const handleAddressSelect = (address) => {
        setIsModalOpen(false); // 모달 닫기
        deliveryFormRef.current.setFormData(address); // 선택된 주소 정보를 폼에 반영
        setSelectedAddressId(address.addressId); // 선택된 주소 ID 설정
        console.log("선택한 주소 ID:", address.addressId); // 선택한 주소 ID 확인
        // setDefaultAddress(address.defaultAddress); // 선택한 주소가 기본 배송지인지 확인
        setIsAddressEdited(false);

        deliveryFormRef.current.setIsReadOnly(true);

        // 선택한 주소가 기본 배송지인지 여부를 확인하고 상태 업데이트
        if (address.defaultAddress === "Y") {
            setDefaultAddress("Y");
            deliveryFormRef.current.setIsDefaultAddress(true);
        } else {
            setDefaultAddress("N");
            deliveryFormRef.current.setIsDefaultAddress(false);
        }
    };

    // 새 배송지 입력을 위한 폼 초기화 함수
    const handleNewAddress = () => {
        if (addressCount >= 5) {
            alert('배송지는 5개까지 저장가능합니다. 기존의 배송지를 수정 후 진행해주세요.');
            return; // 배송지 개수가 5개 이상일 경우 폼 초기화하지 않음
        }
        deliveryFormRef.current.clearFormData(); // 폼을 초기화하고 수정 가능 상태로 설정
        setSelectedAddressId(null); // 새 주소를 입력하므로 기존 선택된 주소 해제
        setDefaultAddress("N"); // 새 주소는 기본 배송지가 아님
        // setSaveAsDefault(false); // 새 주소 입력 시 기본 배송지로 저장하지 않도록 초기화
        setIsAddressEdited(false);
        deliveryFormRef.current.setIsDefaultAddress(false); // 새 배송지 입력 시 체크박스 표시
    };

    // 모달창에서 수정 클릭 시
    const handleEditAddress = (address) => {
        setIsModalOpen(false); // 모달 닫기
        setSelectedAddressId(address.addressId); // 수정할 주소 ID 저장
        setIsAddressEdited(true); // 주소가 수정되었음을 설정
        deliveryFormRef.current.setFormData(address); // 수정할 주소 정보를 폼에 로드
        deliveryFormRef.current.setIsDefaultAddress(address.defaultAddress === "Y"); // 기본 배송지 여부 설정

        // 수정 버튼을 눌렀을 때는 readOnly 해제
        console.log("handleEditAddress에서 isReadOnly 설정: false");
        deliveryFormRef.current.setIsReadOnly(false);
    };

    const handleOrderSubmit = async () => {
        const deliveryData = deliveryFormRef.current.getFormData(); // DeliveryForm의 데이터 가져오기

        // 유효성 검사
        if (!deliveryData) {
            alert('배송 정보를 입력해주세요.');
            return;
        }

        deliveryData.defaultAddress = deliveryData.saveAsDefault ? "Y" : "N"; // 폼에서 기본 배송지 여부 가져오기

        console.log("넘겨질 배송 데이터: ", deliveryData);

        let addressResponse = null;

        // 배송지 수정 여부에 따라 추가 또는 수정 로직 수행
        if (!isAddressEdited) { // 배송지 선택 또는 새 배송지 추가
            addressResponse = await addAddress(deliveryData);
        } else { // 기존 배송지 수정
            addressResponse = await updateAddress(deliveryData);
        }

        // 배송지 추가 또는 수정이 실패한 경우 주문 생성하지 않음
        if (!addressResponse) {
            console.error("배송지 추가/수정 실패로 인해 주문이 중단되었습니다.");
            return;
        }

        // 배송지 추가 또는 수정이 성공하면 주문 생성
        await createOrder(deliveryData);

    };


    // 배송지 추가
    const addAddress = async (deliveryData) => {
        try {
            const token = localStorage.getItem('token');
            const addressResponse = await axios.post('https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/addresses', deliveryData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log("배송지 추가 완료: ", addressResponse.data);
            return addressResponse.data; // 성공적으로 추가된 주소 데이터를 반환
        } catch (error) {
            try {
                await sendRefreshTokenAndStoreAccessToken();

                const token = localStorage.getItem('token');
                const addressResponse = await axios.post('https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/addresses', deliveryData, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log("배송지 추가 완료: ", addressResponse.data);
                return addressResponse.data; // 성공적으로 추가된 주소 데이터를 반환
            } catch (addressError) {
                if (addressError.response) {
                    alert(addressError.response.data.message); // 중복된 주소, 저장 개수 초과 등 처리
                } else {
                    alert("배송지 추가 중 오류가 발생했습니다.");
                }
                return null; // 오류 발생 시 null을 반환
            }
        }
    };

    // 배송지 수정
    const updateAddress = async (deliveryData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.patch(`https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/addresses/${selectedAddressId}`, deliveryData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log("배송지 수정 완료: ", response.data);
            return response.data;
        } catch (err) {
            try {
                await sendRefreshTokenAndStoreAccessToken();

                const token = localStorage.getItem('token');
                const response = await axios.patch(`https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/addresses/${selectedAddressId}`, deliveryData, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log("배송지 수정 완료: ", response.data);
                return response.data;
            } catch (error) {
                console.error("배송지 수정 실패: ", error);
                alert("배송지 수정 중 오류가 발생했습니다.");
                return null; // 오류 발생 시 null을 반환
            }
        }
    };

    // 주문 생성
    const createOrder = async (deliveryData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/order', {
                ...deliveryData, // 배송지 데이터 추가
                orderItems,
                deliveryFee,
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
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
        } catch (err) {
            try {
                await sendRefreshTokenAndStoreAccessToken();

                const token = localStorage.getItem('token');
                const response = await axios.post('https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/order', {
                    ...deliveryData, // 배송지 데이터 추가
                    orderItems,
                    deliveryFee,
                }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
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
                console.error('주문 생성 실패 ', error);
                alert('주문을 처리하는 중 오류가 발생했습니다.');
            }
        }
    };

    const discountAmount = totalOriginalPrice - totalDiscountedPrice; // 할인 금액 계산
    const totalPayment = totalDiscountedPrice + deliveryFee; // 최종 결제 금액 계산

    return (
        <div className="container order-create-container my-5">
            <h2>주문서</h2>
            <br/>
            <div className="both-container" style={{ paddingTop: '0px', marginTop: '30px' }}>
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
                                                src={
                                                productDetails[item.productId].productImgUrls.length > 0 ?
                                                    productDetails[item.productId].productImgUrls[0]
                                                    : "/img/logo100x100.png"
                                            }
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

                    <DeliveryForm
                        ref={deliveryFormRef}
                        showDefaultSelect={!hasDefaultAddress}
                        onAddressSelect={() => setIsModalOpen(true)}
                        onNewAddress={handleNewAddress}
                    />

                    {/* 기본 배송지 선택 모달 */}
                    <AddressModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSelect={handleAddressSelect}
                        onEdit={handleEditAddress}
                        selectedAddressId={selectedAddressId} // 선택된 주소 ID를 모달에 전달
                    />

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