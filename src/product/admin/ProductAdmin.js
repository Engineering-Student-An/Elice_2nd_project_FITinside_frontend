import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import sendRefreshTokenAndStoreAccessToken from '../../auth/RefreshAccessToken'; // 경로 수정
import styles from './ProductAdmin.module.css';  // CSS Modules로 변경

const ProductAdmin = () => {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0); // 현재 페이지 번호
    const [totalPages, setTotalPages] = useState(1); // 총 페이지 수
    const [pageSize] = useState(10); // 페이지당 상품 수
    const [dummyImage] = useState('/img/logo100x100.png'); // dummy 이미지 URL 설정

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

    const fetchProducts = async (pageNumber) => {
        const endpoint = searchType === 'productName' ? '/api/products' : '/api/products/byCategory'; // 검색 타입에 따라 다른 엔드포인트 호출

        try {
            const token = localStorage.getItem('token');

            const response = await axios.get(`https://zaswdsrcjxykrnsf.tunnel-pt.elice.io${endpoint}`, {
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
        } catch (error) {
            if (error.response && error.response.status === 401) {
                // 401 에러 발생 시 토큰 갱신 시도
                try {
                    await sendRefreshTokenAndStoreAccessToken();

                    // 토큰 갱신 후 다시 요청
                    const newResponse = await axios.get(`https://zaswdsrcjxykrnsf.tunnel-pt.elice.io${endpoint}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,  // 새로 발급된 토큰 사용
                        },
                        params: {
                            page: pageNumber,
                            size: pageSize,
                            sortField: sortField,
                            sortDir: sortDir,
                            keyword: searchTerm,
                        },
                    });

                    const newData = newResponse.data;
                    console.log('새로운 데이터:', newData);

                    if (newData && Array.isArray(newData.content)) {
                        setProducts(newData.content); // 새로운 상품 목록 저장
                        setTotalPages(newData.totalPages); // 총 페이지 수 설정
                    } else {
                        setProducts([]);
                        setTotalPages(1);
                    }
                } catch (refreshError) {
                    console.error('토큰 갱신 및 재요청 중 오류 발생:', refreshError);
                    setError('상품 목록을 불러오는 중 오류가 발생했습니다.');
                }
            } else {
                console.error('상품 목록을 불러오는 중 오류 발생:', error);
                setError('상품 목록을 불러오는 중 오류가 발생했습니다.');
            }
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

    // 페이지 변경 핸들러
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
            window.scrollTo(0, 0); // 페이지 변경 시 화면 최상단으로 이동
        }
    };

    // 상품 삭제 로직
    const handleDeleteClick = async (productId) => {
        const confirmDelete = window.confirm("정말로 이 상품을 삭제하시겠습니까?");
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem('token');  // 로컬 스토리지에서 토큰 가져오기
            const response = await axios.delete(`https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/admin/products/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,  // Authorization 헤더 추가
                },
            });

            if (response.status === 200) {
                // 삭제 성공 후 목록 갱신
                fetchProducts(page);
            } else {
                console.error('상품 삭제 실패');
                alert('상품 삭제에 실패했습니다.');
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                // 401 에러 발생 시 토큰 갱신 시도
                try {
                    await sendRefreshTokenAndStoreAccessToken();

                    // 토큰 갱신 후 다시 삭제 요청
                    const newResponse = await axios.delete(`https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/admin/products/${productId}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,  // 새로 발급된 토큰 사용
                        },
                    });

                    if (newResponse.status === 200) {
                        fetchProducts(page); // 성공 시 목록 갱신
                    } else {
                        console.error('상품 삭제 실패');
                        alert('상품 삭제에 실패했습니다.');
                    }
                } catch (refreshError) {
                    console.error('토큰 갱신 및 재요청 중 오류 발생:', refreshError);
                    alert('상품 삭제 중 오류가 발생했습니다.');
                }
            } else {
                console.error('상품 삭제 중 오류 발생:', error);
                alert('상품 삭제 중 오류가 발생했습니다.');
            }
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

    return (
        <div className={styles['page-content']}> {/* CSS Modules 적용 */}
            <div className="container mt-5">
                <h1 className="display-4 mb-4">상품 관리</h1>
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

                <table className={`${styles['table-c']} table-striped table-bordered`}> {/* CSS Modules로 클래스 변경 */}
                    <thead>
                    <tr>
                        <th>수정</th>
                        <th>삭제</th>
                        <th>카테고리</th>
                        <th>제조사</th>
                        <th>상품 아이디</th>
                        <th>상품 이름</th>
                        <th>상품 이미지</th>
                        <th>가격</th>
                        <th>재고수</th>
                        <th>품절 여부</th>
                        <th>생성일</th>
                        <th>수정일</th>
                        <th>바로가기</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.length > 0 ? (
                        products.map((product) => (
                            <tr key={product.id}>
                                <td>
                                    <button className="btn btn-secondary"
                                            onClick={() => handleUpdateProduct(product.id)}>
                                        수정
                                    </button>
                                </td>
                                <td>
                                    <button className="btn btn-danger" onClick={() => handleDeleteClick(product.id)}>
                                        삭제
                                    </button>
                                </td>
                                <td>{product.categoryName}</td>
                                <td>{product.manufacturer}</td>
                                <td>{product.id}</td>
                                <td>{product.productName}</td>
                                <td>
                                    {product.productImgUrls && product.productImgUrls.length > 0
                                        ?
                                        <img src={product.productImgUrls[0]} alt={`Product ${product.id}`} width="50"/>
                                        : <img src={dummyImage} alt="Dummy Product" width="50"/>}
                                </td>
                                <td>{Number(product.price).toLocaleString()}원</td>
                                <td>{Number(product.stock).toLocaleString()}개</td>
                                <td>{product.soldOut ? '품절' : '판매 중'}</td>
                                <td>{new Date(product.createdAt).toLocaleString()}</td>
                                <td>{new Date(product.updatedAt).toLocaleString()}</td>
                                <td>
                                    <a className="btn btn-primary btn-small" href={`/product/${product.id}`}
                                       target="_blank" rel="noopener noreferrer">
                                        상품
                                    </a>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="13" className="text-center">상품이 없습니다.</td>
                        </tr>
                    )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="d-flex justify-content-center">
                    <nav aria-label="Page navigation example">
                        <ul className="pagination justify-content-center">
                            {/* 맨앞으로 가기 버튼 */}
                            <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(0)} aria-label="First">
                                    <span aria-hidden="true">&#8249;&#8249;</span> {/* 맨 앞 버튼 */}
                                </button>
                            </li>

                            {/* Previous 페이지 그룹 버튼 */}
                            <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(page - 1)} aria-label="Previous">
                                    <span aria-hidden="true">&#8249;</span> {/* 이전 버튼 */}
                                </button>
                            </li>

                            {/* 페이지 번호 버튼 */}
                            {getPaginationNumbers().map((pageNumber) => (
                                <li key={pageNumber} className={`page-item ${page === pageNumber ? 'active' : ''}`}>
                                    <button className="page-link" onClick={() => handlePageChange(pageNumber)}>
                                        {pageNumber + 1}
                                    </button>
                                </li>
                            ))}

                            {/* Next 페이지 그룹 버튼 */}
                            <li className={`page-item ${page === totalPages - 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(page + 1)} aria-label="Next">
                                    <span aria-hidden="true">&#8250;</span> {/* 다음 버튼 */}
                                </button>
                            </li>

                            {/* 맨뒤로 가기 버튼 */}
                            <li className={`page-item ${page === totalPages - 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(totalPages - 1)} aria-label="Last">
                                    <span aria-hidden="true">&#8250;&#8250;</span> {/* 맨 뒤 버튼 */}
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default ProductAdmin;
