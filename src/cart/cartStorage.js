import { useState, useEffect } from 'react';
const LOCAL_CART_KEY = 'localCart';
const DB_CART_KEY = 'dbCart';

export const useCartCount = () => {
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        const updateCartCount = () => {
            const storedCart = JSON.parse(localStorage.getItem(LOCAL_CART_KEY)) || [];
            setCartCount(storedCart.length); // 장바구니 품목 개수 설정
        };

        // 초기 카운트 업데이트
        updateCartCount();

        // storage 이벤트 리스너 추가
        window.addEventListener('storage', updateCartCount);

        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            window.removeEventListener('storage', updateCartCount);
        };
    }, []);

    return cartCount;
};

// 장바구니 가져오기
export const getCart = () => {
    const cart = localStorage.getItem(LOCAL_CART_KEY);
    return cart ? JSON.parse(cart) : [];
};

// 장바구니 추가하기
export const addToCart = async (item) => {
    const cart = getCart();
    const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);

    if (existingItemIndex >= 0) {
        // 이미 장바구니에 있는 경우 메시지 출력하고 추가하지 않음
        alert("이미 장바구니에 있습니다."); // 사용자에게 알림
        return false; // 추가하지 않음
    } else {
        // 새 아이템 추가
        item.quantity = item.quantity || 1; // 기본 수량 1로 설정
        cart.push(item);
    }

    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
    // 카운트 업데이트
    window.dispatchEvent(new Event('storage')); // storage 이벤트 발생

    // 데이터베이스와 동기화
    await updateDBWithDifferences(cart);

    return true; // 성공적으로 추가됨
};


// 장바구니 수량 업데이트하기
export const updateCartQuantity = async (id, quantity) => {
    const cart = getCart();
    const updatedCart = cart.map(item => {
        if (item.id === id) {
            return { ...item, quantity }; // 수량 업데이트
        }
        return item;
    });

    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(updatedCart));
    // 카운트 업데이트
    window.dispatchEvent(new Event('storage')); // storage 이벤트 발생

    // 데이터베이스와 동기화
    await updateDBWithDifferences(updatedCart);
};

// 장바구니 삭제하기
export const removeFromCart = async (id) => {
    const cart = getCart();
    const updatedCart = cart.filter(item => item.id !== id);
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(updatedCart));
    // 카운트 업데이트
    window.dispatchEvent(new Event('storage')); // storage 이벤트 발생
    // 데이터베이스와 동기화
    await updateDBWithDifferences(updatedCart);
};

// 장바구니 초기화하기
export const clearCart = async () => {
    localStorage.removeItem(LOCAL_CART_KEY);
    // 카운트 업데이트
    window.dispatchEvent(new Event('storage')); // storage 이벤트 발생

    // 데이터베이스와 동기화 (빈 배열을 보내어 초기화)
    await updateDBWithDifferences([]); // 빈 배열을 데이터베이스에 전송
};

// 상품 데이터를 가져오는 함수
export const fetchProduct = async (id) => {
    try {
        const response = await fetch(`http://localhost:8080/api/products/${id}`, {
            method: `GET`,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) {
            throw new Error('네트워크 응답이 좋지 않습니다.');
        }
        const productData = await response.json();
        console.log(productData);
        return productData;
    } catch (error) {
        console.error('상품 가져오기 오류:', error);
        return null; // 오류가 발생하면 null 반환
    }
};

export const fetchAndMergeCartData = async (token) => {
    try {
        const response = await fetch('http://localhost:8080/api/carts', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // JWT를 Authorization 헤더에 포함
            },
        });

        if (response.ok) {
            const result = await response.json();
            const fetchedCartData = result.carts; // carts에서 장바구니 데이터 추출

            // fetchedCartData가 배열인지 확인
            if (Array.isArray(fetchedCartData)) {
                // fetchedCartData를 dbCart로 로컬 스토리지에 저장
                const dbCart = fetchedCartData.map(item => ({
                    id: item.productId, // productId를 id로 변환
                    quantity: item.quantity // quantity 유지
                }));

                localStorage.setItem(DB_CART_KEY, JSON.stringify(dbCart));

                const mergedCartData = mergeCartData(fetchedCartData);
                console.log('장바구니 데이터:', mergedCartData);
            } else {
                throw new Error('장바구니 데이터 형식 오류');
            }
        } else {
            throw new Error(`API 응답 오류: ${response.status}`);
        }
    } catch (error) {
        throw error; // 호출한 쪽으로 에러를 던짐
    }
};

export const mergeCartData = async (fetchedCartData) => {
    const existingCartData = getCart(); // 로컬 스토리지에서 기존 장바구니 데이터 가져오기

    // fetchedCartData를 기준으로 병합
    const mergedData = fetchedCartData.map(fetchedItem => {
        const existingItem = existingCartData.find(item => item.id === fetchedItem.productId);
        if (existingItem) {
            return { ...existingItem, quantity: fetchedItem.quantity }; // fetchedCartData의 수량으로 업데이트
        }
        return { id: fetchedItem.productId, quantity: fetchedItem.quantity }; // 신규 아이템 추가
    });

    // 기존 장바구니에 있는 아이템 중 fetchedCartData에 없는 아이템은 그대로 유지
    const finalMergedData = [...mergedData, ...existingCartData.filter(existingItem => {
        return !fetchedCartData.some(fetchedItem => fetchedItem.productId === existingItem.id);
    })];

    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(finalMergedData)); // 병합된 데이터를 로컬 스토리지에 저장

    // dbCart와 localCart 비교 후 업데이트
    await updateDBWithDifferences(finalMergedData);

    return finalMergedData; // 병합된 데이터 반환
};


const updateDBWithDifferences = async (localCart) => {

    if(localStorage.getItem('token') === null) return;

    const dbCart = JSON.parse(localStorage.getItem('dbCart')) || [];

    // 추가 및 업데이트 처리
    for (const item of localCart) {
        const dbItem = dbCart.find(dbItem => dbItem.id === item.id);
        console.log(item.id + " =>  " + dbItem);

        // DB에 없는 경우 추가
        if (!dbItem) {
            const requestData = {
                productId: item.id, // id를 productId로 변환
                quantity: item.quantity,
            };

            await fetch('http://localhost:8080/api/carts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData), // 변환된 데이터를 JSON으로 변환하여 전송
            });
            console.log(`장바구니 아이템 추가됨: ${item.id}`);
        } else if (dbItem.quantity !== item.quantity) {
            // 수량이 다른 경우 업데이트
            await updateCartItem(item);
        }
    }

    // 삭제 처리
    for (const dbItem of dbCart) {
        const localItem = localCart.find(item => item.id === dbItem.id);
        if (!localItem) {
            await deleteCartItem(dbItem);
        }
    }

    // dbCart 값을 localCart의 값과 동일하게 업데이트
    localStorage.setItem('dbCart', JSON.stringify(localCart));
};

const updateCartItem = async (item) => {

    if(localStorage.getItem('token') === null) return;

    const requestData = {
        productId: item.id, // id를 productId로 변환
        quantity: item.quantity,
    };

    await fetch('http://localhost:8080/api/carts', {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData), // 변환된 데이터를 JSON으로 변환하여 전송
    });

    console.log(`장바구니 아이템 업데이트됨: ${item.id}`);
};

const deleteCartItem = async (item) => {

    if(localStorage.getItem('token') === null) return;

    await fetch(`http://localhost:8080/api/carts/${item.id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
        },
    });
    console.log(`장바구니 아이템 삭제됨: ${item.id}`);
};


export const clearCartItem = async (token) => {
    // 1. 장바구니 초기화 요청 (DELETE)
    const deleteResponse = await fetch('http://localhost:8080/api/carts', {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`, // JWT를 Authorization 헤더에 포함
        },
    });

    if (!deleteResponse.ok) {
        throw new Error('장바구니 초기화 실패');
    }
    console.log('장바구니가 서버에서 초기화되었습니다.');
}

// 장바구니 초기화 요청 및 데이터 다시 추가 요청
// export const syncCartWithServer = async (token, cartDataToClear) => {
//     // 1. 장바구니 초기화 요청 (DELETE)
//     const deleteResponse = await fetch('http://localhost:8080/api/cart', {
//         method: 'DELETE',
//         headers: {
//             'Authorization': `Bearer ${token}`, // JWT를 Authorization 헤더에 포함
//         },
//     });
//
//     if (!deleteResponse.ok) {
//         throw new Error('장바구니 초기화 실패');
//     }
//     console.log('장바구니가 서버에서 초기화되었습니다.');
//
//     // 2. 장바구니 데이터 다시 추가 요청 (POST)
//     for (const item of cartDataToClear) {
//         const postResponse = await fetch('http://localhost:8080/api/cart', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`, // JWT를 Authorization 헤더에 포함
//             },
//             body: JSON.stringify({
//                 productId: item.id,
//                 quantity: item.quantity,
//             }),
//         });
//
//         if (!postResponse.ok) {
//             throw new Error(`장바구니 데이터 추가 실패: ${item.productId}`);
//         }
//
//         console.log(`장바구니 데이터 (${item.productId})가 서버에 추가되었습니다.`);
//     }
// };