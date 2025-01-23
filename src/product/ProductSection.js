import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { addToCart } from '../cart/cartStorage';

const ProductSection = () => {
    const { id: productId } = useParams();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState('');
    const [dummyImage] = useState('/img/logo100x100.png'); // dummy 이미지 URL 설정
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`http://ec2-3-34-78-114.ap-northeast-2.compute.amazonaws.com:8080/api/products/${productId}`);
                setProduct(response.data);
                setSelectedImage(response.data.productImgUrls ? response.data.productImgUrls[0] : dummyImage);
            } catch (error) {
                console.error("Error fetching product data:", error);
            }
        };

        fetchProduct();
    }, [productId, dummyImage]);

    const handleAddToCart = async () => {
        if (product && !product.soldOut) {
            const cartItem = {
                id: product.id,
                quantity,
            };

            const result = await addToCart(cartItem);
            if (result) {
                alert(`${product.productName}이(가) 장바구니에 추가되었습니다.`);
            }

            const moveToCart = window.confirm('장바구니로 이동하시겠습니까?');
            if (moveToCart) {
                navigate('/cart');
            }
        } else {
            alert('이 상품은 품절되었습니다.');
        }
    };

    const handleImageClick = (imgUrl) => {
        setSelectedImage(imgUrl);
    };

    if (!product) {
        return <p>Loading...</p>;
    }

    const productImages = product.productImgUrls?.length > 0
        ? product.productImgUrls
        : [dummyImage]; // dummy 이미지 사용

    const productDescImages = product.productDescImgUrls?.length > 0
        ? product.productDescImgUrls
        : []; // 설명 이미지가 없을 경우 비워둠

    const handleQuantityChange = (e) => {
        const newQuantity = parseInt(e.target.value, 10);
        const maxQuantity = product.stock || 1; // 재고 수량

        if (newQuantity >= 1 && newQuantity <= maxQuantity) {
            setQuantity(newQuantity);
        } else if (newQuantity > maxQuantity) {
            alert(`남은 재고는 ${maxQuantity}개입니다.`);
            setQuantity(maxQuantity);
        } else {
            setQuantity(1);
        }
    };

    return (
        <section className="py-5">
            <div className="container px-4 px-lg-5 my-5">
                <div className="row gx-4 gx-lg-5 align-items-center">
                    {/* 이미지 갤러리 섹션 */}
                    <div className="col-md-6">
                        <div
                            id="productCarousel"
                            className="carousel slide"
                            data-bs-ride="carousel"
                            style={{ width: '100%', height: '720px', overflow: 'hidden' }}
                        >
                            <div className="carousel-inner" style={{ width: '100%', height: '100%' }}>
                                {productImages.map((image, index) => (
                                    <div
                                        key={index}
                                        className={`carousel-item ${index === 0 ? 'active' : ''}`}
                                        style={{ width: '100%', height: '100%' }}
                                    >
                                        <img
                                            className="d-block w-100 h-100"
                                            src={image}
                                            alt={`Product image ${index + 1}`}
                                            style={{ objectFit: 'cover', width: '600px', height: '720px'}}
                                        />
                                    </div>
                                ))}
                            </div>
                            {/* 슬라이드 이전 버튼 */}
                            <button className="carousel-control-prev" type="button" data-bs-target="#productCarousel" data-bs-slide="prev">
                                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span className="visually-hidden">Previous</span>
                            </button>
                            {/* 슬라이드 다음 버튼 */}
                            <button className="carousel-control-next" type="button" data-bs-target="#productCarousel" data-bs-slide="next">
                                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                <span className="visually-hidden">Next</span>
                            </button>
                        </div>
                    </div>
                    {/* 제품 정보 섹션 */}
                    <div className="col-md-6">
                        <h1 className="display-5 fw-bolder">{product.productName}</h1>
                        <div className="fs-5 mb-3">
                            <span> {product.price.toLocaleString()}원</span>
                        </div>
                        <div className="fs-6 mb-3">
                            <strong> </strong> {product.manufacturer}
                        </div>
                        {/* 품절 여부 표시 */}
                        {product.soldOut && (
                            <div className="text-danger fw-bold mb-3">
                                품절된 상품입니다.
                            </div>
                        )}
                        {/* 수량 입력 및 장바구니 버튼 */}
                        {!product.soldOut && (
                            <div className="d-flex mb-3">
                                <input
                                    className="form-control text-center me-3"
                                    id="inputQuantity"
                                    type="number"
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    style={{ maxWidth: '4rem' }}
                                    min="1"
                                />
                                <button className="btn btn-dark flex-shrink-0" type="button" onClick={handleAddToCart}>
                                    장바구니 담기
                                </button>
                            </div>
                        )}
                    </div>

                </div>
                {/* 탭 구성 섹션 */}
                <div className="mt-5">
                    <ul className="nav nav-tabs" id="productDetailsTabs" role="tablist">
                        <li className="nav-item" role="presentation">
                            <button className="nav-link active" id="info-tab" data-bs-toggle="tab" data-bs-target="#info" type="button" role="tab" aria-controls="info" aria-selected="true">
                                상품 정보
                            </button>
                        </li>
                    </ul>
                    <div className="tab-content" id="productDetailsTabsContent">
                        <div className="tab-pane fade show active" id="info" role="tabpanel" aria-labelledby="info-tab">
                            <p>{product.info}</p>
                            {/* 상품 설명 이미지 추가 */}
                            <div className="description-images mt-3">
                                {productDescImages.length > 0 &&
                                    productDescImages.map((image, index) => (
                                        <img
                                            key={index}
                                            src={image}
                                            alt={`Description image ${index + 1}`}
                                            className="img-fluid mb-3"
                                        />
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );

};

export default ProductSection;
