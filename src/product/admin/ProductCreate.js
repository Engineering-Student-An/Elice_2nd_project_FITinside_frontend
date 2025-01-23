import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductCreate.css';
import axios from 'axios';
import sendRefreshTokenAndStoreAccessToken from "../../auth/RefreshAccessToken";

const ProductCreate = () => {
    const [formData, setFormData] = useState({
        categoryName: '',
        productName: '',
        price: '',
        info: '',
        manufacturer: '',
        stock: '',
        productImgUrls: [],
        productDescImgUrls: [] // 상품 설명 이미지 추가
    });

    const [categories, setCategories] = useState([]);
    const [images, setImages] = useState([]);
    const [descImages, setDescImages] = useState([]); // 설명 이미지 상태 추가
    const [previewImages, setPreviewImages] = useState([]);
    const [previewDescImages, setPreviewDescImages] = useState([]); // 설명 이미지 미리보기 상태 추가
    const [productNameError, setProductNameError] = useState('');
    const [infoError, setInfoError] = useState('');
    const [manufacturerError, setManufacturerError] = useState('');
    const navigate = useNavigate();

    // 카테고리 목록을 서버에서 가져오는 useEffect
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem('token');  // 로컬 스토리지에서 토큰 가져오기
                const response = await fetch('http://ec2-3-34-36-20.ap-northeast-2.compute.amazonaws.com:8081/api/categories', {
                    headers: {
                        'Authorization': `Bearer ${token}`  // Authorization 헤더 추가
                    }
                });
                if (!response.ok) {
                    throw new Error('카테고리 목록을 가져오는 데 실패했습니다.');
                }
                const data = await response.json();
                const filteredCategories = data.filter(category => category.parentId !== null);
                setCategories(filteredCategories);
            } catch (error) {
                try {
                    await sendRefreshTokenAndStoreAccessToken();

                    const token = localStorage.getItem('token');  // 로컬 스토리지에서 토큰 가져오기
                    const response = await fetch('http://ec2-3-34-36-20.ap-northeast-2.compute.amazonaws.com:8081/api/categories', {
                        headers: {
                            'Authorization': `Bearer ${token}`  // Authorization 헤더 추가
                        }
                    });
                    if (!response.ok) {
                        throw new Error('카테고리 목록을 가져오는 데 실패했습니다.');
                    }
                    const data = await response.json();
                    const filteredCategories = data.filter(category => category.parentId !== null);
                    setCategories(filteredCategories);
                } catch (error) {
                    console.error('카테고리 목록을 가져오는 데 실패했습니다.', error);
                }
            }
        };

        fetchCategories();
    }, []);

    // 입력 값 변경 처리 및 유효성 검사
    const handleChange = (e) => {
        const { name, value } = e.target;

        // 상품명 글자 수 제한 (최대 100자)
        if (name === 'productName' && value.length > 100) {
            setProductNameError('상품명은 최대 100자까지 입력할 수 있습니다.');
        } else {
            setProductNameError('');
        }

        // 상세 정보 글자 수 제한 (최대 500자)
        if (name === 'info' && value.length > 500) {
            setInfoError('상품 설명은 최대 500자까지 입력할 수 있습니다.');
        } else {
            setInfoError('');
        }

        // 제조사 글자 수 제한 (최대 100자)
        if (name === 'manufacturer' && value.length > 100) {
            setManufacturerError('제조사는 최대 100자까지 입력할 수 있습니다.');
        } else {
            setManufacturerError('');
        }

        // 가격 및 재고수는 0 이상 2147483647 이하로 제한
        if (name === 'price' && (isNaN(value) || value < 0 || value > 2147483647)) {
            alert('가격은 0에서 2147483647 사이의 값을 입력하세요.');
            return;
        }
        if (name === 'stock' && (isNaN(value) || value < 0 || value > 2147483647)) {
            alert('재고수는 0에서 2147483647 사이의 값을 입력하세요.');
            return;
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        // 파일 형식 검증
        const validFiles = selectedFiles.filter(file => validImageTypes.includes(file.type));
        if (validFiles.length !== selectedFiles.length) {
            alert('허용되지 않은 이미지 형식이 포함되어 있습니다. jpg, png 형식의 파일만 업로드할 수 있습니다.');
            return; // 잘못된 파일 형식이 있는 경우 업로드 중단
        }

        setImages(validFiles);  // 유효한 파일만 저장

        // 미리보기 이미지 생성
        const previewUrls = validFiles.map(file => URL.createObjectURL(file));
        setPreviewImages(previewUrls);
    };

    // 상품 설명 이미지 핸들러
    const handleDescImageChange = (e) => {
        const selectedDescFiles = Array.from(e.target.files);
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        // 파일 형식 검증
        const validDescFiles = selectedDescFiles.filter(file => validImageTypes.includes(file.type));
        if (validDescFiles.length !== selectedDescFiles.length) {
            alert('허용되지 않은 이미지 형식이 포함되어 있습니다. jpg, png 형식의 파일만 업로드할 수 있습니다.');
            return; // 잘못된 파일 형식이 있는 경우 업로드 중단
        }

        setDescImages(validDescFiles);  // 유효한 파일만 저장

        // 미리보기 설명 이미지 생성
        const previewDescUrls = validDescFiles.map(file => URL.createObjectURL(file));
        setPreviewDescImages(previewDescUrls);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 유효성 검사
        if (formData.productName.length > 100) {
            setProductNameError('상품명은 최대 100자까지 입력할 수 있습니다.');
            return;
        }
        if (formData.info.length > 500) {
            setInfoError('상품 설명은 최대 500자까지 입력할 수 있습니다.');
            return;
        }
        if (formData.manufacturer.length > 100) {
            setManufacturerError('제조사는 최대 100자까지 입력할 수 있습니다.');
            return;
        }

        const data = new FormData();
        data.append('categoryName', formData.categoryName);
        data.append('productName', formData.productName);
        data.append('price', formData.price);
        data.append('info', formData.info);
        data.append('manufacturer', formData.manufacturer);
        data.append('stock', formData.stock);

        // 상품 이미지를 FormData에 추가
        images.forEach((image) => {
            data.append('productImgUrls', image);
        });

        // 상품 설명 이미지를 FormData에 추가
        descImages.forEach((image) => {
            data.append('productDescImgUrls', image);
        });

        try {
            const token = localStorage.getItem('token');  // 로컬 스토리지에서 토큰 가져오기
            const response = await fetch('http://ec2-3-34-36-20.ap-northeast-2.compute.amazonaws.com:8081/api/admin/products', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,  // Authorization 헤더 추가
                },
                body: data
            });

            if (!response.ok) {
                throw new Error('상품 등록에 실패했습니다.');
            }
            console.log('상품이 성공적으로 등록되었습니다.');
            navigate('/admin/products');
        } catch (error) {
            try {
                await sendRefreshTokenAndStoreAccessToken();

                const token = localStorage.getItem('token');  // 로컬 스토리지에서 토큰 가져오기
                const response = await fetch('http://ec2-3-34-36-20.ap-northeast-2.compute.amazonaws.com:8081/api/admin/products', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,  // Authorization 헤더 추가
                    },
                    body: data
                });

                if (!response.ok) {
                    throw new Error('상품 등록에 실패했습니다.');
                }
                console.log('상품이 성공적으로 등록되었습니다.');
                navigate('/admin/products');
            } catch (error) {
                console.error('에러 발생:', error);
            }
        }
    };


    return (
        <div className="container mt-5">
            <h1 className="display-4 mb-4">상품 등록</h1>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                {/* 카테고리 선택 */}
                <div className="form-group row">
                    <label className="col-sm-2 col-form-label">카테고리 선택</label>
                    <div className="col-sm-3">
                        <select
                            name="categoryName"
                            value={formData.categoryName}
                            onChange={handleChange}
                            className="form-control"
                            required
                        >
                            <option value="">카테고리 선택</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.name}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="form-group row">
                    <label className="col-sm-2 col-form-label">상품명</label>
                    <div className="col-sm-3">
                        <input
                            type="text"
                            name="productName"
                            value={formData.productName}
                            onChange={handleChange}
                            className={`form-control ${productNameError ? "is-invalid" : ""}`}
                            required
                        />
                        {productNameError && <div className="invalid-feedback">{productNameError}</div>}
                    </div>
                </div>
                <div className="form-group row">
                    <label className="col-sm-2 col-form-label">가격</label>
                    <div className="col-sm-3">
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            className="form-control"
                            required
                        />
                    </div>
                </div>
                <div className="form-group row">
                    <label className="col-sm-2 col-form-label">상품 상세 설명</label>
                    <div className="col-sm-5">
                        <textarea
                            name="info"
                            value={formData.info}
                            onChange={handleChange}
                            rows="2"
                            className={`form-control ${infoError ? "is-invalid" : ""}`}
                        />
                        {infoError && <div className="invalid-feedback">{infoError}</div>}
                    </div>
                </div>
                <div className="form-group row">
                    <label className="col-sm-2 col-form-label">제조사</label>
                    <div className="col-sm-3">
                        <input
                            type="text"
                            name="manufacturer"
                            value={formData.manufacturer}
                            onChange={handleChange}
                            className={`form-control ${manufacturerError ? "is-invalid" : ""}`}
                        />
                        {manufacturerError && <div className="invalid-feedback">{manufacturerError}</div>}
                    </div>
                </div>
                <div className="form-group row">
                    <label className="col-sm-2 col-form-label">재고수</label>
                    <div className="col-sm-3">
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            className="form-control"
                            required
                        />
                    </div>
                </div>
                {/* 상품 이미지 업로드 필드 */}
                <div className="form-group row">
                    <label className="col-sm-2 col-form-label">상품 이미지 업로드</label>
                    <div className="col-sm-3">
                        <input
                            type="file"
                            name="productImgUrls"
                            onChange={handleImageChange}
                            className="form-control"
                            multiple
                            accept="image/jpeg, image/png, image/gif, image/webp"
                        />
                    </div>
                </div>

                {/* 상품 이미지 미리보기 */}
                <div className="form-group row">
                    <label className="col-sm-2 col-form-label">상품 이미지 미리보기</label>
                    <div className="col-sm-10">
                        <div className="row">
                            {previewImages.map((src, index) => (
                                <div key={index} className="col-md-3">
                                    <img
                                        src={src}
                                        alt={`미리보기 ${index + 1}`}
                                        className="img-thumbnail"
                                        style={{ width: '100%', height: 'auto' }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 상품 설명 이미지 업로드 필드 */}
                <div className="form-group row">
                    <label className="col-sm-2 col-form-label">상품 설명 이미지 업로드</label>
                    <div className="col-sm-3">
                        <input
                            type="file"
                            name="productDescImgUrls"
                            onChange={handleDescImageChange}
                            className="form-control"
                            multiple
                            accept="image/jpeg, image/png, image/gif, image/webp"
                        />
                    </div>
                </div>

                {/* 상품 설명 이미지 미리보기 */}
                <div className="form-group row">
                    <label className="col-sm-2 col-form-label">상품 설명 이미지 미리보기</label>
                    <div className="col-sm-10">
                        <div className="row">
                            {previewDescImages.map((src, index) => (
                                <div key={index} className="col-md-3">
                                    <img
                                        src={src}
                                        alt={`설명 이미지 미리보기 ${index + 1}`}
                                        className="img-thumbnail"
                                        style={{ width: '100%', height: 'auto' }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="form-group row">
                    <div className="col-sm-10">
                        <button type="submit" className="btn btn-primary">등록</button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProductCreate;
