import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import {getCart, removeFromCart, clearCart, fetchProduct, useCartCount, updateCartQuantity} from './cartStorage';
import AvailableCouponModal from '../coupon/AvailableCouponModal';
import './cart.css';
import sendRefreshTokenAndStoreAccessToken from "../auth/RefreshAccessToken";
import axios from "axios";


const Cart = () => {
    const [cart, setCart] = useState([]);
    const [productDetails, setProductDetails] = useState({});
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [showCouponModal, setShowCouponModal] = useState(false);
    const [currentProductCoupons, setCurrentProductCoupons] = useState([]);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [totalDiscount, setTotalDiscount] = useState(0);
    const [appliedCoupons, setAppliedCoupons] = useState([]); // 여러 쿠폰 상태 추가
    const [outOfStockCount, setOutOfStockCount] = useState(0); // 재고가 0인 상품 수 추가


    useEffect(() => {
        setCart(getCart());
    }, []);

    useEffect(() => {
        const fetchAllProducts = async () => {
            const details = {};
            for (const item of cart) {
                const productData = await fetchProduct(item.id);
                if (productData) {
                    details[item.id] = productData;
                }
            }
            setProductDetails(details);
        };

        if (cart.length > 0) {
            fetchAllProducts();
        }
    }, [cart]);

    useEffect(() => {
        // 재고가 0인 상품 수 계산
        const countOutOfStockItems = cart.filter(item => productDetails[item.id]?.stock === 0).length;
        setOutOfStockCount(countOutOfStockItems);
    }, [cart, productDetails]);

    const handleRemoveFromCart = (id) => {
        // 장바구니에서 상품 제거
        removeFromCart(id);
        setCart(getCart());

        // 선택된 아이템에서 제거
        const updatedSelectedItems = new Set(selectedItems);
        updatedSelectedItems.delete(id);
        setSelectedItems(updatedSelectedItems);

        // 해당 상품에 적용된 쿠폰 제거
        const couponsToRemove = appliedCoupons.filter(c => c.productId === id);
        couponsToRemove.forEach(coupon => handleRemoveCoupon(coupon)); // 쿠폰 제거 로직 재활용

        // 적용된 쿠폰 상태 업데이트
        const updatedAppliedCoupons = appliedCoupons.filter(c => c.productId !== id);
        setAppliedCoupons(updatedAppliedCoupons);
    };



    const handleClearCart = () => {
        clearCart();
        setCart([]);
        setProductDetails({});
        setSelectedItems(new Set());
        setTotalDiscount(0);
        setAppliedCoupons([]); // 전체 삭제 시 적용된 쿠폰 초기화
    };

    const handleSelectAll = () => {
        // 재고가 있는 상품의 ID만 가져오기
        const availableIds = cart
            .filter(item => productDetails[item.id].stock > 0)
            .map(item => item.id);

        // 모든 상품이 선택되어 있는 경우 선택 해제
        if (selectedItems.size === availableIds.length) {
            // 선택 해제 시, 선택된 모든 상품의 쿠폰 제거
            availableIds.forEach(id => {
                const couponsToRemove = appliedCoupons.filter(coupon => coupon.productId === id);
                couponsToRemove.forEach(coupon => handleRemoveCoupon(coupon));
            });

            setSelectedItems(new Set());
            setAppliedCoupons([]); // 모든 쿠폰 제거
        } else {
            // 재고가 있는 모든 상품을 선택
            const allIds = new Set(availableIds);
            setSelectedItems(allIds);
        }
    };


    const handleRemoveSelected = () => {
        const selectedIds = Array.from(selectedItems);

        // 선택된 아이템의 쿠폰을 제외하고 나머지 쿠폰만 유지
        const updatedAppliedCoupons = appliedCoupons.filter(coupon => {
            return !selectedIds.includes(coupon.productId);
        });

        // 선택된 아이템에서 제거할 쿠폰 목록 생성
        const couponsToRemove = appliedCoupons.filter(coupon => selectedIds.includes(coupon.productId));

        // 선택된 아이템을 장바구니에서 제거
        selectedIds.forEach(id => {
            removeFromCart(id);
        });

        // 장바구니 상태 업데이트
        setCart(getCart());
        setSelectedItems(new Set());

        // 쿠폰 제거 로직 재활용하여 적용된 쿠폰 업데이트
        couponsToRemove.forEach(coupon => handleRemoveCoupon(coupon));

        // 적용된 쿠폰 상태 업데이트
        setAppliedCoupons(updatedAppliedCoupons); // 상태 업데이트
    };

    const handleQuantityChange = async (id, newQuantity) => {
        const updatedSuccessfully = await updateCartQuantity(id, newQuantity);
        if (updatedSuccessfully) {
            // 수량이 성공적으로 업데이트된 경우에만 장바구니 상태를 업데이트
            setCart(getCart());
        }
    };

    const cartCount = useCartCount();

    const fetchAvailableCoupons = async (productId) => {

        try {
            const response = await axios.get(`https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/coupons/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });

            setCurrentProductCoupons(response.data.coupons);
        } catch (error) {
            try {
                await sendRefreshTokenAndStoreAccessToken();

                // 새로 요청
                const newResponse = await axios.get(`https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/coupons/${productId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                });

                setCurrentProductCoupons(newResponse.data.coupons);
            } catch (e) {
                console.error(e.message);
            }
        }
    };

    const handleShowCouponModal = (item) => {
        const token = localStorage.getItem('token'); // 로컬 스토리지에서 토큰 가져오기

        if (!token) {
            // 토큰이 없으면 로그인 페이지로 리다이렉트
            window.location.href = '/login'; // 로그인 페이지 경로로 변경
            return;
        }

        fetchAvailableCoupons(item.id);
        setCurrentProduct(item);
        setShowCouponModal(true);
    };

    const handleCloseCouponModal = () => {
        setShowCouponModal(false);
        setCurrentProduct(null);
    };

    const handleApplyCoupon = (coupon) => {
        const currentPrice = productDetails[currentProduct.id]?.price || 0; // 현재 상품 가격
        const discountAmount = coupon.type === 'AMOUNT' ? coupon.value : Math.floor((currentPrice * coupon.percentage) / 100); // 현재 쿠폰 할인 금액

        // 동일한 쿠폰이 다른 상품에 적용되어 있는지 확인
        const duplicateCoupon = appliedCoupons.find(c => c.couponMemberId === coupon.couponMemberId && c.productId !== currentProduct.id);

        let updatedCoupons = [...appliedCoupons]; // 기존 쿠폰 복사

        // 동일한 쿠폰이 다른 상품에 적용되어 있다면, 해당 쿠폰을 제거
        if (duplicateCoupon) {
            updatedCoupons = updatedCoupons.filter(c => c.couponMemberId !== coupon.couponMemberId);
            alert(`쿠폰 ${duplicateCoupon.name}이 다른 상품에 적용되어 있어 제거되었습니다.`);
        }

        // 현재 상품에 이미 적용된 쿠폰이 있는지 확인
        const existingCoupon = updatedCoupons.find(c => c.productId === currentProduct.id);

        // 기존 쿠폰이 있으면 제거
        if (existingCoupon) {
            updatedCoupons = updatedCoupons.filter(c => c.productId !== currentProduct.id);
            alert(`쿠폰 ${existingCoupon.name}이 현재 상품에 적용되어 있어 제거되었습니다.`);
        }

        // 현재 적용된 쿠폰 업데이트
        updatedCoupons.push({...coupon, productId: currentProduct.id}); // 새로운 쿠폰 추가
        setAppliedCoupons(updatedCoupons); // 상태 업데이트

        // 선택된 상품에 현재 상품 추가
        setSelectedItems(prevSelectedItems => {
            const newSelectedItems = new Set(prevSelectedItems);
            newSelectedItems.add(currentProduct.id); // 현재 상품 ID 추가
            return newSelectedItems;
        });

        // 총 할인 금액 재계산
        const newTotalDiscount = updatedCoupons.reduce((total, c) => {
            const price = productDetails[c.productId]?.price || 0; // 상품 가격
            const discount = c.type === 'AMOUNT'
                ? c.value
                : Math.floor((price * c.percentage) / 100); // 퍼센트 할인일 경우 소수점 버림 처리

            // 할인 금액이 상품 가격을 초과하는 경우, 상품 가격으로 제한
            const finalDiscount = Math.min(discount, price);

            return total + finalDiscount; // 총 할인에 더함
        }, 0);

        setTotalDiscount(newTotalDiscount); // 재계산된 할인 금액 설정

        handleCloseCouponModal();
    };

    const handleRemoveCoupon = (coupon) => {
        // 쿠폰 제거 로직
        const updatedCoupons = appliedCoupons.filter(c => c.couponMemberId !== coupon.couponMemberId);
        setAppliedCoupons(updatedCoupons);

        // 총 할인 금액 재계산
        const newTotalDiscount = updatedCoupons.reduce((total, c) => {
            const price = productDetails[c.productId]?.price || 0;
            const discount = c.type === 'AMOUNT' ? c.value : Math.floor((price * c.percentage) / 100);
            return total + discount;
        }, 0);
        setTotalDiscount(newTotalDiscount);
    };

    const getTotalPrice = () => {
        const subtotal = cart.reduce((total, item) => {
            // 선택된 아이템만 계산
            if (selectedItems.has(item.id)) {
                const price = productDetails[item.id]?.price || 0;
                return total + price * item.quantity;
            }
            return total;
        }, 0);

        return subtotal - totalDiscount; // 할인 적용 후 최종 금액
    };

    const handleOrder = () => {
        if (cartCount === 0 || selectedItems.size === 0) {
            return false; // 조건이 만족하지 않으면 아무 동작도 하지 않음
        }
        // 선택된 상품의 수량이 재고보다 많은지 체크
        const outOfStockItems = cart.filter(item =>
            selectedItems.has(item.id) && item.quantity > productDetails[item.id].stock
        );

        if (outOfStockItems.length > 0) {
            // 품절 상품 목록 생성
            const outOfStockDetails = outOfStockItems.map(item => {
                const productDetail = productDetails[item.id];
                return `${productDetail.productName} (요청 수량: ${item.quantity}, 재고: ${productDetail.stock})`;
            }).join('\n'); // 각 상품 정보를 줄바꿈으로 연결

            alert(`장바구니에 있는 상품의 수량이 재고보다 많습니다:\n${outOfStockDetails}`); // 경고 메시지
            return false; // 수량이 재고보다 많으면 리턴
        }

        const orderData = cart
            .filter(item => selectedItems.has(item.id)) // 선택된 상품만 필터링
            .map(item => {
                const productDetail = productDetails[item.id]; // 상품 세부 정보 가져오기
                const appliedCoupon = appliedCoupons.find(coupon => coupon.productId === item.id); // 해당 상품에 적용된 쿠폰 찾기

                // 할인 금액 계산
                const itemPrice = productDetail.price;  // 상품 기존 1개 값
                const discountAmount = appliedCoupon ?
                    (appliedCoupon.type === 'AMOUNT' ? appliedCoupon.value : Math.floor((itemPrice * appliedCoupon.percentage) / 100))
                    : 0;

                const originalTotalPrice = itemPrice * item.quantity;
                const discountedTotalPrice = originalTotalPrice - discountAmount;

                return {
                    productId: item.id,
                    productName: productDetail.productName, // 상품 이름
                    quantity: item.quantity, // 수량
                    itemPrice, // 상품 1개 가격
                    originalTotalPrice, // 원래 총 가격
                    discountedTotalPrice, // 할인된 총 가격
                    couponName: appliedCoupon ? appliedCoupon.name : null, // 적용된 쿠폰 이름
                    couponMemberId: appliedCoupon ? appliedCoupon.couponMemberId : null, // 적용된 쿠폰 ID
                };
            });

        // 로컬 스토리지에 저장
        localStorage.setItem('orderData', JSON.stringify(orderData));
        localStorage.setItem('shippingCost', JSON.stringify(shippingCost));

        return true;
    };


    const calculateShippingCost = () => {
        const totalPrice = getTotalPrice() + totalDiscount;
        if (selectedItems.size === 0) {
            return 0;
        }
        return totalPrice < 20000 ? 2500 : 0;
    };

    const shippingCost = calculateShippingCost(); // 배송비 변수로 관리

    return (
        <div className="cart-container">
            <div style={{
                width: '100%',
                position: 'fixed',
                backgroundColor: 'white',
                zIndex: '99',
                paddingTop: '40px',
                top: '86px'
            }}>
                <h2>쇼핑백</h2>
            </div>
            <div className="both-container-c">
                <div className="left-container">
                    <div className="d-flex justify-content-between">
                        <div>
                            <button className="btn btn-light text-dark me-2" style={{border: '1px solid #ced4da'}}
                                    onClick={handleSelectAll}>
                                {selectedItems.size + outOfStockCount === cart.length ? '전체선택 해제' : '전체선택'}
                            </button>
                            <button className="btn btn-light text-dark me-2" style={{border: '1px solid #ced4da'}}
                                    onClick={handleRemoveSelected} disabled={selectedItems.size === 0}>
                                선택삭제
                            </button>
                            <button className="btn btn-danger" style={{border: '1px solid #dc3545'}}
                                    onClick={handleClearCart}>
                                전체삭제
                            </button>
                        </div>
                    </div>
                    <hr/>

                    {cart.length === 0 ? (
                        <p className="no-content">장바구니에 상품이 없습니다.</p>
                    ) : (
                        <table className="table">
                            <thead>
                            <tr>
                                <th></th>
                                <th>상품정보</th>
                                <th>상품금액</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {cart.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.has(item.id)}
                                            onChange={() => {
                                                const newSelectedItems = new Set(selectedItems);
                                                if (newSelectedItems.has(item.id)) {
                                                    // 선택 해제
                                                    newSelectedItems.delete(item.id);

                                                    // 해당 상품의 적용된 쿠폰 제거
                                                    const couponsToRemove = appliedCoupons.filter(coupon => coupon.productId === item.id);
                                                    couponsToRemove.forEach(coupon => handleRemoveCoupon(coupon));

                                                    // 적용된 쿠폰 상태 업데이트
                                                    const updatedAppliedCoupons = appliedCoupons.filter(coupon => coupon.productId !== item.id);
                                                    setAppliedCoupons(updatedAppliedCoupons);
                                                } else {
                                                    // 선택
                                                    newSelectedItems.add(item.id);
                                                }
                                                setSelectedItems(newSelectedItems);
                                            }}
                                            disabled={productDetails[item.id] && productDetails[item.id].stock === 0} // 재고가 0일 때 체크박스 비활성화
                                        />

                                    </td>
                                    <td>
                                        {productDetails[item.id] ? (
                                            <div key={item.id}>
                                                <div className="d-flex justify-content-start">
                                                    <img
                                                        style={{width: '100px', height: '100px', marginRight: '10px'}}
                                                        src={
                                                            productDetails[item.id].productImgUrls.length > 0
                                                                ? productDetails[item.id].productImgUrls[0]
                                                                : "/img/logo100x100.png"
                                                        }
                                                        alt="상품 이미지"
                                                    />

                                                    <div>
                                                        <p style={{margin: `0`}}>{productDetails[item.id].manufacturer}</p>
                                                        <p style={{fontWeight: 'bold'}}>
                                                            <Link to={`/product/${item.id}`}
                                                                  style={{textDecoration: 'none', color: 'inherit'}}>
                                                                {productDetails[item.id].productName}
                                                            </Link>
                                                        </p>
                                                        {productDetails[item.id].stock === 0 && (
                                                            <p style={{color: 'red', fontWeight: 'bold'}}>
                                                                품절
                                                            </p>
                                                        )}
                                                        {productDetails[item.id].stock > 0 && (
                                                            <label className="d-flex align-items-center">
                                                                수량
                                                                <select
                                                                    className="form-select ms-2"
                                                                    style={{width: 'auto'}}
                                                                    value={item.quantity}
                                                                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10))}
                                                                >
                                                                    {/* 1부터 20까지의 수량 선택 */}
                                                                    {[...Array(20)].map((_, index) => (
                                                                        <option key={index + 1} value={index + 1}>
                                                                            {index + 1}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </label>
                                                        )}


                                                    </div>
                                                </div>


                                                {/* 현재 적용된 쿠폰 및 할인 금액 표시 */}
                                                {appliedCoupons.filter(coupon => coupon.productId === item.id).map((coupon, index) => {
                                                    return (
                                                        <div
                                                            className="d-flex justify-content-start align-items-center">
                                                            <button style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                marginRight: '5px'
                                                            }}
                                                                    onClick={() => handleRemoveCoupon(coupon)}>&times;</button>
                                                            <p key={index}
                                                               style={{margin: '0', color: '#629a72'}}>
                                                                적용된
                                                                쿠폰: {coupon.name}
                                                                {coupon.type === 'AMOUNT'
                                                                    ? `(${coupon.value.toLocaleString()} 원 할인 쿠폰)`
                                                                    : `(${coupon.percentage}% 할인 쿠폰)`}
                                                            </p>

                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p>상품 정보를 불러올 수 없습니다...</p>
                                        )}
                                    </td>
                                    <td>
                                        {productDetails[item.id] ? (
                                            <div>
                                                <p>
                                                    {productDetails[item.id].stock === 0 ? (
                                                        <strong style={{color: 'red'}}>품절</strong>
                                                    ) : (
                                                        `${(productDetails[item.id].price * item.quantity).toLocaleString()} 원`
                                                    )}
                                                </p>

                                                {productDetails[item.id].stock > 0 && (
                                                    <button className="btn btn-light text-dark me-2"
                                                            style={{border: '1px solid #ced4da'}}
                                                            onClick={() => handleShowCouponModal(item)}>
                                                        적용 가능 쿠폰
                                                    </button>
                                                )}

                                            </div>
                                        ) : (
                                            <p>상품 정보를 불러올 수 없습니다...</p>
                                        )}
                                    </td>
                                    <td>
                                        <button className="btn btn-light text-dark me-2"
                                                style={{border: '1px solid #ced4da'}}
                                                onClick={() => handleRemoveFromCart(item.id)}>
                                            삭제
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="right-container-c">
                    <div className="order-container">
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                            <p>상품 금액 ({selectedItems.size})</p>
                            {totalDiscount > 0 ? (
                                <span>
            <p style={{textDecoration: 'line-through', marginRight: '8px'}}>
                {(getTotalPrice() + totalDiscount).toLocaleString()} 원
            </p>
            <p style={{color: '#B22222'}}>
                {getTotalPrice().toLocaleString()} 원
            </p>
        </span>
                            ) : (
                                <p>{getTotalPrice().toLocaleString()} 원</p> // 할인 금액이 0원일 경우
                            )}

                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>

                            <p>배송비</p>
                            {selectedItems.size === 0 ? (
                                <p>0 원</p>
                            ) : shippingCost > 0 ? (
                                <p>{shippingCost.toLocaleString()} 원</p>
                            ) : (
                                <span>
                <p style={{textDecoration: 'line-through'}}>2,500 원</p>
                <p style={{marginLeft: '8px'}}>무료</p>
            </span>
                            )}
                        </div>
                        <hr/>
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                            <strong>결제예정금액</strong>
                            {cartCount === 0 ? (
                                <strong style={{color: '#B22222'}}>0 원</strong>
                            ) : (
                                <strong style={{color: '#B22222'}}>{(getTotalPrice()+shippingCost).toLocaleString()} 원</strong>
                            )}
                        </div>
                        <div style={{display: 'flex', justifyContent: 'center'}}>
                            <div className="discount-container">
                                <strong>{totalDiscount.toLocaleString()} 원</strong>
                                <strong style={{color: '#B22222'}}>
                                    {getTotalPrice() > 0 ? `(${Math.floor((totalDiscount / (getTotalPrice()+totalDiscount)) * 100)}%)` : '(0%)'}
                                </strong>
                                &nbsp;<p style={{margin: 0}}>할인 받았어요!</p>
                            </div>

                        </div>
                        {/* 적용된 쿠폰 정보 출력 */}
                        {appliedCoupons.length > 0 && (
                            <div style={{display: 'flex', justifyContent: 'space-between', margin: '10px 0'}}>
                                <div className="applied-coupon-container">
                                    <strong>적용된 쿠폰</strong>
                                    {appliedCoupons.map((coupon, index) => {
                                        const price = productDetails[coupon.productId]?.price || 0; // 상품 가격
                                        const discount = coupon.type === 'AMOUNT' ? coupon.value : Math.floor((price * coupon.percentage) / 100); // 쿠폰 할인 금액
                                        const finalDiscount = Math.min(discount, price); // 할인 금액이 상품 가격을 초과하지 않도록 제한

                                        return (
                                            <div>
                                                <p key={index} style={{color: '#629a72', margin: 0}}>
                                                    {coupon.name} {coupon.type === 'AMOUNT'
                                                    ? `(${coupon.value.toLocaleString()}원 할인 쿠폰)`
                                                    : `(${coupon.percentage}% 할인 쿠폰)`}
                                                    &nbsp;⇒ {finalDiscount.toLocaleString()} 원 할인
                                                </p>
                                                <span></span>
                                            </div>
                                        );
                                    })}

                                </div>
                            </div>
                        )}

                    </div>


                    <div style={{display: 'flex', justifyContent: 'center', margin: `10px 0`}}>
                        <a className="btn btn-light text-dark me-2 p-3" style={{border: '1px solid #ced4da'}}
                           href="/">계속
                            쇼핑하기</a>
                        <a
                            className="btn btn-custom p-3"
                            onClick={(e) => {
                                e.preventDefault(); // 기본 링크 이동 방지
                                const isOrderSuccessful = handleOrder(); // 주문 처리 함수 호출

                                // 주문이 성공적으로 처리되면 /order로 이동
                                if (isOrderSuccessful) {
                                    window.location.href = "/order"; // 페이지 이동
                                }
                            }}
                            style={{
                                pointerEvents: (cartCount === 0 || selectedItems.size === 0) ? 'none' : 'auto',
                                opacity: (cartCount === 0 || selectedItems.size === 0) ? 0.5 : 1,
                                cursor: (cartCount === 0 || selectedItems.size === 0) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            주문하기
                        </a>


                    </div>
                </div>
            </div>

            {/* 쿠폰 모달 */
            }
            {
                showCouponModal && currentProduct && (
                    <AvailableCouponModal
                        coupons={currentProductCoupons}
                        onClose={handleCloseCouponModal}
                        onApplyCoupon={handleApplyCoupon}
                    />
                )
            }
        </div>
    )
        ;
};

export default Cart;

