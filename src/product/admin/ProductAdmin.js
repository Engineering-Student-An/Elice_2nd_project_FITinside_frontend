import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProductAdmin.css';  // CSS 파일 임포트

const ProductAdmin = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0); // 현재 페이지 번호
    const [totalPages, setTotalPages] = useState(1); // 총 페이지 수
    const [pageSize] = useState(9); // 페이지당 상품 수

    // 정렬 기준 및 정렬 방향 상태
    const [sortField, setSortField] = useState('createdAt'); // 기본 정렬 필드: 생성일
    const [sortDir, setSortDir] = useState('desc'); // 기본 정렬 방향: 내림차순

    // 검색 관련 상태
    const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태
    const [searchType, setSearchType] = useState('productName'); // 검색 타입 상태 (상품명 또는 카테고리명)

    const navigate = useNavigate();

    // 상품 목록 가져오기
    useEffect(() => {
        fetchProducts(page);
    }, [page, sortField, sortDir]); // page, sortField, sortDir가 변경될 때마다 새 데이터를 가져옴

    const token = localStorage.getItem('token');
    const fetchProducts = async (pageNumber) => {
        try {
            setLoading(true); // 로딩 시작

            // 검색 타입에 따라 다른 엔드포인트 호출
            const endpoint = searchType === 'productName' ? '/api/products' : '/api/products/byCategory';

            const response = await axios.get(`http://localhost:8080${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,  // Authorization 헤더 추가
                },
                params: {
                    page: pageNumber,
                    size: pageSize,
                    sortField: sortField,  // 사용자가 선택한 정렬 기준
                    sortDir: sortDir,      // 사용자가 선택한 정렬 방향
                    keyword: searchTerm,   // 검색어 (상품 이름 또는 카테고리 이름)
                },
            });

            const data = response.data;
            console.log('받아온 데이터:', data);

            if (data && Array.isArray(data.content)) {
                setProducts(data.content); // 상품 목록 저장
                setTotalPages(data.totalPages); // 총 페이지 수 설정
            } else {
                setProducts([]); // 데이터가 비정상인 경우 빈 배열 설정
                setTotalPages(1);
            }
            setLoading(false); // 로딩 종료
        } catch (error) {
            console.error('상품 목록을 불러오는 중 오류 발생:', error);
            setError('상품 목록을 불러오는 중 오류가 발생했습니다.');
            setLoading(false);
        }
    };

    // 상품 삭제 로직
    const handleDeleteClick = async (productId) => {
        const confirmDelete = window.confirm("정말로 이 상품을 삭제하시겠습니까?");
        if (!confirmDelete) return;

        try {
            const response = await axios.delete(`http://localhost:8080/api/admin/products/${productId}`);
            if (response.status === 200) {
                // 삭제 성공 후 목록 갱신
                fetchProducts(page);
            } else {
                console.error('상품 삭제 실패');
                alert('상품 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('상품 삭제 중 오류 발생:', error);
            alert('상품 삭제 중 오류가 발생했습니다.');
        }
    };

    // 페이지 변경 핸들러
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
        }
    };

    // Navigate to create, update, delete routes
    const handleCreateProduct = () => {
        navigate('/admin/products/create');
    };

    const handleUpdateProduct = (id) => {
        navigate(`/admin/products/update/${id}`);
    };

    // 검색어 입력 처리 핸들러
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // 검색어 입력 후 Enter 키 입력 시 검색 실행
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            fetchProducts(0); // 검색 시 페이지를 처음으로 초기화
        }
    };

    // 검색 타입 선택 처리 핸들러
    const handleSearchTypeChange = (e) => {
        setSearchType(e.target.value);
    };

    if (loading) {
        return <p>로딩 중...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="page-content"> {/* 콘텐츠에 margin-top 적용 */}
            <div className="container mt-5">
                <h1 className="display-4 mb-4">상품 관리 </h1>
                <button onClick={handleCreateProduct} className="btn btn-primary mb-3">상품 등록</button>

                <div className="form-group mb-3">
                    <label>검색</label>
                    <div className="d-flex">
                        <select value={searchType} onChange={handleSearchTypeChange} className="form-control w-25">
                            <option value="productName">상품명</option>
                            <option value="categoryName">카테고리명</option>
                        </select>
                        <input
                            type="text"
                            className="form-control ml-2"
                            placeholder="검색어를 입력하세요"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyPress={handleKeyPress}
                        />
                    </div>
                </div>

                <div className="sorting-controls mb-3">
                    <label>정렬 기준: </label>
                    <select value={sortField} onChange={(e) => setSortField(e.target.value)} className="mx-2">
                        <option value="createdAt">생성일</option>
                        <option value="productName">상품명</option>
                        <option value="price">가격</option>
                        <option value="stock">재고</option>
                    </select>

                    <label>정렬 방향: </label>
                    <select value={sortDir} onChange={(e) => setSortDir(e.target.value)} className="mx-2">
                        <option value="asc">오름차순</option>
                        <option value="desc">내림차순</option>
                    </select>
                </div>

                <table className="table table-bordered">
                    <thead>
                    <tr>
                        <th>수정</th>
                        <th>삭제</th>
                        <th>카테고리 이름</th>
                        <th>상품 아이디</th>
                        <th>상품 이름</th>
                        <th>상품 이미지</th>
                        <th>상품 가격</th>
                        <th>상품 정보</th>
                        <th>상품 재고</th>
                        <th>제조사</th>
                        <th>생성일</th>
                        <th>수정일</th>
                        <th>상품 설명 이미지</th>
                        <th>품절 여부</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.length > 0 ? (
                        products.map((product) => (
                            <tr key={product.id}>
                                <td>
                                    <button
                                        onClick={() => handleUpdateProduct(product.id)}
                                        className="btn btn-warning"
                                    >
                                        ✏️
                                    </button>
                                </td>
                                <td>
                                    <button
                                        onClick={() => handleDeleteClick(product.id)}
                                        className="btn btn-danger"
                                    >
                                        ❌
                                    </button>
                                </td>
                                <td>{product.categoryName}</td>
                                <td>{product.id}</td>
                                <td>{product.productName}</td>
                                <td>
                                    {product.productImgUrls && product.productImgUrls.length > 0
                                        ? product.productImgUrls.map((url, index) => (
                                            <img key={index} src={url} alt={`Product ${product.id}`} width="50"/>
                                        ))
                                        : '이미지 없음'}
                                </td>
                                <td>{product.price}</td>
                                <td>{product.info}</td>
                                <td>{product.stock}</td>
                                <td>{product.manufacturer}</td>
                                <td>{product.createdAt}</td>
                                <td>{product.updatedAt}</td>
                                <td>
                                    {product.productDescImgUrls && product.productDescImgUrls.length > 0
                                        ? product.productDescImgUrls.map((url, index) => (
                                            <img key={index} src={url} alt={`Desc Image ${product.id}`} width="50"/>
                                        ))
                                        : '설명 이미지 없음'}
                                </td>
                                <td>{product.soldOut ? '품절' : '판매 중'}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="14" className="text-center">상품이 없습니다.</td>
                        </tr>
                    )}
                    </tbody>
                </table>

                <div className="d-flex justify-content-center">
                    <button
                        className="btn btn-secondary"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 0}
                    >
                        이전
                    </button>
                    <span className="mx-3">{page + 1} / {totalPages}</span>
                    <button
                        className="btn btn-secondary"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page + 1 >= totalPages}
                    >
                        다음
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductAdmin;
