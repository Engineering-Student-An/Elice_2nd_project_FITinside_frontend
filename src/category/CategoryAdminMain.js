import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';  // Bootstrap CSS import
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import sendRefreshTokenAndStoreAccessToken from "../auth/RefreshAccessToken"; // Bootstrap JS import

const CategoryAdminMain = () => {
    const [categories, setCategories] = useState([]);
    const [selectedParentId, setSelectedParentId] = useState(null);
    const [parentPage, setParentPage] = useState(1);
    const [childPage, setChildPage] = useState(1);
    const [viewOption, setViewOption] = useState(1);
    const categoriesPerPage = 5;
    const categoriesPerPageOption2 = 10;
    const navigate = useNavigate();

    const fetchCategories = async () => {
        try {
            const response = await axios.get('https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/categories', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });

            const sortedCategories = response.data;

            const sortedParentCategories = sortedCategories
                .filter(category => category.parentId === null)
                .sort((a, b) => a.displayOrder - b.displayOrder);

            const sortedChildCategories = sortedCategories
                .filter(category => category.parentId !== null)
                .sort((a, b) => a.displayOrder - b.displayOrder);

            setCategories([...sortedParentCategories, ...sortedChildCategories]);
        } catch (error) {
            try {
                await sendRefreshTokenAndStoreAccessToken();
                const response = await axios.get('https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/categories', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                });

                const sortedCategories = response.data;

                const sortedParentCategories = sortedCategories
                    .filter(category => category.parentId === null)
                    .sort((a, b) => a.displayOrder - b.displayOrder);

                const sortedChildCategories = sortedCategories
                    .filter(category => category.parentId !== null)
                    .sort((a, b) => a.displayOrder - b.displayOrder);

                setCategories([...sortedParentCategories, ...sortedChildCategories]);
            } catch (error) {
                console.error('카테고리 목록을 가져오는 데 실패했습니다.', error);
                if (error.response && error.response.status === 401) {
                    alert("인증이 필요합니다. 로그인 상태를 확인하세요.");
                }
            }
        }
    };

    const deleteCategory = async (categoryId) => {
        const hasChildCategories = categories.some(category => category.parentId === categoryId);

        if (hasChildCategories) {
            alert("자식 카테고리가 있어 삭제가 불가능합니다.");
            return;
        }

        const confirmDelete = window.confirm("이 카테고리를 삭제하시겠습니까?");
        if (!confirmDelete) return;

        try {
            await axios.delete(`https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/admin/categories/${categoryId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setCategories(categories.filter(category => category.id !== categoryId));
            alert("카테고리가 삭제되었습니다.");
            window.location.reload();
        } catch (error) {
            try {
                await sendRefreshTokenAndStoreAccessToken();
                const hasChildCategories = categories.some(category => category.parentId === categoryId);

                if (hasChildCategories) {
                    alert("자식 카테고리가 있어 삭제가 불가능합니다.");
                    return;
                }

                const confirmDelete = window.confirm("이 카테고리를 삭제하시겠습니까?");
                await axios.delete(`https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/admin/categories/${categoryId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setCategories(categories.filter(category => category.id !== categoryId));
                alert("카테고리가 삭제되었습니다.");
                window.location.reload();

            } catch (error) {
                console.error('카테고리 삭제 중 오류가 발생했습니다.', error);
                if (error.response && error.response.status === 401) {
                    alert("인증이 필요합니다. 로그인 상태를 확인하세요.");
                }
            }
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const parentCategories = categories.filter(category => category.parentId === null);
    const childCategories = selectedParentId
        ? categories.filter(category => category.parentId === selectedParentId)
        : [];

    const handleCreateCategory = () => {
        navigate('/category-create');
    };

    const handleUpdateCategory = (categoryId) => {
        navigate(`/category-update/${categoryId}`);
    };

    const handleParentCategoryClick = (parentId) => {
        setSelectedParentId(parentId === selectedParentId ? null : parentId);
        setChildPage(1);
    };

    const paginatedCategories = (categories, page, perPage) => {
        const startIndex = (page - 1) * perPage;
        return categories.slice(startIndex, startIndex + perPage);
    };

    const totalParentPages = Math.ceil(parentCategories.length / categoriesPerPage);
    const totalChildPages = Math.ceil(childCategories.length / categoriesPerPage);
    const totalOption2Pages = Math.ceil(categories.length / categoriesPerPageOption2);

    const handleViewOptionChange = (e) => {
        setViewOption(Number(e.target.value));
    };

    const renderPageButtons = (currentPage, totalPages, setPage) => {
        return (
            <>
                {/* 맨앞으로 가기 버튼 */}
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                        className="page-link"
                        onClick={() => setPage(1)}
                        aria-label="First">
                        <span aria-hidden="true">&laquo;</span>
                    </button>
                </li>

                {/* 이전 페이지 그룹 버튼 */}
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                        className="page-link"
                        onClick={() => setPage(Math.max(currentPage - 1, 1))}
                        aria-label="Previous">
                        <span aria-hidden="true">&#8249;</span>
                    </button>
                </li>

                {/* 페이지 번호 생성 */}
                {Array.from({ length: 5 }, (_, index) => {
                    const pageNum = currentPage - 2 + index; // 현재 페이지를 기준으로 5개 생성
                    if (pageNum < 1 || pageNum > totalPages) return null; // 페이지 번호가 유효하지 않으면 null 반환
                    return (
                        <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => setPage(pageNum)}>
                                {pageNum}
                            </button>
                        </li>
                    );
                })}

                {/* 다음 페이지 그룹 버튼 */}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                        className="page-link"
                        onClick={() => setPage(Math.min(currentPage + 1, totalPages))}
                        aria-label="Next">
                        <span aria-hidden="true">&#8250;</span>
                    </button>
                </li>

                {/* 맨뒤로 가기 버튼 */}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                        className="page-link"
                        onClick={() => setPage(totalPages)}
                        aria-label="Last">
                        <span aria-hidden="true">&raquo;</span>
                    </button>
                </li>
            </>
        );
    };

    return (
        <div className="container" style={{marginTop: '90px'}}>

            <h1>카테고리 관리</h1>

            {/* 카테고리 생성 버튼 */}
            <button className="btn btn-primary mb-3" onClick={handleCreateCategory}>카테고리 생성</button>

            {/* 보기 옵션 선택 */}
            <select className="form-select mb-3" onChange={handleViewOptionChange} value={viewOption}>
                <option value={1}>옵션 1: 기본 뷰 (부모-자식)</option>
                <option value={2}>옵션 2: 전체 뷰 (Main Display Order 기준)</option>
            </select>

            {/* 옵션 1: 부모-자식 뷰 */}
            {viewOption === 1 && (
                <>
                    <h2>부모 카테고리</h2>
                    <table className="table table-striped table-bordered">
                        <thead>
                        <tr>
                            <th>수정</th>
                            <th>삭제</th>
                            <th>카테고리 이름</th>
                            <th>카테고리 이미지</th>
                            <th>정렬 순서(displayOrder)</th>
                            <th>메인 카테고리 정렬 순서(mainDisplayOrder)</th>
                        </tr>
                        </thead>
                        <tbody>
                        {paginatedCategories(parentCategories, parentPage, categoriesPerPage).map(category => (
                            <tr key={category.id} onClick={() => handleParentCategoryClick(category.id)}>
                                <td>
                                    <button className="btn btn-secondary" onClick={(e) => {
                                        e.stopPropagation();
                                        handleUpdateCategory(category.id);
                                    }}>수정
                                    </button>
                                </td>
                                <td>
                                    <button className="btn btn-danger" onClick={(e) => {
                                        e.stopPropagation();
                                        deleteCategory(category.id);
                                    }}>삭제
                                    </button>
                                </td>
                                <td>{category.name}</td>
                                <td>
                                    {category.imageUrl ?
                                        <img src={category.imageUrl} alt={category.name} className="img-fluid"
                                             style={{width: '50px'}}/> : 'x'}
                                </td>
                                <td>{category.displayOrder}</td>
                                <td>{category.mainDisplayOrder || 'x'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {/* 페이지네이션 */}
                    <nav aria-label="Page navigation example">
                        <ul className="pagination justify-content-center">
                            {renderPageButtons(parentPage, totalParentPages, setParentPage)}
                        </ul>
                    </nav>

                    {selectedParentId && (
                        <>
                            <h2>"{parentCategories.find(cat => cat.id === selectedParentId)?.name}"의 자식 카테고리</h2>
                            <table className="table table-striped table-bordered">
                                <thead>
                                <tr>
                                    <th>수정</th>
                                    <th>삭제</th>
                                    <th>카테고리 이름</th>
                                    <th>카테고리 이미지</th>
                                    <th>정렬 순서(displayOrder)</th>
                                    <th>메인 카테고리 정렬 순서(mainDisplayOrder)</th>
                                </tr>
                                </thead>
                                <tbody>
                                {paginatedCategories(childCategories, childPage, categoriesPerPage).map(category => (
                                    <tr key={category.id}>
                                        <td>
                                            <button className="btn btn-secondary"
                                                    onClick={() => handleUpdateCategory(category.id)}>수정
                                            </button>
                                        </td>
                                        <td>
                                            <button className="btn btn-danger"
                                                    onClick={() => deleteCategory(category.id)}>삭제
                                            </button>
                                        </td>
                                        <td>{category.name}</td>
                                        <td>
                                            {category.imageUrl ?
                                                <img src={category.imageUrl} alt={category.name} className="img-fluid"
                                                     style={{width: '50px'}}/> : 'x'}
                                        </td>
                                        <td>{category.displayOrder}</td>
                                        <td>{category.mainDisplayOrder || 'x'}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>

                            {/* 자식 카테고리 페이지네이션 */}
                            <nav aria-label="Page navigation example">
                                <ul className="pagination justify-content-center">
                                    {renderPageButtons(childPage, totalChildPages, setChildPage)}
                                </ul>
                            </nav>
                        </>
                    )}
                </>
            )}

            {/* 옵션 2: 전체 뷰 - Main Display Order */}
            {viewOption === 2 && (
                <>
                    <h2>전체 카테고리</h2>
                    <table className="table table-striped table-bordered">
                        <thead>
                        <tr>
                            <th>수정</th>
                            <th>삭제</th>
                            <th>카테고리 이름</th>
                            <th>카테고리 이미지</th>
                            <th>메인 카테고리 정렬 순서(mainDisplayOrder)</th>
                        </tr>
                        </thead>
                        <tbody>
                        {paginatedCategories(
                            categories.sort((a, b) => (a.mainDisplayOrder || Infinity) - (b.mainDisplayOrder || Infinity)),
                            parentPage,
                            categoriesPerPageOption2
                        ).map(category => (
                            <tr key={category.id}>
                                <td>
                                    <button className="btn btn-secondary"
                                            onClick={() => handleUpdateCategory(category.id)}>수정
                                    </button>
                                </td>
                                <td>
                                    <button className="btn btn-danger" onClick={() => deleteCategory(category.id)}>삭제
                                    </button>
                                </td>
                                <td>{category.name}</td>
                                <td>
                                    {category.imageUrl ?
                                        <img src={category.imageUrl} alt={category.name} className="img-fluid"
                                             style={{width: '50px'}}/> : 'x'}
                                </td>
                                <td>{category.mainDisplayOrder || 'x'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {/* 전체 보기 페이지네이션 */}
                    <nav aria-label="Page navigation example">
                        <ul className="pagination justify-content-center">
                            {renderPageButtons(parentPage, totalOption2Pages, setParentPage)}
                        </ul>
                    </nav>
                </>
            )}
        </div>
    );
};

export default CategoryAdminMain;
