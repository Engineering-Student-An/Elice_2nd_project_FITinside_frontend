// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import './CategoryAdminMain.css';
//
// const CategoryAdminMain = () => {
//     const [categories, setCategories] = useState([]);
//     const [selectedParentId, setSelectedParentId] = useState(null);
//     const [parentPage, setParentPage] = useState(1);
//     const [childPage, setChildPage] = useState(1);
//     const [viewOption, setViewOption] = useState(1);
//     const categoriesPerPage = 5;
//     const categoriesPerPageOption2 = 10;
//     const navigate = useNavigate();
//
//     const fetchCategories = async () => {
//         try {
//             const response = await axios.get('http://localhost:8080/api/categories', {
//                 headers: {
//                     'Authorization': `Bearer ${localStorage.getItem('token')}`
//                 },
//             });
//
//             const sortedCategories = response.data;
//
//             // 부모와 자식 카테고리를 displayOrder로 정렬하고 설정
//             const sortedParentCategories = sortedCategories
//                 .filter(category => category.parentId === null)
//                 .sort((a, b) => a.displayOrder - b.displayOrder);
//
//             const sortedChildCategories = sortedCategories
//                 .filter(category => category.parentId !== null)
//                 .sort((a, b) => a.displayOrder - b.displayOrder);
//
//             setCategories([...sortedParentCategories, ...sortedChildCategories]);
//         } catch (error) {
//             console.error('카테고리 목록을 가져오는 데 실패했습니다.', error);
//             if (error.response && error.response.status === 401) {
//                 alert("인증이 필요합니다. 로그인 상태를 확인하세요.");
//             }
//         }
//     };
//
//     const deleteCategory = async (categoryId) => {
//         const hasChildCategories = categories.some(category => category.parentId === categoryId);
//
//         if (hasChildCategories) {
//             alert("자식 카테고리가 있어 삭제가 불가능합니다.");
//             return;
//         }
//
//         const confirmDelete = window.confirm("이 카테고리를 삭제하시겠습니까?");
//         if (!confirmDelete) return;
//
//         try {
//             await axios.delete(`http://localhost:8080/api/admin/categories/${categoryId}`, {
//                 headers: {
//                     'Authorization': `Bearer ${localStorage.getItem('token')}`
//                 }
//             });
//             setCategories(categories.filter(category => category.id !== categoryId));
//             alert("카테고리가 삭제되었습니다.");
//             window.location.reload();
//         } catch (error) {
//             console.error('카테고리 삭제 중 오류가 발생했습니다.', error);
//             if (error.response && error.response.status === 401) {
//                 alert("인증이 필요합니다. 로그인 상태를 확인하세요.");
//             }
//         }
//     };
//
//     useEffect(() => {
//         fetchCategories();
//     }, []);
//
//     const parentCategories = categories.filter(category => category.parentId === null);
//     const childCategories = selectedParentId
//         ? categories.filter(category => category.parentId === selectedParentId)
//         : [];
//
//     const handleCreateCategory = () => {
//         navigate('/category-create');
//     };
//
//     const handleUpdateCategory = (categoryId) => {
//         navigate(`/category-update/${categoryId}`);
//     };
//
//     const handleParentCategoryClick = (parentId) => {
//         setSelectedParentId(parentId === selectedParentId ? null : parentId);
//         setChildPage(1);
//     };
//
//     const paginatedCategories = (categories, page, perPage) => {
//         const startIndex = (page - 1) * perPage;
//         return categories.slice(startIndex, startIndex + perPage);
//     };
//
//     const totalParentPages = Math.ceil(parentCategories.length / categoriesPerPage);
//     const totalChildPages = Math.ceil(childCategories.length / categoriesPerPage);
//     const totalOption2Pages = Math.ceil(categories.length / categoriesPerPageOption2);
//
//     const handleViewOptionChange = (e) => {
//         setViewOption(Number(e.target.value));
//     };
//
//     return (
//         <div className="category-admin-container">
//             <h1>카테고리 관리</h1>
//             <button className="create-button" onClick={handleCreateCategory}>카테고리 생성</button>
//
//             {/* 보기 옵션 선택 */}
//             <select onChange={handleViewOptionChange} value={viewOption}>
//                 <option value={1}>옵션 1: 기본 뷰 (부모-자식)</option>
//                 <option value={2}>옵션 2: 전체 뷰 (Main Display Order)</option>
//             </select>
//
//             {/* 옵션 1: 부모-자식 뷰 */}
//             {viewOption === 1 && (
//                 <>
//                     <h2>부모 카테고리</h2>
//                     <table className="category-table">
//                         <thead>
//                         <tr>
//                             <th>수정</th>
//                             <th>삭제</th>
//                             <th>카테고리 이름</th>
//                             <th>카테고리 이미지</th>
//                             <th>DISPLAY_ORDER</th>
//                             <th>MAIN_DISPLAY_ORDER</th>
//                         </tr>
//                         </thead>
//                         <tbody>
//                         {paginatedCategories(parentCategories, parentPage, categoriesPerPage).map(category => (
//                             <tr key={category.id} onClick={() => handleParentCategoryClick(category.id)}>
//                                 <td>
//                                     <button onClick={(e) => { e.stopPropagation(); handleUpdateCategory(category.id); }}>수정</button>
//                                 </td>
//                                 <td>
//                                     <button onClick={(e) => { e.stopPropagation(); deleteCategory(category.id); }} className="delete-button">삭제</button>
//                                 </td>
//                                 <td>{category.name}</td>
//                                 <td>
//                                     {category.imageUrl ? <img src={category.imageUrl} alt={category.name} className="category-image" /> : 'x'}
//                                 </td>
//                                 <td>{category.displayOrder}</td>
//                                 <td>{category.mainDisplayOrder || 'x'}</td>
//                             </tr>
//                         ))}
//                         </tbody>
//                     </table>
//                     <div className="pagination">
//                         <button onClick={() => setParentPage(Math.max(parentPage - 1, 1))} disabled={parentPage === 1}>이전</button>
//                         <span>{parentPage} / {totalParentPages}</span>
//                         <button onClick={() => setParentPage(Math.min(parentPage + 1, totalParentPages))} disabled={parentPage === totalParentPages}>다음</button>
//                     </div>
//
//                     {selectedParentId && (
//                         <>
//                             <h2>"{parentCategories.find(cat => cat.id === selectedParentId)?.name}"의 자식 카테고리</h2>
//                             <table className="category-table">
//                                 <thead>
//                                 <tr>
//                                     <th>수정</th>
//                                     <th>삭제</th>
//                                     <th>카테고리 이름</th>
//                                     <th>카테고리 이미지</th>
//                                     <th>DISPLAY_ORDER</th>
//                                     <th>MAIN_DISPLAY_ORDER</th>
//                                 </tr>
//                                 </thead>
//                                 <tbody>
//                                 {paginatedCategories(childCategories, childPage, categoriesPerPage).map(category => (
//                                     <tr key={category.id}>
//                                         <td>
//                                             <button onClick={() => handleUpdateCategory(category.id)}>수정</button>
//                                         </td>
//                                         <td>
//                                             <button onClick={() => deleteCategory(category.id)} className="delete-button">삭제</button>
//                                         </td>
//                                         <td>{category.name}</td>
//                                         <td>
//                                             {category.imageUrl ? <img src={category.imageUrl} alt={category.name} className="category-image" /> : 'x'}
//                                         </td>
//                                         <td>{category.displayOrder}</td>
//                                         <td>{category.mainDisplayOrder || 'x'}</td>
//                                     </tr>
//                                 ))}
//                                 </tbody>
//                             </table>
//                             <div className="pagination">
//                                 <button onClick={() => setChildPage(Math.max(childPage - 1, 1))} disabled={childPage === 1}>이전</button>
//                                 <span>{childPage} / {totalChildPages}</span>
//                                 <button onClick={() => setChildPage(Math.min(childPage + 1, totalChildPages))} disabled={childPage === totalChildPages}>다음</button>
//                             </div>
//                         </>
//                     )}
//                 </>
//             )}
//
//             {/* 옵션 2: 전체 뷰 - Main Display Order */}
//             {viewOption === 2 && (
//                 <>
//                     <h2>전체 카테고리</h2>
//                     <table className="category-table">
//                         <thead>
//                         <tr>
//                             <th>수정</th>
//                             <th>삭제</th>
//                             <th>카테고리 이름</th>
//                             <th>카테고리 이미지</th>
//                             <th>MAIN_DISPLAY_ORDER</th>
//                         </tr>
//                         </thead>
//                         <tbody>
//                         {paginatedCategories(
//                             categories.sort((a, b) => (a.mainDisplayOrder || Infinity) - (b.mainDisplayOrder || Infinity)),
//                             parentPage,
//                             categoriesPerPageOption2
//                         ).map(category => (
//                             <tr key={category.id}>
//                                 <td>
//                                     <button onClick={() => handleUpdateCategory(category.id)}>수정</button>
//                                 </td>
//                                 <td>
//                                     <button onClick={() => deleteCategory(category.id)} className="delete-button">삭제</button>
//                                 </td>
//                                 <td>{category.name}</td>
//                                 <td>
//                                     {category.imageUrl ? <img src={category.imageUrl} alt={category.name} className="category-image" /> : 'x'}
//                                 </td>
//                                 <td>{category.mainDisplayOrder || 'x'}</td>
//                             </tr>
//                         ))}
//                         </tbody>
//                     </table>
//                     <div className="pagination">
//                         <button onClick={() => setParentPage(Math.max(parentPage - 1, 1))} disabled={parentPage === 1}>이전</button>
//                         <span>{parentPage} / {totalOption2Pages}</span>
//                         <button onClick={() => setParentPage(Math.min(parentPage + 1, totalOption2Pages))} disabled={parentPage === totalOption2Pages}>다음</button>
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// };
//
// export default CategoryAdminMain;

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
            const response = await axios.get('http://localhost:8080/api/categories', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });

            const sortedCategories = response.data;

            // 부모와 자식 카테고리를 displayOrder로 정렬하고 설정
            const sortedParentCategories = sortedCategories
                .filter(category => category.parentId === null)
                .sort((a, b) => a.displayOrder - b.displayOrder);

            const sortedChildCategories = sortedCategories
                .filter(category => category.parentId !== null)
                .sort((a, b) => a.displayOrder - b.displayOrder);

            setCategories([...sortedParentCategories, ...sortedChildCategories]);
        } catch (error) {
            try{
                await sendRefreshTokenAndStoreAccessToken();
                const response = await axios.get('http://localhost:8080/api/categories', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                });

                const sortedCategories = response.data;

                // 부모와 자식 카테고리를 displayOrder로 정렬하고 설정
                const sortedParentCategories = sortedCategories
                    .filter(category => category.parentId === null)
                    .sort((a, b) => a.displayOrder - b.displayOrder);

                const sortedChildCategories = sortedCategories
                    .filter(category => category.parentId !== null)
                    .sort((a, b) => a.displayOrder - b.displayOrder);

                setCategories([...sortedParentCategories, ...sortedChildCategories]);
            } catch (error){
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
            await axios.delete(`http://localhost:8080/api/admin/categories/${categoryId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setCategories(categories.filter(category => category.id !== categoryId));
            alert("카테고리가 삭제되었습니다.");
            window.location.reload();
        } catch (error) {
            try{
                await sendRefreshTokenAndStoreAccessToken();
                const hasChildCategories = categories.some(category => category.parentId === categoryId);

                if (hasChildCategories) {
                    alert("자식 카테고리가 있어 삭제가 불가능합니다.");
                    return;
                }

                const confirmDelete = window.confirm("이 카테고리를 삭제하시겠습니까?");
                await axios.delete(`http://localhost:8080/api/admin/categories/${categoryId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setCategories(categories.filter(category => category.id !== categoryId));
                alert("카테고리가 삭제되었습니다.");
                window.location.reload();

            } catch(error) {
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

    return (
        <div className="container" style={{marginTop: '90px'}}>

            <h1>카테고리 관리</h1>

            {/* 카테고리 생성 버튼 */}
            <button className="btn btn-primary mb-3" onClick={handleCreateCategory}>카테고리 생성</button>

            {/* 보기 옵션 선택 */}
            <select className="form-select mb-3" onChange={handleViewOptionChange} value={viewOption}>
                <option value={1}>옵션 1: 기본 뷰 (부모-자식)</option>
                <option value={2}>옵션 2: 전체 뷰 (Main Display Order)</option>
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
                            <th>DISPLAY_ORDER</th>
                            <th>MAIN_DISPLAY_ORDER</th>
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
                    <nav aria-label="Page navigation">
                        <ul className="pagination justify-content-center">
                            <li className={`page-item ${parentPage === 1 ? 'disabled' : ''}`}>
                                <button className="page-link"
                                        onClick={() => setParentPage(Math.max(parentPage - 1, 1))}>이전
                                </button>
                            </li>
                            <li className="page-item">
                                <span className="page-link">{parentPage} / {totalParentPages}</span>
                            </li>
                            <li className={`page-item ${parentPage === totalParentPages ? 'disabled' : ''}`}>
                                <button className="page-link"
                                        onClick={() => setParentPage(Math.min(parentPage + 1, totalParentPages))}>다음
                                </button>
                            </li>
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
                                    <th>DISPLAY_ORDER</th>
                                    <th>MAIN_DISPLAY_ORDER</th>
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
                            <nav aria-label="Page navigation">
                                <ul className="pagination justify-content-center">
                                    <li className={`page-item ${childPage === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link"
                                                onClick={() => setChildPage(Math.max(childPage - 1, 1))}>이전
                                        </button>
                                    </li>
                                    <li className="page-item">
                                        <span className="page-link">{childPage} / {totalChildPages}</span>
                                    </li>
                                    <li className={`page-item ${childPage === totalChildPages ? 'disabled' : ''}`}>
                                        <button className="page-link"
                                                onClick={() => setChildPage(Math.min(childPage + 1, totalChildPages))}>다음
                                        </button>
                                    </li>
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
                            <th>MAIN_DISPLAY_ORDER</th>
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
                    <nav aria-label="Page navigation">
                        <ul className="pagination justify-content-center">
                            <li className={`page-item ${parentPage === 1 ? 'disabled' : ''}`}>
                                <button className="page-link"
                                        onClick={() => setParentPage(Math.max(parentPage - 1, 1))}>이전
                                </button>
                            </li>
                            <li className="page-item">
                                <span className="page-link">{parentPage} / {totalOption2Pages}</span>
                            </li>
                            <li className={`page-item ${parentPage === totalOption2Pages ? 'disabled' : ''}`}>
                                <button className="page-link"
                                        onClick={() => setParentPage(Math.min(parentPage + 1, totalOption2Pages))}>다음
                                </button>
                            </li>
                        </ul>
                    </nav>
                </>
            )}
        </div>
    );
};

export default CategoryAdminMain;
