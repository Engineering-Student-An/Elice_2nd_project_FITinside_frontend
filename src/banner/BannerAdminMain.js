// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import sendRefreshTokenAndStoreAccessToken from "../auth/RefreshAccessToken";
//
// const BannerAdminMain = () => {
//     const [banners, setBanners] = useState([]);
//     const [error, setError] = useState('');
//     const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호
//     const bannersPerPage = 10; // 한 페이지에 보여줄 배너 수
//     const navigate = useNavigate();
//
//     useEffect(() => {
//         fetchBanners();
//     }, []);
//
//     const fetchBanners = () => {
//         // 배너 목록 가져오기 (Authorization 헤더 추가)
//         axios.get('http://localhost:8080/api/banners', {
//             headers: {
//                 'Authorization': `Bearer ${localStorage.getItem('token')}`
//             }
//         })
//             .then(response => {
//                 const sortedBanners = response.data.sort((a, b) => a.displayOrder - b.displayOrder);
//                 setBanners(sortedBanners);
//             })
//             .catch(async error => {
//                 try {
//                     await sendRefreshTokenAndStoreAccessToken();
//                     axios.get('http://localhost:8080/api/banners', {
//                         headers: {
//                             'Authorization': `Bearer ${localStorage.getItem('token')}`
//                         }
//                     })
//                         .then(response => {
//                             const sortedBanners = response.data.sort((a, b) => a.displayOrder - b.displayOrder);
//                             setBanners(sortedBanners);
//                         })
//                 } catch (error) {
//                     console.error('Error fetching banners:', error);
//                     setError('배너 목록을 가져오는 중 오류가 발생했습니다.');
//                 }
//             });
//     };
//
//     const handleCreateBanner = () => {
//         navigate('/admin/banner/create');
//     };
//
//     const handleUpdateBanner = (id) => {
//         navigate(`/admin/banner/update/${id}`);
//     };
//
//     const handleDeleteBanner = (id) => {
//         if (!window.confirm('정말로 이 배너를 삭제하시겠습니까?')) return;
//
//         // 배너 삭제 요청 (Authorization 헤더 추가)
//         axios.delete(`http://localhost:8080/api/admin/banners/${id}`, {
//             headers: {
//                 'Authorization': `Bearer ${localStorage.getItem('token')}`
//             }
//         })
//             .then(() => {
//                 setBanners(banners.filter(banner => banner.id !== id)); // 상태를 업데이트하여 삭제된 배너를 목록에서 제거
//                 alert('배너가 성공적으로 삭제되었습니다.');
//             })
//             .catch(async error => {
//                 try {
//                     await sendRefreshTokenAndStoreAccessToken();
//                     if (!window.confirm('정말로 이 배너를 삭제하시겠습니까?')) return;
//
//                     // 배너 삭제 요청 (Authorization 헤더 추가)
//                     axios.delete(`http://localhost:8080/api/admin/banners/${id}`, {
//                         headers: {
//                             'Authorization': `Bearer ${localStorage.getItem('token')}`
//                         }
//                     })
//                         .then(() => {
//                             setBanners(banners.filter(banner => banner.id !== id)); // 상태를 업데이트하여 삭제된 배너를 목록에서 제거
//                             alert('배너가 성공적으로 삭제되었습니다.');
//                         })
//                 } catch(error) {
//                     console.error('Error deleting banner:', error);
//                     alert('배너 삭제 중 오류가 발생했습니다.');
//                 }
//             });
//     };
//
//     // 페이지네이션 관련 계산
//     const indexOfLastBanner = currentPage * bannersPerPage;
//     const indexOfFirstBanner = indexOfLastBanner - bannersPerPage;
//     const currentBanners = banners.slice(indexOfFirstBanner, indexOfLastBanner);
//     const totalPages = Math.ceil(banners.length / bannersPerPage); // 전체 페이지 수
//
//     // 페이지 이동 함수
//     const paginate = (pageNumber) => setCurrentPage(pageNumber);
//
//     return (
//         <div className="container" style={{marginTop: '90px'}}>
//             <h1 className="mb-4">배너 관리</h1>
//
//             {/* Bootstrap 스타일 버튼 */}
//             <button className="btn btn-primary mb-3" onClick={handleCreateBanner}>배너 생성하기</button>
//
//             {/* 에러 메시지 표시 */}
//             {error && <div className="alert alert-danger">{error}</div>}
//
//             {/* 테이블 스타일 적용 */}
//             <table className="table table-striped table-bordered">
//                 <thead className="table-light">
//                 <tr>
//                     <th>수정</th>
//                     <th>삭제</th>
//                     <th>제목</th>
//                     <th>이미지</th>
//                     <th>정렬 순서</th>
//                     <th>URL</th>
//
//                 </tr>
//                 </thead>
//                 <tbody>
//                 {currentBanners.length > 0 ? (
//                     currentBanners.map(banner => (
//                         <tr key={banner.id}>
//                             <td>
//                                 <button className="btn btn-secondary" onClick={() => handleUpdateBanner(banner.id)}>
//                                     수정
//                                 </button>
//                             </td>
//                             <td>
//                                 <button className="btn btn-danger" onClick={() => handleDeleteBanner(banner.id)}>
//                                     삭제
//                                 </button>
//                             </td>
//                             <td>{banner.title}</td>
//                             <td>
//                                 <img src={banner.imageUrl} alt={banner.title} width="100"/>
//                             </td>
//                             <td>{banner.displayOrder}</td>
//                             <td>
//                                 {banner.targetUrl ? (
//                                     <a href={banner.targetUrl} target="_blank" rel="noopener noreferrer">
//                                         {banner.targetUrl}
//                                     </a>
//                                 ) : 'No URL'}
//                             </td>
//                         </tr>
//                     ))
//                 ) : (
//                     <tr>
//                         <td colSpan="7" className="text-center">등록된 배너가 없습니다.</td>
//                     </tr>
//                 )}
//                 </tbody>
//             </table>
//
//             {/* 페이지네이션 */}
//             <nav>
//                 <ul className="pagination justify-content-center">
//                     <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
//                         <button className="page-link" onClick={() => paginate(currentPage - 1)}>
//                             이전
//                         </button>
//                     </li>
//                     {[...Array(totalPages)].map((_, index) => (
//                         <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
//                             <button className="page-link" onClick={() => paginate(index + 1)}>
//                                 {index + 1}
//                             </button>
//                         </li>
//                     ))}
//                     <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
//                         <button className="page-link" onClick={() => paginate(currentPage + 1)}>
//                             다음
//                         </button>
//                     </li>
//                 </ul>
//             </nav>
//         </div>
//     );
// };
//
// export default BannerAdminMain;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import sendRefreshTokenAndStoreAccessToken from "../auth/RefreshAccessToken";
//
// const BannerAdminMain = () => {
//     const [banners, setBanners] = useState([]);
//     const [error, setError] = useState('');
//     const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 번호를 0부터 시작
//     const bannersPerPage = 10; // 한 페이지에 보여줄 배너 수
//     const navigate = useNavigate();
//
//     useEffect(() => {
//         fetchBanners();
//     }, []);
//
//     const fetchBanners = () => {
//         // 배너 목록 가져오기 (Authorization 헤더 추가)
//         axios.get('http://localhost:8080/api/banners', {
//             headers: {
//                 'Authorization': `Bearer ${localStorage.getItem('token')}`
//             }
//         })
//             .then(response => {
//                 const sortedBanners = response.data.sort((a, b) => a.displayOrder - b.displayOrder);
//                 setBanners(sortedBanners);
//             })
//             .catch(async error => {
//                 try {
//                     await sendRefreshTokenAndStoreAccessToken();
//                     axios.get('http://localhost:8080/api/banners', {
//                         headers: {
//                             'Authorization': `Bearer ${localStorage.getItem('token')}`
//                         }
//                     })
//                         .then(response => {
//                             const sortedBanners = response.data.sort((a, b) => a.displayOrder - b.displayOrder);
//                             setBanners(sortedBanners);
//                         })
//                 } catch (error) {
//                     console.error('Error fetching banners:', error);
//                     setError('배너 목록을 가져오는 중 오류가 발생했습니다.');
//                 }
//             });
//     };
//
//     const handleCreateBanner = () => {
//         navigate('/admin/banner/create');
//     };
//
//     const handleUpdateBanner = (id) => {
//         navigate(`/admin/banner/update/${id}`);
//     };
//
//     const handleDeleteBanner = (id) => {
//         if (!window.confirm('정말로 이 배너를 삭제하시겠습니까?')) return;
//
//         // 배너 삭제 요청 (Authorization 헤더 추가)
//         axios.delete(`http://localhost:8080/api/admin/banners/${id}`, {
//             headers: {
//                 'Authorization': `Bearer ${localStorage.getItem('token')}`
//             }
//         })
//             .then(() => {
//                 setBanners(banners.filter(banner => banner.id !== id)); // 상태를 업데이트하여 삭제된 배너를 목록에서 제거
//                 alert('배너가 성공적으로 삭제되었습니다.');
//             })
//             .catch(async error => {
//                 try {
//                     await sendRefreshTokenAndStoreAccessToken();
//                     if (!window.confirm('정말로 이 배너를 삭제하시겠습니까?')) return;
//
//                     // 배너 삭제 요청 (Authorization 헤더 추가)
//                     axios.delete(`http://localhost:8080/api/admin/banners/${id}`, {
//                         headers: {
//                             'Authorization': `Bearer ${localStorage.getItem('token')}`
//                         }
//                     })
//                         .then(() => {
//                             setBanners(banners.filter(banner => banner.id !== id)); // 상태를 업데이트하여 삭제된 배너를 목록에서 제거
//                             alert('배너가 성공적으로 삭제되었습니다.');
//                         })
//                 } catch(error) {
//                     console.error('Error deleting banner:', error);
//                     alert('배너 삭제 중 오류가 발생했습니다.');
//                 }
//             });
//     };
//
//     // 페이지네이션 관련 계산
//     const indexOfLastBanner = (currentPage + 1) * bannersPerPage;
//     const indexOfFirstBanner = indexOfLastBanner - bannersPerPage;
//     const currentBanners = banners.slice(indexOfFirstBanner, indexOfLastBanner);
//     const totalPages = Math.ceil(banners.length / bannersPerPage); // 전체 페이지 수
//
//     const handlePageClick = (pageNumber) => {
//         setCurrentPage(pageNumber);
//     };
//
//     return (
//         <div className="container" style={{marginTop: '90px'}}>
//             <h1 className="mb-4">배너 관리</h1>
//
//             {/* Bootstrap 스타일 버튼 */}
//             <button className="btn btn-primary mb-3" onClick={handleCreateBanner}>배너 생성하기</button>
//
//             {/* 에러 메시지 표시 */}
//             {error && <div className="alert alert-danger">{error}</div>}
//
//             {/* 테이블 스타일 적용 */}
//             <table className="table table-striped table-bordered">
//                 <thead className="table-light">
//                 <tr>
//                     <th>수정</th>
//                     <th>삭제</th>
//                     <th>제목</th>
//                     <th>이미지</th>
//                     <th>정렬 순서</th>
//                     <th>URL</th>
//                 </tr>
//                 </thead>
//                 <tbody>
//                 {currentBanners.length > 0 ? (
//                     currentBanners.map(banner => (
//                         <tr key={banner.id}>
//                             <td>
//                                 <button className="btn btn-secondary" onClick={() => handleUpdateBanner(banner.id)}>
//                                     수정
//                                 </button>
//                             </td>
//                             <td>
//                                 <button className="btn btn-danger" onClick={() => handleDeleteBanner(banner.id)}>
//                                     삭제
//                                 </button>
//                             </td>
//                             <td>{banner.title}</td>
//                             <td>
//                                 <img src={banner.imageUrl} alt={banner.title} width="100"/>
//                             </td>
//                             <td>{banner.displayOrder}</td>
//                             <td>
//                                 {banner.targetUrl ? (
//                                     <a href={banner.targetUrl} target="_blank" rel="noopener noreferrer">
//                                         {banner.targetUrl}
//                                     </a>
//                                 ) : 'No URL'}
//                             </td>
//                         </tr>
//                     ))
//                 ) : (
//                     <tr>
//                         <td colSpan="6" className="text-center">등록된 배너가 없습니다.</td>
//                     </tr>
//                 )}
//                 </tbody>
//             </table>
//
//             {/* 페이지네이션 */}
//             <nav aria-label="Page navigation example">
//                 <ul className="pagination justify-content-center">
//                     {/* 맨앞으로 가기 버튼 */}
//                     <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
//                         <button
//                             className="page-link"
//                             onClick={() => handlePageClick(0)}
//                             aria-label="First">
//                             {/*<span aria-hidden="true">&laquo;&laquo;</span>*/}
//                             <span aria-hidden="true">&laquo;</span>
//                         </button>
//                     </li>
//
//                     {/* Previous 페이지 그룹 버튼 */}
//                     <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
//                         <button
//                             className="page-link"
//                             onClick={() => handlePageClick(Math.max(currentPage - 1, 0))}
//                             aria-label="Previous">
//                             <span aria-hidden="true">&#8249;</span>
//                         </button>
//                     </li>
//
//                     {/* 페이지 번호 버튼 */}
//                     {Array.from({ length: totalPages }, (_, index) => (
//                         <li key={index} className={`page-item ${currentPage === index ? 'active' : ''}`}>
//                             <button className="page-link" onClick={() => handlePageClick(index)}>
//                                 {index + 1}
//                             </button>
//                         </li>
//                     ))}
//
//                     {/* Next 페이지 그룹 버튼 */}
//                     <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
//                         <button
//                             className="page-link"
//                             onClick={() => handlePageClick(Math.min(currentPage + 1, totalPages - 1))}
//                             aria-label="Next">
//                             <span aria-hidden="true">&#8250;</span>
//                         </button>
//                     </li>
//
//                     {/* 맨뒤로 가기 버튼 */}
//                     <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
//                         <button
//                             className="page-link"
//                             onClick={() => handlePageClick(totalPages - 1)}
//                             aria-label="Last">
//                             <span aria-hidden="true">&raquo;</span>
//                         </button>
//                     </li>
//                 </ul>
//             </nav>
//         </div>
//     );
// };
//
// export default BannerAdminMain;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import sendRefreshTokenAndStoreAccessToken from "../auth/RefreshAccessToken";

const BannerAdminMain = () => {
    const [banners, setBanners] = useState([]);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 번호를 0부터 시작
    const bannersPerPage = 10; // 한 페이지에 보여줄 배너 수
    const navigate = useNavigate();

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = () => {
        // 배너 목록 가져오기 (Authorization 헤더 추가)
        axios.get('http://localhost:8080/api/banners', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(response => {
                const sortedBanners = response.data.sort((a, b) => a.displayOrder - b.displayOrder);
                setBanners(sortedBanners);
            })
            .catch(async error => {
                try {
                    await sendRefreshTokenAndStoreAccessToken();
                    axios.get('http://localhost:8080/api/banners', {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    })
                        .then(response => {
                            const sortedBanners = response.data.sort((a, b) => a.displayOrder - b.displayOrder);
                            setBanners(sortedBanners);
                        })
                } catch (error) {
                    console.error('Error fetching banners:', error);
                    setError('배너 목록을 가져오는 중 오류가 발생했습니다.');
                }
            });
    };

    const handleCreateBanner = () => {
        navigate('/admin/banner/create');
    };

    const handleUpdateBanner = (id) => {
        navigate(`/admin/banner/update/${id}`);
    };

    const handleDeleteBanner = (id) => {
        if (!window.confirm('정말로 이 배너를 삭제하시겠습니까?')) return;

        // 배너 삭제 요청 (Authorization 헤더 추가)
        axios.delete(`http://localhost:8080/api/admin/banners/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(() => {
                setBanners(banners.filter(banner => banner.id !== id)); // 상태를 업데이트하여 삭제된 배너를 목록에서 제거
                alert('배너가 성공적으로 삭제되었습니다.');
            })
            .catch(async error => {
                try {
                    await sendRefreshTokenAndStoreAccessToken();
                    if (!window.confirm('정말로 이 배너를 삭제하시겠습니까?')) return;

                    // 배너 삭제 요청 (Authorization 헤더 추가)
                    axios.delete(`http://localhost:8080/api/admin/banners/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    })
                        .then(() => {
                            setBanners(banners.filter(banner => banner.id !== id)); // 상태를 업데이트하여 삭제된 배너를 목록에서 제거
                            alert('배너가 성공적으로 삭제되었습니다.');
                        })
                } catch(error) {
                    console.error('Error deleting banner:', error);
                    alert('배너 삭제 중 오류가 발생했습니다.');
                }
            });
    };

    // 페이지네이션 관련 계산
    const indexOfLastBanner = (currentPage + 1) * bannersPerPage;
    const indexOfFirstBanner = indexOfLastBanner - bannersPerPage;
    const currentBanners = banners.slice(indexOfFirstBanner, indexOfLastBanner);
    const totalPages = Math.ceil(banners.length / bannersPerPage); // 전체 페이지 수

    const handlePageClick = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="container" style={{marginTop: '90px'}}>
            <h1 className="mb-4">배너 관리</h1>

            {/* Bootstrap 스타일 버튼 */}
            <button className="btn btn-primary mb-3" onClick={handleCreateBanner}>배너 생성하기</button>

            {/* 에러 메시지 표시 */}
            {error && <div className="alert alert-danger">{error}</div>}

            {/* 테이블 스타일 적용 */}
            <table className="table table-striped table-bordered">
                <thead className="table-light">
                <tr>
                    <th>수정</th>
                    <th>삭제</th>
                    <th>제목</th>
                    <th>이미지</th>
                    <th>정렬 순서</th>
                    <th>URL</th>
                </tr>
                </thead>
                <tbody>
                {currentBanners.length > 0 ? (
                    currentBanners.map(banner => (
                        <tr key={banner.id}>
                            <td>
                                <button className="btn btn-secondary" onClick={() => handleUpdateBanner(banner.id)}>
                                    수정
                                </button>
                            </td>
                            <td>
                                <button className="btn btn-danger" onClick={() => handleDeleteBanner(banner.id)}>
                                    삭제
                                </button>
                            </td>
                            <td>{banner.title}</td>
                            <td>
                                <img src={banner.imageUrl} alt={banner.title} width="100"/>
                            </td>
                            <td>{banner.displayOrder}</td>
                            <td>
                                {banner.targetUrl ? (
                                    <a href={banner.targetUrl} target="_blank" rel="noopener noreferrer">
                                        {banner.targetUrl}
                                    </a>
                                ) : 'No URL'}
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="6" className="text-center">등록된 배너가 없습니다.</td>
                    </tr>
                )}
                </tbody>
            </table>

            {/* 페이지네이션 */}
            <nav aria-label="Page navigation example">
                <ul className="pagination justify-content-center">
                    {/* 맨앞으로 가기 버튼 */}
                    <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => handlePageClick(0)}
                            aria-label="First">
                            <span aria-hidden="true">&laquo;</span>
                        </button>
                    </li>

                    {/* Previous 페이지 그룹 버튼 */}
                    <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => handlePageClick(Math.max(currentPage - 1, 0))}
                            aria-label="Previous">
                            <span aria-hidden="true">&#8249;</span>
                        </button>
                    </li>

                    {/* 페이지 번호 버튼 생성 */}
                    {Array.from({ length: 5 }, (_, index) => {
                        const pageNum = currentPage - 2 + index; // 현재 페이지를 기준으로 5개 생성
                        if (pageNum < 0 || pageNum >= totalPages) return null; // 페이지 번호가 유효하지 않으면 null 반환
                        return (
                            <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                <button className="page-link" onClick={() => handlePageClick(pageNum)}>
                                    {pageNum + 1} {/* 페이지 번호는 0부터 시작하므로 1을 더해 표시 */}
                                </button>
                            </li>
                        );
                    })}

                    {/* Next 페이지 그룹 버튼 */}
                    <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => handlePageClick(Math.min(currentPage + 1, totalPages - 1))}
                            aria-label="Next">
                            <span aria-hidden="true">&#8250;</span>
                        </button>
                    </li>

                    {/* 맨뒤로 가기 버튼 */}
                    <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => handlePageClick(totalPages - 1)}
                            aria-label="Last">
                            <span aria-hidden="true">&raquo;</span>
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default BannerAdminMain;
