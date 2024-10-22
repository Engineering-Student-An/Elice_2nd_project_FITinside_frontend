import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import qs from "qs";

const ProductUpdate = () => {
    const { id } = useParams(); // URL에서 상품 ID를 가져옴
    const navigate = useNavigate();

    // 상품 정보 상태
    const [product, setProduct] = useState({
        categoryName: "",
        productName: "",
        price: "",
        info: "",
        stock: "",
        manufacturer: "",
        productImgUrls: [],
        productDescImgUrls: [],
    });

    const [newImages, setNewImages] = useState([]); // 새로운 이미지 파일
    const [previewImages, setPreviewImages] = useState([]); // 이미지 미리보기
    const [newDescImages, setNewDescImages] = useState([]); // 새로운 설명 이미지 파일
    const [descPreviewImages, setDescPreviewImages] = useState([]); // 설명 이미지 미리보기
    const [imageUrlsToDelete, setImageUrlsToDelete] = useState([]); // 삭제할 상품 이미지
    const [descImageUrlsToDelete, setDescImageUrlsToDelete] = useState([]); // 삭제할 설명 이미지

    const [productNameError, setProductNameError] = useState("");
    const [infoError, setInfoError] = useState("");
    const [manufacturerError, setManufacturerError] = useState("");
    const [error, setError] = useState(""); // 기타 에러 상태
    const [loading, setLoading] = useState(true); // 로딩 상태
    const [categories, setCategories] = useState([]); // 카테고리 목록 상태

    // 상품 정보 불러오기
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const token = localStorage.getItem('token');  // 로컬 스토리지에서 토큰 가져오기
                const response = await axios.get(`http://localhost:8080/api/products/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`  // Authorization 헤더 추가
                    }
                });
                setProduct(response.data); // 기존 상품 정보 설정
                setLoading(false);
            } catch (err) {
                console.error("상품 정보를 불러오는 중 오류 발생:", err);
                setError("상품 정보를 불러오는 중 오류가 발생했습니다.");
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);


    // 카테고리 목록을 불러와 필터링
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem('token');  // 로컬 스토리지에서 토큰 가져오기
                const response = await axios.get('http://localhost:8080/api/categories', {
                    headers: {
                        'Authorization': `Bearer ${token}`  // Authorization 헤더 추가
                    }
                });
                const filteredCategories = response.data.filter(
                    (category) => category.parentId !== null
                );
                setCategories(filteredCategories);
            } catch (err) {
                console.error("카테고리 목록을 불러오는 중 오류 발생:", err);
                setError("카테고리 목록을 불러오는 중 오류가 발생했습니다.");
            }
        };
        fetchCategories();
    }, []);


    // 입력 값 변경 처리 (각 필드별 글자 수 제한 추가)
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // productName 글자 수 제한 (최대 100자)
        if (name === "productName" && value.length > 100) {
            setProductNameError("상품명은 최대 100자까지 입력할 수 있습니다.");
        } else {
            setProductNameError("");
        }

        // info 글자 수 제한 (최대 500자)
        if (name === "info" && value.length > 500) {
            setInfoError("상품 설명은 최대 500자까지 입력할 수 있습니다.");
        } else {
            setInfoError("");
        }

        // manufacturer 글자 수 제한 (최대 100자)
        if (name === "manufacturer" && value.length > 100) {
            setManufacturerError("제조사는 최대 100자까지 입력할 수 있습니다.");
        } else {
            setManufacturerError("");
        }

        setProduct((prevProduct) => ({
            ...prevProduct,
            [name]: value,
        }));
    };

    // 이미지 파일 선택 처리 및 미리보기
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setNewImages(files);
        setPreviewImages(files.map((file) => URL.createObjectURL(file))); // 미리보기 이미지 생성
    };

    // 설명 이미지 파일 선택 처리 및 미리보기
    const handleDescFileChange = (e) => {
        const files = Array.from(e.target.files);
        setNewDescImages(files);
        setDescPreviewImages(files.map((file) => URL.createObjectURL(file))); // 미리보기 이미지 생성
    };

    // 삭제할 이미지 선택 처리
    const handleImageDelete = (url) => {
        setImageUrlsToDelete((prev) => [...prev, url]);
        setProduct((prevProduct) => ({
            ...prevProduct,
            productImgUrls: prevProduct.productImgUrls.filter((img) => img !== url),
        }));
    };

    // 삭제할 설명 이미지 선택 처리
    const handleDescImageDelete = (url) => {
        setDescImageUrlsToDelete((prev) => [...prev, url]);
        setProduct((prevProduct) => ({
            ...prevProduct,
            productDescImgUrls: prevProduct.productDescImgUrls.filter(
                (img) => img !== url
            ),
        }));
    };

    // 상품 이미지 삭제 요청
    const deleteProductImages = async () => {
        try {
            const token = localStorage.getItem('token');  // 로컬 스토리지에서 토큰 가져오기

            if (imageUrlsToDelete.length > 0) {
                await axios.delete(
                    `http://localhost:8080/api/admin/products/${id}/images`,
                    {
                        params: { imageUrlsToDelete },
                        headers: {
                            'Authorization': `Bearer ${token}`,  // Authorization 헤더 추가
                        },
                        paramsSerializer: (params) => {
                            return qs.stringify(params, { arrayFormat: "repeat" });
                        },
                    }
                );
            }

            if (descImageUrlsToDelete.length > 0) {
                await axios.delete(
                    `http://localhost:8080/api/admin/products/${id}/description-images`,
                    {
                        params: { descImageUrlsToDelete },
                        headers: {
                            'Authorization': `Bearer ${token}`,  // Authorization 헤더 추가
                        },
                        paramsSerializer: (params) => {
                            return qs.stringify(params, { arrayFormat: "repeat" });
                        },
                    }
                );
            }
        } catch (err) {
            console.error("이미지 삭제 중 오류 발생:", err);
            setError("이미지 삭제에 실패했습니다.");
        }
    };


    // 상품 수정 요청 처리
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 유효성 검사
        if (product.productName.length > 100) {
            setProductNameError("상품명은 최대 100자까지 입력할 수 있습니다.");
            return;
        }
        if (product.info.length > 500) {
            setInfoError("상품 설명은 최대 500자까지 입력할 수 있습니다.");
            return;
        }
        if (product.manufacturer.length > 100) {
            setManufacturerError("제조사는 최대 100자까지 입력할 수 있습니다.");
            return;
        }

        const formData = new FormData();
        formData.append("categoryName", product.categoryName);
        formData.append("productName", product.productName);
        formData.append("price", product.price);
        formData.append("info", product.info);
        formData.append("stock", product.stock);
        formData.append("manufacturer", product.manufacturer);

        // 새로운 이미지 파일 추가
        newImages.forEach((image) => {
            formData.append("productImgUrls", image);
        });

        // 새로운 설명 이미지 파일 추가
        newDescImages.forEach((image) => {
            formData.append("productDescImgUrls", image);
        });

        try {
            const token = localStorage.getItem('token');  // 로컬 스토리지에서 토큰 가져오기

            // 상품 업데이트 요청
            await axios.put(`http://localhost:8080/api/admin/products/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,  // Authorization 헤더 추가
                },
            });

            // 이미지 삭제 처리
            await deleteProductImages();

            navigate("/admin/products");
        } catch (err) {
            console.error("상품 수정 중 오류 발생:", err);
            setError("상품 수정에 실패했습니다.");
        }
    };


    if (loading) {
        return <p>로딩 중...</p>;
    }

    if (error) {
        return <p className="text-danger">{error}</p>;
    }

    return (
        <div className="container mt-5">
            <h1 className="display-4 mb-4">상품 수정 </h1>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                {/* 카테고리 선택 */}
                <div className="form-group">
                    <label>카테고리 선택</label>
                    <select
                        className="form-control"
                        name="categoryName"
                        value={product.categoryName}
                        onChange={handleInputChange}
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

                {/* 상품명 입력 (글자 수 제한 에러 메시지 추가) */}
                <div className="form-group">
                    <label>상품명</label>
                    <input
                        type="text"
                        className={`form-control ${productNameError ? "is-invalid" : ""}`}
                        name="productName"
                        value={product.productName}
                        onChange={handleInputChange}
                        required
                    />
                    {productNameError && <div className="invalid-feedback">{productNameError}</div>}
                </div>

                {/* 가격 입력 */}
                <div className="form-group">
                    <label>가격</label>
                    <input
                        type="number"
                        className="form-control"
                        name="price"
                        value={product.price}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                {/* 상품 설명 입력 (글자 수 제한 에러 메시지 추가) */}
                <div className="form-group">
                    <label>상품 설명</label>
                    <textarea
                        className={`form-control ${infoError ? "is-invalid" : ""}`}
                        name="info"
                        value={product.info}
                        onChange={handleInputChange}
                        required
                    ></textarea>
                    {infoError && <div className="invalid-feedback">{infoError}</div>}
                </div>

                {/* 재고 입력 */}
                <div className="form-group">
                    <label>재고</label>
                    <input
                        type="number"
                        className="form-control"
                        name="stock"
                        value={product.stock}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                {/* 제조사 입력 (글자 수 제한 에러 메시지 추가) */}
                <div className="form-group">
                    <label>제조사</label>
                    <input
                        type="text"
                        className={`form-control ${manufacturerError ? "is-invalid" : ""}`}
                        name="manufacturer"
                        value={product.manufacturer}
                        onChange={handleInputChange}
                    />
                    {manufacturerError && <div className="invalid-feedback">{manufacturerError}</div>}
                </div>

                {/* 상품 이미지 추가 및 미리보기 */}
                <div className="form-group">
                    <label>상품 이미지 추가</label>
                    <input
                        type="file"
                        className="form-control"
                        name="productImgUrls"
                        onChange={handleFileChange}
                        multiple
                    />
                    <div>
                        {previewImages.map((src, index) => (
                            <img key={index} src={src} alt="미리보기" width="100" />
                        ))}
                        {product.productImgUrls.map((url) => (
                            <div key={url}>
                                <img src={url} alt="상품 이미지" width="100" />
                                <button type="button" onClick={() => handleImageDelete(url)}>
                                    삭제
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 설명 이미지 추가 및 미리보기 */}
                <div className="form-group">
                    <label>설명 이미지 추가</label>
                    <input
                        type="file"
                        className="form-control"
                        name="productDescImgUrls"
                        onChange={handleDescFileChange}
                        multiple
                    />
                    <div>
                        {descPreviewImages.map((src, index) => (
                            <img key={index} src={src} alt="미리보기" width="100" />
                        ))}
                        {product.productDescImgUrls.map((url) => (
                            <div key={url}>
                                <img src={url} alt="설명 이미지" width="100" />
                                <button type="button" onClick={() => handleDescImageDelete(url)}>
                                    삭제
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <button type="submit" className="btn btn-primary mt-3">
                    수정하기
                </button>
            </form>
        </div>
    );
};

export default ProductUpdate;
