// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
//
// const CategoryCreate = () => {
//     const [name, setName] = useState('');
//     const [displayOrder, setDisplayOrder] = useState('');
//     const [mainDisplayOrder, setMainDisplayOrder] = useState('');
//     const [parentId, setParentId] = useState(null);
//     const [imageFile, setImageFile] = useState(null);
//     const [previewImageUrl, setPreviewImageUrl] = useState(null);
//     const [parentCategories, setParentCategories] = useState([]);
//
//     const navigate = useNavigate();
//
//     useEffect(() => {
//         axios.get('http://localhost:8080/api/categories', {
//             headers: {
//                 'Authorization': `Bearer ${localStorage.getItem('token')}`
//             }
//         })
//             .then(response => {
//                 const parentCategories = response.data.filter(category => category.parentId === null);
//                 setParentCategories(parentCategories);
//             })
//             .catch(error => {
//                 console.error('Error fetching categories:', error);
//                 if (error.response && error.response.status === 401) {
//                     alert("인증이 필요합니다. 로그인 상태를 확인하세요.");
//                 }
//             });
//     }, []);
//
//     const handleImageChange = (e) => {
//         const file = e.target.files[0];
//         setImageFile(file);
//         setPreviewImageUrl(URL.createObjectURL(file));
//     };
//
//     const handleSubmit = (e) => {
//         e.preventDefault();
//
//         const formData = new FormData();
//         formData.append('name', name);
//         formData.append('displayOrder', displayOrder ? Number(displayOrder) : null);
//
//         // mainDisplayOrder가 빈칸이 아닐 때만 추가
//         if (mainDisplayOrder !== '') {
//             formData.append('mainDisplayOrder', Number(mainDisplayOrder));
//         }
//
//         if (parentId) formData.append('parentId', parentId);
//         if (imageFile) formData.append('imageFile', imageFile);
//
//         axios.post('http://localhost:8080/api/admin/categories', formData, {
//             headers: {
//                 'Authorization': `Bearer ${localStorage.getItem('token')}`,
//                 'Content-Type': 'multipart/form-data'
//             }
//         })
//             .then(() => {
//                 navigate('/admin/categories');
//                 window.location.reload();
//             })
//             .catch(error => {
//                 console.error('Error creating category:', error);
//                 if (error.response && error.response.status === 401) {
//                     alert("인증이 필요합니다. 로그인 상태를 확인하세요.");
//                 }
//             });
//     };
//
//     return (
//         <div className="category-create-container">
//             <h2>카테고리 생성</h2>
//             <form onSubmit={handleSubmit}>
//                 <div className="form-group">
//                     <label>이름:</label>
//                     <input
//                         type="text"
//                         value={name}
//                         onChange={(e) => setName(e.target.value)}
//                         required
//                     />
//                 </div>
//                 <div className="form-group">
//                     <label>표시 순서:</label>
//                     <input
//                         type="number"
//                         value={displayOrder}
//                         onChange={(e) => setDisplayOrder(e.target.value)}
//                     />
//                 </div>
//                 <div className="form-group">
//                     <label>메인 카테고리 정렬 순서:</label>
//                     <input
//                         type="number"
//                         value={mainDisplayOrder}
//                         onChange={(e) => setMainDisplayOrder(e.target.value)}
//                     />
//                 </div>
//                 <div className="form-group">
//                     <label>부모 카테고리 선택:</label>
//                     <select
//                         value={parentId || ''}
//                         onChange={(e) => setParentId(e.target.value || null)}
//                     >
//                         <option value="">부모 카테고리 없음</option>
//                         {parentCategories.map((category) => (
//                             <option key={category.id} value={category.id}>
//                                 {category.name}
//                             </option>
//                         ))}
//                     </select>
//                 </div>
//                 <div className="form-group">
//                     <label>이미지 파일:</label>
//                     <input
//                         type="file"
//                         accept="image/*"
//                         onChange={handleImageChange}
//                     />
//                     {previewImageUrl && (
//                         <div className="image-preview">
//                             <img src={previewImageUrl} alt="Preview"
//                                  style={{ width: '100px', marginTop: '10px', borderRadius: '8px' }}
//                             />
//                         </div>
//                     )}
//                 </div>
//                 <button type="submit" className="submit-button">카테고리 생성</button>
//             </form>
//         </div>
//     );
// };
//
// export default CategoryCreate;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import sendRefreshTokenAndStoreAccessToken from "../auth/RefreshAccessToken"; // Bootstrap CSS 추가

const CategoryCreate = () => {
    const [name, setName] = useState('');
    const [displayOrder, setDisplayOrder] = useState('');
    const [mainDisplayOrder, setMainDisplayOrder] = useState('');
    const [parentId, setParentId] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [previewImageUrl, setPreviewImageUrl] = useState(null);
    const [parentCategories, setParentCategories] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:8080/api/categories', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(response => {
                const parentCategories = response.data.filter(category => category.parentId === null);
                setParentCategories(parentCategories);
            })
            .catch(async error => {
                try {
                    await sendRefreshTokenAndStoreAccessToken();
                    // window.location.reload();
                } catch (e) {
                    console.error('Error fetching categories:', error);
                    if (error.response && error.response.status === 401) {
                        alert("인증이 필요합니다. 로그인 상태를 확인하세요.");
                    }
                }
            });
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        setPreviewImageUrl(URL.createObjectURL(file));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', name);
        formData.append('displayOrder', displayOrder ? Number(displayOrder) : null);

        // mainDisplayOrder가 빈칸이 아닐 때만 추가
        if (mainDisplayOrder !== '') {
            formData.append('mainDisplayOrder', Number(mainDisplayOrder));
        }

        if (parentId) formData.append('parentId', parentId);
        if (imageFile) formData.append('imageFile', imageFile);

        axios.post('http://localhost:8080/api/admin/categories', formData, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(() => {
                navigate('/admin/categories');
                window.location.reload();
            })
            .catch(async error => {
                try {
                    await sendRefreshTokenAndStoreAccessToken();
                    // window.location.reload();
                } catch (e) {
                    console.error('Error creating category:', error);
                    if (error.response && error.response.status === 401) {
                        alert("인증이 필요합니다. 로그인 상태를 확인하세요.");
                    }
                }
            });
    };



    return (
        <div className="container mt-5">
            <h2 className="mb-4">카테고리 생성</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">이름:</label>
                    <input
                        type="text"
                        className="form-control"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">표시 순서:</label>
                    <input
                        type="number"
                        className="form-control"
                        value={displayOrder}
                        onChange={(e) => setDisplayOrder(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">메인 카테고리 정렬 순서:</label>
                    <input
                        type="number"
                        className="form-control"
                        value={mainDisplayOrder}
                        onChange={(e) => setMainDisplayOrder(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">부모 카테고리 선택:</label>
                    <select
                        className="form-select"
                        value={parentId || ''}
                        onChange={(e) => setParentId(e.target.value || null)}
                    >
                        <option value="">부모 카테고리 없음</option>
                        {parentCategories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">이미지 파일:</label>
                    <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    {previewImageUrl && (
                        <div className="mt-3">
                            <img
                                src={previewImageUrl}
                                alt="미리보기"
                                className="img-fluid"
                                style={{ maxWidth: '100px', borderRadius: '8px' }}
                            />
                        </div>
                    )}
                </div>
                <button type="submit" className="btn btn-primary">카테고리 생성</button>
            </form>
        </div>
    );
};

export default CategoryCreate;
