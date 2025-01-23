import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, Button, Row, Col } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './orderAdminList.css';
import sendRefreshTokenAndStoreAccessToken from "../auth/RefreshAccessToken";

const OrderAdminList = () => {
    const [orders, setOrders] = useState([]);
    const [pendingStatusChanges, setPendingStatusChanges] = useState({});
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState(null);
    const [isNoResults, setIsNoResults] = useState(false);  // 검색 결과 유무 상태 추가

    // 주문 상태와 날짜 필터링
    const [selectedStatus, setSelectedStatus] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // 관리자의 전체 주문 정보를 가져오는 API 호출
    const fetchAdminOrders = async (filter = false) => {
        try {
            const token = localStorage.getItem('token');
            const params = {
                page: currentPage,
                orderStatus: filter && selectedStatus ? selectedStatus : null,
                startDate: filter && startDate ? startDate.toLocaleDateString('en-CA') : null,
                endDate: filter && endDate ? endDate.toLocaleDateString('en-CA') : null
            };

            console.log('Params sent to api: ', params);

            const response = await axios.get('/api/admin/orders', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: params
            });

            setOrders(response.data.orders);
            setTotalPages(response.data.totalPages);

            if (response.data.orders.length === 0) {
                setIsNoResults(true);
            } else {
                setIsNoResults(false);
            }
        } catch (error) {
            try {
                await sendRefreshTokenAndStoreAccessToken();

                const token = localStorage.getItem('token');
                const params = {
                    page: currentPage,
                    orderStatus: filter && selectedStatus ? selectedStatus : null,
                    startDate: filter && startDate ? startDate.toLocaleDateString('en-CA') : null,
                    endDate: filter && endDate ? endDate.toLocaleDateString('en-CA') : null
                };

                console.log('Params sent to api: ', params);

                const response = await axios.get('/api/admin/orders', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    params: params
                });

                setOrders(response.data.orders);
                setTotalPages(response.data.totalPages);

                if (response.data.orders.length === 0) {
                    setIsNoResults(true);
                } else {
                    setIsNoResults(false);
                }
            } catch (err) {
                console.error('전체 주문 정보 불러오기 실패:', err.response ? err.response.data : err.message);
                setError('주문 목록을 불러오는 중 오류가 발생했습니다.');
            }
        }
    };

    // 처음 페이지 로드 시 전체 주문 목록 가져오기
    useEffect(() => {
        fetchAdminOrders();
    }, [currentPage]);

    // 검색 버튼 클릭 시 필터링된 주문 목록 가져오기
    const handleSearch = () => {
        fetchAdminOrders(true); // 필터링 모드로 호출
    };

    // 상태 변경을 임시로 저장
    const handleStatusChange = (orderId, newStatus) => {
        setPendingStatusChanges((prevChanges) => ({
            ...prevChanges,
            [orderId]: newStatus
        }));
    };

    const handleSaveStatusChange = async (orderId) => {
        const newStatus = pendingStatusChanges[orderId];

        // 만약 새로운 상태가 존재하지 않거나, 기존 상태와 동일한 경우 경고 메시지 표시
        const order = orders.find((o) => o.orderId === orderId);
        if (!newStatus || order.orderStatus === newStatus) {
            alert('변경된 값이 없습니다.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const requestData = { status: newStatus };

            const response = await axios.patch(`/api/admin/orders/${orderId}/status`, requestData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // 서버로부터 받은 새로운 주문 상태를 즉시 반영
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.orderId === orderId ? { ...order, orderStatus: response.data.orderStatus } : order
                )
            );

            alert('주문 상태가 성공적으로 수정되었습니다.');
            setPendingStatusChanges((prevChanges) => {
                const updatedChanges = { ...prevChanges };
                delete updatedChanges[orderId];
                return updatedChanges;
            });
            // window.location.reload();
            fetchAdminOrders(currentPage);
        } catch (error) {
            try {
                await sendRefreshTokenAndStoreAccessToken();

                const token = localStorage.getItem('token');
                const requestData = { status: newStatus };

                const response = await axios.patch(`/api/admin/orders/${orderId}/status`, requestData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // 서버로부터 받은 새로운 주문 상태를 즉시 반영
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order.orderId === orderId ? { ...order, orderStatus: response.data.orderStatus } : order
                    )
                );

                alert('주문 상태가 성공적으로 수정되었습니다.');
                setPendingStatusChanges((prevChanges) => {
                    const updatedChanges = { ...prevChanges };
                    delete updatedChanges[orderId];
                    return updatedChanges;
                });
                // window.location.reload();
                fetchAdminOrders(currentPage);
            } catch (err) {
                console.error('주문 상태 변경 실패:', err.response ? err.response.data : err.message);
                alert('주문 상태 변경에 실패했습니다. 다시 시도해주세요.');
            }
        }
    };

    const handleDeleteOrder = async (orderId) => {
        const confirmDelete = window.confirm('주문을 삭제하시겠습니까?');
        if (!confirmDelete) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/admin/orders/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            alert('주문이 성공적으로 삭제되었습니다.');
            fetchAdminOrders(currentPage);
        } catch (error) {
            try {
                await sendRefreshTokenAndStoreAccessToken();

                const token = localStorage.getItem('token');
                await axios.delete(`/api/admin/orders/${orderId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                alert('주문이 성공적으로 삭제되었습니다.');
                fetchAdminOrders(currentPage);
            } catch (err) {
                console.error('주문 삭제 실패:', err.response ? err.response.data : err.message);
                alert('주문 삭제에 실패했습니다. 다시 시도해주세요.');
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

    if (error) {
        return <div>{error}</div>;
    }

    const statusOptions = [
        { value: '', label: '전체 상태' },
        { value: 'ORDERED', label: '주문 완료' },
        { value: 'SHIPPING', label: '배송 중' },
        { value: 'COMPLETED', label: '배송 완료' },
        { value: 'CANCELLED', label: '주문 취소' }
    ];

    return (
        <div className="order-admin-container">
            <h2 className="order-admin-title">전체 주문 목록</h2>

            <Form>
                <Row className="align-items-center mb-3">
                    <Col xs="auto" className="d-flex align-items-center">
                        <Form.Group controlId="formStatus" className="d-flex align-items-center">
                            <Form.Label className="me-2">주문 상태</Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="me-2"
                            >
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>

                    <Col xs="auto" className="d-flex align-items-center">
                        <Form.Group controlId="formStartDate" className="d-flex align-items-center">
                            <Form.Label className="me-2">시작일</Form.Label>
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                dateFormat="yyyy-MM-dd"
                                placeholderText="시작 날짜 선택"
                                className="form-control me-2"
                            />
                        </Form.Group>
                    </Col>

                    <Col xs="auto" className="d-flex align-items-center">
                        <Form.Group controlId="formEndDate" className="d-flex align-items-center">
                            <Form.Label className="me-2">종료일</Form.Label>
                            <DatePicker
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                dateFormat="yyyy-MM-dd"
                                placeholderText="종료 날짜 선택"
                                className="form-control me-2"
                            />
                        </Form.Group>
                    </Col>

                    <Col xs="auto" className="d-flex align-items-end">
                        <Button variant="primary" onClick={handleSearch}>
                            검색
                        </Button>
                    </Col>
                </Row>
            </Form>

            {isNoResults && <p className="no-results">해당 주문이 없습니다.</p>}

            <table className="order-admin-table">
                <thead>
                <tr>
                    <th>수정</th>
                    <th>삭제</th>
                    <th>주문 상태</th>
                    <th>주문 날짜</th>
                    <th>이메일</th>
                    <th>총 가격</th>
                    <th>결제 금액</th>
                    <th>쿠폰 할인</th>
                </tr>
                </thead>
                <tbody>
                {orders.map((order) => (
                    <tr key={order.orderId}>
                        <td>
                            {/*<button className="action-button" onClick={() => handleSaveStatusChange(order.orderId)}>수정</button>*/}
                            <button className="btn btn-secondary" onClick={() => handleSaveStatusChange(order.orderId)}>수정</button>
                            {/*<button className="action-button delete-button" onClick={() => handleDeleteOrder(order.orderId)}>삭제</button>*/}
                        </td><td>
                            {/*<button className="btn btn-secondary" onClick={() => handleSaveStatusChange(order.orderId)}>수정</button>*/}
                            {/*<button className="action-button delete-button" onClick={() => handleDeleteOrder(order.orderId)}>삭제</button>*/}
                            <button className="btn btn-danger" onClick={() => handleDeleteOrder(order.orderId)}>삭제</button>
                        </td>
                        <td>
                            <select
                                value={pendingStatusChanges[order.orderId] || order.orderStatus}
                                onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                            >
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleString()}</td>
                        <td>{order.email}</td>
                        <td>{(order.totalPrice).toLocaleString()}원</td>
                        <td>{(order.discountedTotalPrice).toLocaleString()}원</td>
                        <td>
                            {order.coupons && order.coupons.length > 0 ? (
                                order.coupons.map((coupon, index) => (
                                    <div key={index}>
                                        {coupon.name} ({(coupon.discountPrice).toLocaleString()}원)
                                    </div>
                                ))
                            ) : (
                                <div>-</div>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

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

export default OrderAdminList;