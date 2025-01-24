import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './orderList.css';
import { FaSearch } from 'react-icons/fa';
import sendRefreshTokenAndStoreAccessToken from "../auth/RefreshAccessToken";
import {apiClient} from "../apiClient"; // 돋보기 아이콘

const statusOptions = [
    { value: 'ORDERED', label: '주문 완료' },
    { value: 'SHIPPING', label: '배송 중' },
    { value: 'COMPLETED', label: '배송 완료' },
    { value: 'CANCELLED', label: '주문 취소' }
];

// 주문 상태를 한글로 변환
const getStatusLabel = (statusValue) => {
    const status = statusOptions.find(option => option.value === statusValue);
    return status ? status.label : statusValue;
};

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태 추가
    const [error, setError] = useState(null);
    const [noResults, setNoResults] = useState(false); // 검색 결과가 없는지 여부

    useEffect(() => {
        fetchOrders(currentPage);
    }, [currentPage]);

    const fetchOrders = async (page, searchTerm = '') => {
        try {
            const token = localStorage.getItem('token');
            const response = await apiClient.get(`/api/orders?page=${page}&productName=${searchTerm}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.orders.length === 0) {
                setNoResults(true); // 검색 결과가 없을 때
            } else {
                setNoResults(false); // 검색 결과가 있을 때
            }

            setOrders(response.data.orders);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            try {
                await sendRefreshTokenAndStoreAccessToken();

                const token = localStorage.getItem('token');
                const response = await apiClient.get(`/api/orders?page=${page}&productName=${searchTerm}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.data.orders.length === 0) {
                    setNoResults(true); // 검색 결과가 없을 때
                } else {
                    setNoResults(false); // 검색 결과가 있을 때
                }

                setOrders(response.data.orders);
                setTotalPages(response.data.totalPages);
            } catch (err) {
                console.error('주문 목록 불러오기 실패:', err.response ? err.response.data : err.message);
                setError('주문 목록을 불러오는 중 오류가 발생했습니다.');
            }
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleFirstPage = () => {
        if (currentPage > 1) {
            setCurrentPage(1);
        }
    };

    const handleLastPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(totalPages);
        }
    };

    const handlePageClick = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value); // 검색어 업데이트
    };

    const handleSearchClick = () => {
        fetchOrders(1, searchTerm); // 검색 버튼 클릭 시 첫 페이지부터 검색
    };

    if (error) {
        return <div>{error}</div>;
    }

    const getStatusClass = (status) => {
        switch (status) {
            case 'ORDERED':
                return 'status-ordered';
            case 'SHIPPING':
                return 'status-shipping';
            case 'COMPLETED':
                return 'status-completed';
            case 'CANCELLED':
                return 'status-cancelled';
            default:
                return '';
        }
    };

    return (
        <div className="orderList container my-4">
            <h2 className="text-center mb-4" style={{marginTop: '90px'}}>주문 내역</h2>

            {/* 검색 기능 추가 */}
            <div className="input-group mb-4" style={{ maxWidth: '400px', margin: '0 auto' }}>
                <input
                    type="text"
                    className="form-control"
                    placeholder="상품명을 입력하세요"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    style={{ backgroundColor: '#e0e0e0', border: '1px solid #555' }}
                />
                <button
                    className="btn btn-dark"
                    type="button"
                    onClick={handleSearchClick}
                    style={{ backgroundColor: '#000', border: '1px solid #555' }}
                >
                    <FaSearch />
                </button>
            </div>

            {noResults && (
                <div className="text-center" style={{ color: '#ff0000', marginBottom: '20px' }}>
                    주문이 없습니다.
                </div>
            )}

            {/* 주문 목록 출력 */}
            <div className="order-card-list">
                {orders.map((order) => (
                    <div key={order.orderId} className="order-card card shadow-sm mb-4">
                        <div className="card-header">
                            <span className={`status-circle ${getStatusClass(order.orderStatus)}`}></span>
                            {getStatusLabel(order.orderStatus)}
                            <span className={`status-circle ${getStatusClass(order.orderStatus)}`}></span>
                        </div>
                        <div className="card-body d-flex">
                            {/* 대표 상품 이미지 추가 */}
                            {/*{order.productImgUrl && (*/}
                                <img
                                    src={
                                    order.productImgUrl ? order.productImgUrl : "/img/logo100x100.png"
                                }
                                    alt="주문 상품 대표 이미지"
                                    className="order-img"
                                />
                            {/*)}*/}
                            <div className="order-info">
                                <p className="card-text"><strong>주문 상품:</strong> {order.productNames.join(', ')}</p>
                                <p className="card-text"><strong>총 가격:</strong> {(order.totalPrice).toLocaleString()}원</p>
                                <p className="card-text"><strong>결제 금액:</strong> {(order.discountedTotalPrice).toLocaleString()}원</p>
                                <p className="card-text"><strong>주문 날짜:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="card-footer bg-light">
                            <p className="mb-1"><strong>배송 주소:</strong> {order.deliveryAddress}</p>
                            <Link to={`/orders/${order.orderId}`} className="btn btn-primary btn-sm d-block mt-2">
                                주문 상세 보기
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pagination justify-content-center">
                <ul className="pagination">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={handleFirstPage}
                                aria-label="First">
                            <span aria-hidden="true">&laquo;</span>
                        </button>
                    </li>
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={handlePreviousPage}>
                            <span aria-hidden="true">&#8249;</span>
                        </button>
                    </li>

                    {Array.from({ length: 5 }, (_, index) => {
                        const pageNum = currentPage - 2 + index;
                        if (pageNum < 1 || pageNum > totalPages) return null;
                        return (
                            <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                <button className="page-link" onClick={() => handlePageClick(pageNum)}>
                                    {pageNum}
                                </button>
                            </li>
                            );
                        })}

                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={handleNextPage}>
                            <span aria-hidden="true">&#8250;</span>
                        </button>
                    </li>
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={handleLastPage}
                                disabled={currentPage === totalPages}>
                            <span aria-hidden="true">&raquo;</span>
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default OrderList;