import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import './ProductList.css'; // Import CSS file for custom styles

const ProductList = () => {
    const { categoryId } = useParams(); // URL에서 categoryId를 가져옴
    const [categoryName, setCategoryName] = useState(''); // 카테고리 이름 상태
    const [products, setProducts] = useState([]); // 초기 값을 빈 배열로 설정
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0); // 현재 페이지 상태
    const [size, setSize] = useState(12); // 페이지당 아이템 수
    const [sortField, setSortField] = useState('createdAt'); // 정렬 필드
    const [sortDir, setSortDir] = useState('desc'); // 정렬 방향
    const [keyword, setKeyword] = useState(''); // 검색어
    const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수 상태
    const [searchKeyword, setSearchKeyword] = useState(''); // 엔터로 입력할 검색어

    const dummyImage = 'https://dummyimage.com/100x100'; // dummy 이미지 URL 설정

    // 카테고리 이름을 가져오는 함수
    const fetchCategoryName = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/categories/${categoryId}`); // 카테고리 정보를 가져오는 API 호출
            setCategoryName(response.data.name); // 응답에서 카테고리 이름 설정
        } catch (err) {
            setError('카테고리 정보를 불러오는 데 실패했습니다.');
        }
    };

    // 상품 목록을 백엔드에서 가져오는 함수
    const fetchProducts = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/products/category/${categoryId}`, {
                params: {
                    page,
                    size,
                    sortField,
                    sortDir,
                    keyword: searchKeyword // 엔터로 입력한 키워드로 검색
                }
            });

            // 응답에서 데이터와 전체 페이지 수 추출
            const productData = Array.isArray(response.data.content) ? response.data.content : [];
            const totalPages = response.data.totalPages || 1; // totalPages가 없는 경우 기본값 1

            setProducts(productData);
            setTotalPages(totalPages);
        } catch (err) {
            setError('상품 목록을 불러오는 데 실패했습니다.');
        }
    };

    // 페이지네이션 로직 함수 (페이지네이션 숫자를 5개로 제한)
    const getPaginationNumbers = () => {
        const maxPageButtons = 5; // 한 번에 보여줄 페이지 버튼 수
        let startPage = Math.max(0, page - Math.floor(maxPageButtons / 2)); // 시작 페이지 번호
        let endPage = Math.min(totalPages, startPage + maxPageButtons); // 끝 페이지 번호

        if (endPage - startPage < maxPageButtons) {
            startPage = Math.max(0, endPage - maxPageButtons);
        }

        return Array.from({ length: endPage - startPage }, (_, index) => startPage + index);
    };

    // 카테고리 이름과 상품 목록을 가져오는 useEffect 훅
    useEffect(() => {
        fetchCategoryName(); // 카테고리 이름 가져오기
        fetchProducts(); // 상품 목록 가져오기
    }, [categoryId, page, size, sortField, sortDir, searchKeyword]);

    // 페이지 클릭 핸들러
    const handlePageClick = (pageNumber) => {
        setPage(pageNumber);
        window.scrollTo(0, 0); // 페이지 클릭 시 최상단으로 스크롤
    };

    // 검색어 입력 필드에서 엔터키 눌렀을 때 동작
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            setSearchKeyword(keyword); // 엔터키를 눌렀을 때만 키워드를 검색어로 설정
        }
    };

    return (
        <>
            {/* Header */}
            <header className="bg-dark py-5">
                <div className="container px-4 px-lg-5 my-5">
                    <div className="text-center text-white">
                        <h1 className="display-4 fw-bolder">{categoryName} </h1> {/* 카테고리 이름 표시 */}
                        <p className="lead fw-normal text-white-50 mb-0">Explore the best products in the {categoryName} category</p>
                    </div>
                </div>
            </header>

            {/* 검색과 정렬 옵션 */}
            <div className="container mt-4">
                <div className="row">
                    <div className="col-md-6">
                        <input
                            type="text"
                            placeholder="검색어를 입력하세요"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)} // 검색어 상태 변경
                            onKeyPress={handleKeyPress} // 엔터키 입력 시 검색어 적용
                            className="form-control"
                        />
                    </div>
                    <div className="col-md-3">
                        <select className="form-select" value={sortField} onChange={(e) => setSortField(e.target.value)}>
                            <option value="createdAt">생성일</option>
                            <option value="price">가격</option>
                            <option value="productName">상품명</option>
                        </select>
                    </div>
                    <div className="col-md-3">
                        <select className="form-select" value={sortDir} onChange={(e) => setSortDir(e.target.value)}>
                            <option value="asc">오름차순</option>
                            <option value="desc">내림차순</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 상품 목록 */}
            <section className="py-5">
                <div className="container px-4 px-lg-5 mt-5">
                    <div className="row gx-4 gx-lg-5 row-cols-2 row-cols-md-3 row-cols-xl-4 justify-content-center">
                        {products.map((product) => (
                            <div className="col mb-5" key={product.id}>
                                <div className="card h-100">
                                    {/* 품절 표시 */}
                                    {product.soldOut && (
                                        <div className="badge bg-danger text-white position-absolute" style={{ top: '0.5rem', right: '0.5rem' }}>
                                            품절
                                        </div>
                                    )}
                                    {/* Product image */}
                                    {product.productImgUrls && product.productImgUrls.length > 0 ? (
                                        <img className="card-img-top product-image" src={product.productImgUrls[0]} alt={product.productName} />
                                    ) : (
                                        <img className="card-img-top product-image" src={dummyImage} alt="No image available" />
                                    )}
                                    {/* Product details */}
                                    <div className="card-body p-4">
                                        <div className="text-center">
                                            {/* Product name */}
                                            <h5 className="fw-bolder">{product.productName}</h5>
                                            {/* Product price */}
                                            <div>
                                                {product.oldPrice && (
                                                    <span className="text-muted text-decoration-line-through">
                                                        {product.oldPrice.toLocaleString()}원
                                                    </span>
                                                )}
                                                <span> {product.price.toLocaleString()}원</span>
                                            </div>

                                        </div>
                                    </div>
                                    {/* Product actions */}
                                    <div className="card-footer p-4 pt-0 border-top-0 bg-transparent">
                                        <div className="text-center">
                                            <Link className="btn btn-outline-dark mt-auto" to={`/product/${product.id}`}>
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <nav aria-label="Page navigation example">
                        <ul className="pagination justify-content-center">
                            {/* 맨앞으로 가기 버튼 */}
                            <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setPage(0)} aria-label="First">
                                    <span aria-hidden="true">&#8249;&#8249;</span>
                                </button>
                            </li>

                            {/* Previous 페이지 그룹 버튼 */}
                            <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setPage((prev) => Math.max(prev - 1, 0))} aria-label="Previous">
                                    <span aria-hidden="true">&#8249;</span>
                                </button>
                            </li>

                            {/* 페이지 번호 버튼 */}
                            {getPaginationNumbers().map((pageNumber) => (
                                <li key={pageNumber} className={`page-item ${page === pageNumber ? 'active' : ''}`}>
                                    <button className="page-link" onClick={() => handlePageClick(pageNumber)}>
                                        {pageNumber + 1}
                                    </button>
                                </li>
                            ))}

                            {/* Next 페이지 그룹 버튼 */}
                            <li className={`page-item ${page === totalPages - 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))} aria-label="Next">
                                    <span aria-hidden="true">&#8250;</span>
                                </button>
                            </li>

                            {/* 맨뒤로 가기 버튼 */}
                            <li className={`page-item ${page === totalPages - 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setPage(totalPages - 1)} aria-label="Last">
                                    <span aria-hidden="true">&#8250;&#8250;</span>
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </section>
        </>
    );
};

export default ProductList;
