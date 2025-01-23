import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import sendRefreshTokenAndStoreAccessToken from "../auth/RefreshAccessToken"; // Bootstrap CSS 추가

const CategoryUpdate = () => {
    const [name, setName] = useState('');
    const [displayOrder, setDisplayOrder] = useState('');
    const [mainDisplayOrder, setMainDisplayOrder] = useState(''); // 메인 화면 표시 순서 추가
    const [parentId, setParentId] = useState(null);
    const [parentCategories, setParentCategories] = useState([]);
    const [image, setImage] = useState(null);
    const [previewImageUrl, setPreviewImageUrl] = useState(null); // 이미지 미리보기 URL 추가
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        // 부모 카테고리 목록 가져오기
        axios.get('/api/categories', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(response => {
                const filteredParentCategories = response.data.filter(category => category.parentId === null);
                setParentCategories(filteredParentCategories);
            })
            .catch(async error => {
                try {
                    await sendRefreshTokenAndStoreAccessToken();
                    axios.get('/api/categories', {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    })
                        .then(response => {
                            const filteredParentCategories = response.data.filter(category => category.parentId === null);
                            setParentCategories(filteredParentCategories);
                        })

                } catch (error) {
                    console.error('Error fetching categories:', error);
                    if (error.response && error.response.status === 401) {
                        alert("인증이 필요합니다. 로그인 상태를 확인하세요.");
                    }
                }
            });

        // 선택된 카테고리 정보 가져오기
        axios.get(`/api/categories/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(response => {
                const category = response.data;
                setName(category.name);
                setDisplayOrder(category.displayOrder);
                setMainDisplayOrder(category.mainDisplayOrder || ''); // 메인 표시 순서 초기값 설정
                setParentId(category.parentId || null);
                setPreviewImageUrl(category.imageUrl || null); // 기존 이미지 URL 설정
                setLoading(false);
            })
            .catch(async error => {
                try {
                    await sendRefreshTokenAndStoreAccessToken();
                    axios.get(`/api/categories/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    })
                        .then(response => {
                            const category = response.data;
                            setName(category.name);
                            setDisplayOrder(category.displayOrder);
                            setMainDisplayOrder(category.mainDisplayOrder || ''); // 메인 표시 순서 초기값 설정
                            setParentId(category.parentId || null);
                            setPreviewImageUrl(category.imageUrl || null); // 기존 이미지 URL 설정
                            setLoading(false);
                        })
                } catch (error) {
                    console.error('Error fetching category data:', error);
                    setError('카테고리 정보를 불러오는 중 오류가 발생했습니다.');
                    if (error.response && error.response.status === 401) {
                        alert("인증이 필요합니다. 로그인 상태를 확인하세요.");
                    }
                }
                setLoading(false);
            });
    }, [id]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        setPreviewImageUrl(URL.createObjectURL(file)); // 이미지 미리보기 URL 생성
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // displayOrder와 mainDisplayOrder가 1 이상인지 확인
        if (displayOrder < 1) {
            alert('표시 순서는 1 이상의 값이어야 합니다.');
            return;
        }

        if (mainDisplayOrder !== '' && mainDisplayOrder < 1) {
            alert('메인 카테고리 정렬 순서는 1 이상의 값이어야 합니다.');
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('displayOrder', displayOrder ? Number(displayOrder) : null);
        // mainDisplayOrder가 빈칸이 아닐 때만 추가
        if (mainDisplayOrder !== '') {
            formData.append('mainDisplayOrder', Number(mainDisplayOrder));
        }
        if (parentId) formData.append('parentId', parentId);
        if (image) formData.append('imageFile', image);

        axios.put(`/api/admin/categories/${id}`, formData, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(response => {
                console.log('Category updated:', response.data);
                alert('카테고리가 성공적으로 수정되었습니다.');
                navigate('/admin/categories');
            })
            .catch(async error => {
                try {
                    await sendRefreshTokenAndStoreAccessToken();
                    e.preventDefault();

                    // displayOrder와 mainDisplayOrder가 1 이상인지 확인
                    if (displayOrder < 1) {
                        alert('표시 순서는 1 이상의 값이어야 합니다.');
                        return;
                    }

                    if (mainDisplayOrder !== '' && mainDisplayOrder < 1) {
                        alert('메인 카테고리 정렬 순서는 1 이상의 값이어야 합니다.');
                        return;
                    }

                    const formData = new FormData();
                    formData.append('name', name);
                    formData.append('displayOrder', displayOrder ? Number(displayOrder) : null);
                    // mainDisplayOrder가 빈칸이 아닐 때만 추가
                    if (mainDisplayOrder !== '') {
                        formData.append('mainDisplayOrder', Number(mainDisplayOrder));
                    }
                    if (parentId) formData.append('parentId', parentId);
                    if (image) formData.append('imageFile', image);

                    axios.put(`/api/admin/categories/${id}`, formData, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    })
                        .then(response => {
                            console.log('Category updated:', response.data);
                            alert('카테고리가 성공적으로 수정되었습니다.');
                            navigate('/admin/categories');
                        })
                } catch(error) {
                    console.error('Error updating category:', error);
                    alert('카테고리 수정 중 오류가 발생했습니다.');
                    if (error.response && error.response.status === 401) {
                        alert("인증이 필요합니다. 로그인 상태를 확인하세요.");
                    }
                }
            });
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">카테고리 수정</h2>
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
                    <label className="form-label">정렬 순서(displayOrder):</label>
                    <input
                        type="number"
                        className="form-control"
                        value={displayOrder}
                        onChange={(e) => setDisplayOrder(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">메인 카테고리 정렬 순서(mainDisplayOrder):</label>
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
                        disabled // 선택할 수 없도록 disabled 속성 추가
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
                    <label className="form-label">카테고리 이미지:</label>
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
                                style={{ maxWidth: '300px', borderRadius: '8px' }}
                            />
                        </div>
                    )}
                </div>
                <button type="submit" className="btn btn-primary">카테고리 수정</button>
            </form>
        </div>
    );
};

export default CategoryUpdate;
